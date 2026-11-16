package com.travelhub.integration;

import com.travelhub.config.VnPayConfig;
import com.travelhub.entity.Booking;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.repository.BookingRepository;
import com.travelhub.service.VnPayService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@SpringBootTest
@Transactional
public class VnPayCallbackTest {

    @Autowired
    private VnPayService vnPayService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VnPayConfig vnPayConfig;

    @Test
    public void testVnPaySuccessCallback() {
        System.out.println("==============================================");
        System.out.println(" BẮT ĐẦU TEST LUỒNG VNPay CALLBACK THÀNH CÔNG");
        System.out.println("==============================================");

        // 1. TẠO MỘT BOOKING GIẢ LẬP ĐANG Ở TRẠNG THÁI CHƯA THANH TOÁN (UNPAID)
        // (Lưu ý: Trong test này ta dùng Booking có sẵn hoặc tạo nhanh 1 cái qua Repository nếu cần,
        // nhưng ở đây ta có thể dùng trực tiếp mã đơn BK-202410-001 từ dữ liệu mẫu SQL của bạn)
        String testBookingCode = "BK-202410-001"; 
        Booking booking = bookingRepository.findBookingByBookingCode(testBookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng mẫu trong DB"));

        // Đảm bảo ban đầu đơn đang UNPAID
        booking.setPaymentStatus(PaymentStatus.UNPAID);
        booking.setBookingStatus(BookingStatus.PENDING);
        bookingRepository.save(booking);
        System.out.println("1. Đơn hàng " + testBookingCode + " đang ở trạng thái: " + booking.getPaymentStatus());

        // 2. GIẢ LẬP CÁC THAM SỐ MÀ VNPAY TRẢ VỀ TRÊN URL CALLBACK
        Map<String, String> queryParams = new HashMap<>();
        queryParams.put("vnp_Amount", String.valueOf(booking.getTotalAmount().longValue() * 100));
        queryParams.put("vnp_BankCode", "NCB");
        queryParams.put("vnp_BankTranNo", "VNP12345678");
        queryParams.put("vnp_ResponseCode", "00"); // Mã "00" nghĩa là thanh toán thành công phía VNPay
        queryParams.put("vnp_TmnCode", vnPayConfig.vnp_TmnCode);
        queryParams.put("vnp_TransactionNo", "88888888");
        queryParams.put("vnp_TxnRef", testBookingCode);
        queryParams.put("vnp_PayDate", "20261021150000");

        // 3. TÍNH TOÁN LẠI CHỮ KÝ vnp_SecureHash Y HỆT NHƯ CÁCH VNPAY GỬI SANG
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
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        String secureHash = VnPayConfig.hmacSHA512(vnPayConfig.vnp_HashSecret, hashData.toString());
        queryParams.put("vnp_SecureHash", secureHash);

        System.out.println("2. Đã giả lập xong chữ ký bảo mật VNPay SecureHash.");

        // 4. GỌI HÀM XỬ LÝ CALLBACK CỦA HỆ THỐNG
        System.out.println("3. Đang gọi hàm xử lý callback VNPay...");
        boolean isSuccess = vnPayService.processPaymentCallback(queryParams);

        // 5. KIỂM TRA KẾT QUẢ
        Assertions.assertTrue(isSuccess);
        System.out.println("   => Hàm callback trả về kết quả: THÀNH CÔNG (true)");

        // Lấy lại thông tin đơn hàng từ DB để kiểm tra trạng thái đã đổi chưa
        Booking updatedBooking = bookingRepository.findBookingByBookingCode(testBookingCode).get();
        
        Assertions.assertEquals(PaymentStatus.PAID, updatedBooking.getPaymentStatus());
        Assertions.assertEquals(BookingStatus.CONFIRMED, updatedBooking.getBookingStatus());

        System.out.println("4. Trạng thái thanh toán mới của đơn hàng: " + updatedBooking.getPaymentStatus());
        System.out.println("5. Trạng thái đơn hàng mới: " + updatedBooking.getBookingStatus());
        System.out.println("==============================================");
        System.out.println(" TEST LUỒNG VNPAY CALLBACK THÀNH CÔNG (100%) ");
        System.out.println("==============================================");
    }
}