package com.travelhub.service.impl;
import com.travelhub.service.BookingCancellationService;

import lombok.RequiredArgsConstructor;

import com.travelhub.dto.request.CancellationRequest;
import com.travelhub.dto.response.CancellationResponse;
import com.travelhub.entity.Booking;
import com.travelhub.entity.BookingCancellation;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.CancellationStatus;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.repository.BookingCancellationRepository;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.TourDepartureRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor 
@Service
public class BookingCancellationServiceImpl implements BookingCancellationService {
    private final BookingCancellationRepository bookingCancellationRepository;
    private final BookingRepository bookingRepository;
    private final TourDepartureRepository tourDepartureRepository;

    @Override
    @Transactional (readOnly = true)
    public List<CancellationResponse> getAllCancellations() {
        return bookingCancellationRepository.findAll()
                .stream()
                .map(CancellationResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional (readOnly = true)
    public CancellationResponse getCancellationByBookingId(Long bookingId) {
        return CancellationResponse.fromEntity(bookingCancellationRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biên bản hủy đơn với ID: " + bookingId)));
    }
    
    @Override
    @Transactional (rollbackFor = Exception.class)
    public CancellationResponse requestCancellation(CancellationRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt với ID: " + request.getBookingId()));
        if(booking.getBookingStatus() == BookingStatus.CANCELLED){
            throw new RuntimeException("Đơn đặt này đã được hủy.");
        }
        if(booking.getBookingStatus() == BookingStatus.COMPLETED){
            throw new RuntimeException("Đơn đặt này đã hoàn thành, không thể hủy.");
        }
        // Kiểm tra xem đã có đơn hủy nào cho booking này chưa
        if (bookingCancellationRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new RuntimeException("Đơn đặt này đã có yêu cầu hủy đang được xử lý!");
        }
        TourDeparture tourDeparture = tourDepartureRepository.findByWithLock(booking.getDeparture().getId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khởi hành với ID: " + booking.getDeparture().getId()));

        LocalDate departureDate = tourDeparture.getDepartureDate();
        LocalDate today = LocalDate.now();
        if (today.isAfter(departureDate)) {
            throw new RuntimeException("Không thể hủy đơn đặt vì ngày khởi hành đã qua.");
        }

        long daysBeforeDeparture = ChronoUnit.DAYS.between(today, departureDate);

        BigDecimal feePercentage;
        if (daysBeforeDeparture >= 15) {
            feePercentage = BigDecimal.ZERO; // Hủy trước 15 ngày: Miễn phí 100%
        } else if (daysBeforeDeparture >= 7) {
            feePercentage = new BigDecimal("30.00"); // Phạt 30%
        } else if (daysBeforeDeparture >= 3) {
            feePercentage = new BigDecimal("70.00"); // Phạt 70%
        } else {
            feePercentage = new BigDecimal("100.00"); // Dưới 3 ngày: Phạt 100%
        }

        // 5. Tính số tiền hoàn lại: refund = totalAmount * (100 - feePercentage) / 100
        BigDecimal hundred = new BigDecimal("100.00");
        BigDecimal refundPercentage = hundred.subtract(feePercentage);
        BigDecimal refundAmount = booking.getTotalAmount()
                .multiply(refundPercentage)
                .divide(hundred, 2, RoundingMode.HALF_UP);
         // Nếu khách chưa nộp tiền (UNPAID) thì số tiền hoàn thực tế là 0
        if (booking.getPaymentStatus() == PaymentStatus.UNPAID) {
            refundAmount = BigDecimal.ZERO;
        }

        // 6. Hoàn lại số ghế vào kho cho khách khác đặt
        tourDeparture.setAvailableSeats(tourDeparture.getAvailableSeats() + booking.getTotalPassengers());
        tourDepartureRepository.save(tourDeparture);

        // 7. Cập nhật trạng thái đơn hàng thành CANCELLED
        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // 8. Tạo bản ghi Hủy
        BookingCancellation cancellation = BookingCancellation.builder()
                .booking(booking)
                .reason(request.getReason())
                .cancellationFeePercentage(feePercentage)
                .refundAmount(refundAmount)
                .status(refundAmount.compareTo(BigDecimal.ZERO) == 0 ? CancellationStatus.APPROVED : CancellationStatus.PENDING)
                .build();

        return CancellationResponse.fromEntity(bookingCancellationRepository.save(cancellation));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CancellationResponse confirmRefund(Long cancellationId) {
        BookingCancellation cancellation = bookingCancellationRepository.findById(cancellationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin hủy tour với ID: " + cancellationId));

        if (cancellation.getStatus() == CancellationStatus.REFUNDED) {
            throw new RuntimeException("Yêu cầu này đã được hoàn tiền trước đó rồi!");
        }

        // Đổi trạng thái hủy sang REFUNDED
        cancellation.setStatus(CancellationStatus.REFUNDED);

        // Cập nhật trạng thái thanh toán trên Booking
        Booking booking = cancellation.getBooking();
        booking.setPaymentStatus(PaymentStatus.REFUNDED);
        bookingRepository.save(booking);

        return CancellationResponse.fromEntity(bookingCancellationRepository.save(cancellation));
    }
    
}
