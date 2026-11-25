package com.travelhub.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.config.RabbitMQConfig;
import com.travelhub.dto.message.BookingEmailMessage;
import com.travelhub.dto.request.BookingCreateRequest;
import com.travelhub.dto.filter.BookingFilterRequest;
import com.travelhub.dto.message.NotificationSendRequest;
import com.travelhub.dto.request.PassengerRequest;
import com.travelhub.dto.response.BookingResponse;
import com.travelhub.dto.common.PageResponse;
import com.travelhub.entity.Booking;
import com.travelhub.entity.BookingPassenger;
import com.travelhub.entity.Promotion;
import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.TourPickupPoint;
import com.travelhub.entity.User;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.enums.DiscountType;
import com.travelhub.enums.NotificationType;
import com.travelhub.enums.PassengerType;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.repository.BookingPassagerRepository;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.PromotionRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourPickupPointRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.service.BookingService;
import com.travelhub.service.EmailService;
import com.travelhub.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingPassagerRepository bookingPassengerRepository;
    private final UserRepository userRepository;
    private final TourDepartureRepository tourDepartureRepository;
    private final PromotionRepository promotionRepository;
    private final EmailService emailService;
    private final TourPickupPointRepository tourPickupPointRepository;
    private final NotificationService notificationService;
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        return BookingResponse.fromEntity(findBookingEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        return BookingResponse.fromEntity(bookingRepository.findBookingByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt chỗ với mã: " + bookingCode)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUserId(Long userId) {
        if (userRepository.findById(userId).isEmpty()) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + userId);
        }
        return bookingRepository.findAllByUserId(userId).stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BookingResponse createBooking(BookingCreateRequest request) {

        // 1. Tìm User và Đợt khởi hành
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + request.getUserId()));
        
        TourDeparture tourDeparture = tourDepartureRepository.findByWithLock(request.getDepartureId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khởi hành với ID: " + request.getDepartureId()));

        // Chặn đặt các chuyến đi đã khởi hành trong quá khứ
        if (tourDeparture.getDepartureDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Chuyến đi này đã khởi hành, không thể đặt thêm vé.");
        }
        
        // Chặn đặt các chuyến đi đã ĐÓNG hoặc bị HỦY
        if (tourDeparture.getStatus() != DepartureStatus.OPEN) {
            throw new RuntimeException("Đợt khởi hành này hiện không mở bán (đã đóng hoặc bị hủy).");
        }

        // 2. Kiểm tra tồn kho ghế
        int totalGuest = request.getPassengers().size();
        if (totalGuest > tourDeparture.getAvailableSeats()) {
            throw new RuntimeException("Số lượng hành khách vượt quá số ghế trống của đợt khởi hành.");
        }

        // 3. Trừ ghế trong kho và cập nhật trạng thái nếu hết ghế
        tourDeparture.setAvailableSeats(tourDeparture.getAvailableSeats() - totalGuest);
        if (tourDeparture.getAvailableSeats() == 0) {
            tourDeparture.setStatus(DepartureStatus.SOLD_OUT);
        }
        tourDepartureRepository.save(tourDeparture);

        // 4. Kiểm tra khuyến mãi (nếu có)
        Promotion promotion = null;
        if (request.getPromotionCode() != null && !request.getPromotionCode().trim().isEmpty()) {
            promotion = promotionRepository.findByCode(request.getPromotionCode().trim())
                    .orElseThrow(() -> new RuntimeException("Mã khuyến mãi không tồn tại."));
            
            if (promotion.getValidFrom().isAfter(LocalDateTime.now())
                    || promotion.getValidTo().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Mã khuyến mãi không còn hiệu lực.");
            }
            if (promotion.getUsageLimit() != null && promotion.getUsedCount() >= promotion.getUsageLimit()) {
                throw new RuntimeException("Mã khuyến mãi đã đạt giới hạn sử dụng.");
            }
            if (Boolean.FALSE.equals(promotion.getIsActive())) {
                throw new RuntimeException("Mã khuyến mãi không còn hiệu lực.");
            }
        }

        // Kiểm tra điểm đón khách (nếu có)
        TourPickupPoint pickupPoint = null;
        if (request.getPickupPointId() != null) {
            pickupPoint = tourPickupPointRepository.findById(request.getPickupPointId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy điểm đón khách với ID: " + request.getPickupPointId()));
            if (!pickupPoint.getDeparture().getId().equals(tourDeparture.getId())) {
                throw new RuntimeException("Điểm đón khách không phù hợp với chuyến đi.");
            }
        }

        // 5. TẠO VÀ LƯU HÓA ĐƠN TRƯỚC (Để lấy ID cấp cho hành khách)
        String bookingCode = "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(user)
                .departure(tourDeparture)
                .promotion(promotion)
                .contactName(request.getContactName().trim())
                .contactPhone(request.getContactPhone().trim())
                .contactEmail(request.getContactEmail().trim())
                .contactAddress(request.getContactAddress())
                .specialRequests(request.getSpecialRequests())
                .totalPassengers(totalGuest)
                .totalAmount(BigDecimal.ZERO) // Tạm gán 0, tính xong cập nhật lại
                .bookingStatus(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .pickupPoint(pickupPoint)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // 6. Duyệt danh sách và tính tiền từng hành khách
        BigDecimal subTotal = BigDecimal.ZERO;
        for (PassengerRequest passenger : request.getPassengers()) {
            BigDecimal price = (passenger.getPassengerType() != PassengerType.ADULT)
                    ? tourDeparture.getChildPrice()
                    : tourDeparture.getAdultPrice();

            if (passenger.isRequiresSingleRoom() && tourDeparture.getSingleRoomSupplement() != null) {
                price = price.add(tourDeparture.getSingleRoomSupplement());
            }

            BookingPassenger bookingPassenger = bookingPassengerRepository.save(BookingPassenger.builder()
                    .booking(savedBooking)
                    .fullName(passenger.getFullName().trim())
                    .passengerType(passenger.getPassengerType())
                    .gender(passenger.getGender())
                    .birthDate(passenger.getBirthDate())
                    .idCardOrPassport(passenger.getIdCardOrPassport())
                    .requiresSingleRoom(passenger.isRequiresSingleRoom())
                    .price(price)
                    .build());
            
            savedBooking.getPassengers().add(bookingPassenger);
            subTotal = subTotal.add(price);
        }

        // 7. Tính tiền giảm giá
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (promotion != null) {
            if (subTotal.compareTo(promotion.getMinOrderAmount()) < 0) {
                throw new RuntimeException("Tổng giá trị đơn hàng chưa đạt mức tối thiểu để áp dụng mã khuyến mãi.");
            }
            if (promotion.getDiscountType() == DiscountType.PERCENTAGE) {
                discountAmount = subTotal.multiply(promotion.getDiscountValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                if (promotion.getMaxDiscountAmount() != null
                        && discountAmount.compareTo(promotion.getMaxDiscountAmount()) > 0) {
                    discountAmount = promotion.getMaxDiscountAmount();
                }
            } else if (promotion.getDiscountType() == DiscountType.FIXED_AMOUNT) {
                discountAmount = promotion.getDiscountValue();
            }
            promotion.setUsedCount(promotion.getUsedCount() + 1);
            promotionRepository.save(promotion);
        }

        BigDecimal finalTotal = subTotal.subtract(discountAmount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalTotal = BigDecimal.ZERO;
        }

        savedBooking.setTotalAmount(finalTotal);
        bookingRepository.save(savedBooking);

        // 8. Gửi email xác nhận đặt tour bất đồng bộ qua RabbitMQ
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String depDateStr = tourDeparture.getDepartureDate() != null
                ? tourDeparture.getDepartureDate().format(formatter)
                : "";
        String retDateStr = tourDeparture.getReturnDate() != null 
                ? tourDeparture.getReturnDate().format(formatter)
                : "";

        BookingEmailMessage emailMsg = BookingEmailMessage.builder()
                .contactEmail(savedBooking.getContactEmail())
                .contactName(savedBooking.getContactName())
                .bookingCode(savedBooking.getBookingCode())
                .tourName(tourDeparture.getTour().getName())
                .departureDate(depDateStr)
                .returnDate(retDateStr)
                .totalPassengers(savedBooking.getTotalPassengers())
                .totalAmount(savedBooking.getTotalAmount())
                .build();
        rabbitTemplate.convertAndSend(RabbitMQConfig.BOOKING_EMAIL_QUEUE, emailMsg);

        // 9. Bắn thông báo Real-time cho Admin
        notificationService.sendAndSaveNotification(NotificationSendRequest.builder()
                .title("Có đơn đặt tour mới 🎉")
                .content("Khách hàng " + savedBooking.getContactName() + " vừa đặt tour. Mã đơn: "
                        + savedBooking.getBookingCode())
                .type(NotificationType.NEW_BOOKING)
                .referenceId(savedBooking.getBookingCode())
                .referenceUrl("/admin/bookings")
                .destinationTopic("/topic/admin/notifications")
                .build());

        return BookingResponse.fromEntity(savedBooking);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = findBookingEntityById(id);
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Không thể thay đổi trạng thái của đơn đặt chỗ đã bị hủy.");
        }

        // Nếu chuyển sang trạng thái CANCELLED: Chuyển toàn bộ cho hàm cancelBooking xử lý trọn gói
        if (status == BookingStatus.CANCELLED) {
            cancelBooking(id);
            return BookingResponse.fromEntity(findBookingEntityById(id));
        }

        booking.setBookingStatus(status);
        bookingRepository.save(booking);

        // Bắn thông báo WebSocket & Lưu DB cho Khách hàng
        if (booking.getUser() != null) {
            String statusText = switch (status) {
                case CONFIRMED -> "Đã xác nhận";
                case COMPLETED -> "Đã hoàn thành";
                case PENDING -> "Chờ xử lý";
                default -> status.name();
            };

            notificationService.sendAndSaveNotification(NotificationSendRequest.builder()
                    .recipientUserId(booking.getUser().getId())
                    .title("Cập nhật trạng thái đơn tour 🔄")
                    .content("Đơn đặt tour " + booking.getBookingCode() + " đã được chuyển sang trạng thái: " + statusText)
                    .type(NotificationType.SYSTEM_ALERT)
                    .referenceId(booking.getBookingCode())
                    .referenceUrl("/my-bookings")
                    .destinationTopic("/queue/notifications")
                    .build());
        }

        return BookingResponse.fromEntity(booking);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BookingResponse updatePaymentStatus(Long id, PaymentStatus status) {
        Booking booking = findBookingEntityById(id);
        booking.setPaymentStatus(status);
        bookingRepository.save(booking);

        // Bắn thông báo Real-time & Lưu DB cho Khách hàng khi trạng thái thanh toán thay đổi
        if (booking.getUser() != null) {
            boolean isPaid = (status == PaymentStatus.PAID);
            String title = isPaid ? "Thanh toán thành công 💳" : "Cập nhật thanh toán 💰";
            String content = isPaid
                    ? "Đơn đặt tour " + booking.getBookingCode() + " đã được xác nhận thanh toán thành công!"
                    : "Trạng thái thanh toán của đơn tour " + booking.getBookingCode() + " đã chuyển sang: " + status.name();
            NotificationType notifType = isPaid ? NotificationType.PAYMENT_SUCCESS : NotificationType.SYSTEM_ALERT;

            notificationService.sendAndSaveNotification(NotificationSendRequest.builder()
                    .recipientUserId(booking.getUser().getId())
                    .title(title)
                    .content(content)
                    .type(notifType)
                    .referenceId(booking.getBookingCode())
                    .referenceUrl("/my-bookings")
                    .destinationTopic("/queue/notifications")
                    .build());
        }

        return BookingResponse.fromEntity(booking);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelBooking(Long id) {
        Booking booking = findBookingEntityById(id);
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Không thể hủy đơn đặt chỗ đã bị hủy.");
        }
        if (booking.getBookingStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException("Đơn đặt chỗ này đã hoàn thành, không thể hủy.");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);

        // 1. Trả lại số ghế vào kho cho đợt khởi hành (Có Pessimistic Lock)
        TourDeparture tourDeparture = tourDepartureRepository.findByWithLock(booking.getDeparture().getId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy đợt khởi hành với ID: " + booking.getDeparture().getId()));
        tourDeparture.setAvailableSeats(tourDeparture.getAvailableSeats() + booking.getTotalPassengers());

        // 2. Nếu đợt đi từng bị SOLD_OUT mà ngày đi còn trong tương lai -> Tự động mở lại OPEN cho khách khác đặt
        LocalDate today = LocalDate.now();
        if (tourDeparture.getStatus() == DepartureStatus.SOLD_OUT
                && tourDeparture.getDepartureDate() != null
                && tourDeparture.getDepartureDate().isAfter(today)) {
            tourDeparture.setStatus(DepartureStatus.OPEN);
        }
        tourDepartureRepository.save(tourDeparture);

        // 3. Hoàn trả lại lượt sử dụng mã khuyến mãi (nếu đơn có dùng khuyến mãi)
        if (booking.getPromotion() != null) {
            Promotion promotion = booking.getPromotion();
            if (promotion.getUsedCount() > 0) {
                promotion.setUsedCount(promotion.getUsedCount() - 1);
                promotionRepository.save(promotion);
            }
        }

        bookingRepository.save(booking);

        // 4. Bắn thông báo Real-time WebSocket + Lưu DB cho Khách hàng
        if (booking.getUser() != null) {
            notificationService.sendAndSaveNotification(NotificationSendRequest.builder()
                    .recipientUserId(booking.getUser().getId())
                    .title("Đơn đặt tour đã bị hủy ❌")
                    .content("Đơn đặt tour " + booking.getBookingCode() + " đã bị hủy thành công. Số chỗ đã được hoàn lại hệ thống.")
                    .type(NotificationType.SYSTEM_ALERT)
                    .referenceId(booking.getBookingCode())
                    .referenceUrl("/my-bookings")
                    .destinationTopic("/queue/notifications")
                    .build());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getBookingsWithFilter(BookingFilterRequest request) {
        Pageable pageable = request.toPageable();
        Page<Booking> bookingPage = bookingRepository.filterBookings(
                request.getKeyword(), 
                request.getBookingStatus(),
                request.getPaymentStatus(), 
                pageable);
        return PageResponse.fromPage(bookingPage, BookingResponse::fromEntity);
    }

    public Booking findBookingEntityById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt với ID: " + id));
    }

}