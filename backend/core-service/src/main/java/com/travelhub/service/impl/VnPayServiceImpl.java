package com.travelhub.service.impl;

import com.travelhub.config.VnPayConfig;
import com.travelhub.dto.message.NotificationSendRequest;
import com.travelhub.entity.Booking;
import com.travelhub.entity.Payment;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.NotificationType;
import com.travelhub.enums.PaymentMethod;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.enums.PaymentType;
import com.travelhub.enums.TransactionStatus;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.PaymentRepository;
import com.travelhub.service.NotificationService;
import com.travelhub.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VnPayServiceImpl implements VnPayService {

    private final VnPayConfig vnPayConfig;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public String createPaymentUrl(Long bookingId, HttpServletRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt tour với ID: " + bookingId));

        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Đơn đặt này đã được thanh toán rồi!");
        }

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Đơn đặt này đã bị hủy, không thể thanh toán!");
        }

        long amount = booking.getTotalAmount().longValue() * 100;

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", booking.getBookingCode());
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + booking.getBookingCode());
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", VnPayConfig.getIpAddress(request));

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Sắp xếp các key theo thứ tự alphabet (Bắt buộc đối với VNPay)
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                try {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));

                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));

                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayConfig.hmacSHA512(vnPayConfig.vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnPayConfig.vnp_PayUrl + "?" + queryUrl;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean processPaymentCallback(Map<String, String> requestParams) {
        // Tạo một HashMap mới từ params nhận được để tránh lỗi unmodifiable map
        Map<String, String> queryParams = new HashMap<>(requestParams);

        if (!queryParams.containsKey("vnp_SecureHash")) {
            return false;
        }

        String vnp_SecureHash = queryParams.get("vnp_SecureHash");
        
        // Loại bỏ các tham số không đưa vào thuật toán băm chữ ký
        queryParams.remove("vnp_SecureHash");
        queryParams.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(queryParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = queryParams.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                try {
                    hashData.append(fieldName);
                    hashData.append('=');
                    // Sử dụng UTF-8 khớp với lúc tạo URL
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        String calculatedHash = VnPayConfig.hmacSHA512(vnPayConfig.vnp_HashSecret, hashData.toString());

        // Kiểm tra chữ ký bảo mật
        if (!calculatedHash.equalsIgnoreCase(vnp_SecureHash)) {
            System.err.println("[VNPAY ERROR] Chữ ký không hợp lệ! Calculated: " + calculatedHash + " | Received: " + vnp_SecureHash);
            return false;
        }

        String responseCode = queryParams.get("vnp_ResponseCode");
        String bookingCode = queryParams.get("vnp_TxnRef");
        String transactionNo = queryParams.get("vnp_TransactionNo");

        Booking booking = bookingRepository.findBookingByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với mã: " + bookingCode));

        // Tránh xử lý trùng lặp nếu callback gọi nhiều lần
        if (booking.getPaymentStatus() == PaymentStatus.PAID || paymentRepository.existsByTransactionCode("VNP-" + transactionNo)) {
            return true;
        }

        if ("00".equals(responseCode)) {
            // Thanh toán thành công
            booking.setPaymentStatus(PaymentStatus.PAID);
            booking.setBookingStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            Payment payment = Payment.builder()
                    .booking(booking)
                    .transactionCode("VNP-" + transactionNo)
                    .amount(booking.getTotalAmount())
                    .paymentMethod(PaymentMethod.VNPAY)
                    .paymentType(PaymentType.FULL_PAYMENT)
                    .gatewayResponseCode(responseCode)
                    .paymentTime(LocalDateTime.now())
                    .status(TransactionStatus.SUCCESS)
                    .build();
            paymentRepository.save(payment);
            notificationService.sendAndSaveNotification(NotificationSendRequest.builder()
                    .recipientUserId(booking.getUser().getId())
                    .title("Thanh toán thành công \uD83D\uDCB8")
                    .content("Đơn hàng " + booking.getBookingCode() + " đã thanh toán qua VNPay thành công.")
                    .type(NotificationType.PAYMENT_SUCCESS)
                    .referenceId(booking.getBookingCode())
                    .referenceUrl("/my-bookings")
                    .destinationTopic("/queue/notifications")
                    .build());
             notificationService.sendAndSaveNotification(NotificationSendRequest.builder()
                    .title("Đơn hàng thanh toán thành công 💰")
                    .content("Đơn hàng " + booking.getBookingCode() + " vừa thanh toán thành công " + String.format("%,.0f", booking.getTotalAmount()) + " VNĐ qua VNPay.")
                    .type(NotificationType.PAYMENT_SUCCESS)
                    .referenceId(booking.getBookingCode())
                    .referenceUrl("/admin/bookings")
                    .destinationTopic("/topic/admin/notifications")
                    .build());
            return true;
        } else {
            // Thanh toán thất bại hoặc bị hủy
            Payment payment = Payment.builder()
                    .booking(booking)
                    .transactionCode("VNP-" + (transactionNo != null && !transactionNo.equals("0") ? transactionNo : UUID.randomUUID().toString().substring(0, 8)))
                    .amount(booking.getTotalAmount())
                    .paymentMethod(PaymentMethod.VNPAY)
                    .paymentType(PaymentType.FULL_PAYMENT)
                    .gatewayResponseCode(responseCode)
                    .paymentTime(LocalDateTime.now())
                    .status(TransactionStatus.FAILED)
                    .build();
            paymentRepository.save(payment);


            return false;
        }
    }
}