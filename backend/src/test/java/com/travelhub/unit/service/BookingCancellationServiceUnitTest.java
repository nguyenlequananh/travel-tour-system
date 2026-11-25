package com.travelhub.unit.service;

import com.travelhub.dto.message.NotificationSendRequest;
import com.travelhub.dto.request.CancellationRequest;
import com.travelhub.dto.response.CancellationResponse;
import com.travelhub.entity.Booking;
import com.travelhub.entity.BookingCancellation;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.CancellationStatus;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.repository.BookingCancellationRepository;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.service.NotificationService;
import com.travelhub.service.impl.BookingCancellationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test - Nghiệp vụ Hủy tour & Tính phí phạt hoàn tiền (BookingCancellationServiceImpl)")
class BookingCancellationServiceUnitTest {

    @Mock
    private BookingCancellationRepository bookingCancellationRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private TourDepartureRepository tourDepartureRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private BookingCancellationServiceImpl cancellationService;

    private TourDeparture sampleDeparture;
    private Booking sampleBooking;

    @BeforeEach
    void setUp() {
        sampleDeparture = TourDeparture.builder()
                .id(10L)
                .departureDate(LocalDate.now().plusDays(20))
                .maxSeats(20)
                .availableSeats(0)
                .status(DepartureStatus.SOLD_OUT)
                .build();

        sampleBooking = Booking.builder()
                .id(100L)
                .bookingCode("BK-TEST0001")
                .departure(sampleDeparture)
                .totalPassengers(2)
                .totalAmount(new BigDecimal("10000000"))
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PAID)
                .build();
    }

    @Test
    @DisplayName("requestCancellation - Hủy trước >= 15 ngày (đã thanh toán) phải miễn phí phạt, hoàn 100% và mở lại ghế")
    void requestCancellation_KhiHuyTruoc15NgayDaThanhToan_Hoan100PhanTramVaTraLaiGhe() {
        // GIVEN
        CancellationRequest request = new CancellationRequest();
        request.setBookingId(100L);
        request.setReason("Bận việc gia đình đột xuất");

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(sampleBooking));
        when(bookingCancellationRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(tourDepartureRepository.findByWithLock(10L)).thenReturn(Optional.of(sampleDeparture));
        when(bookingCancellationRepository.save(any(BookingCancellation.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        CancellationResponse response = cancellationService.requestCancellation(request);

        // THEN
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getCancellationFeePercentage()));
        assertEquals(0, new BigDecimal("10000000.00").compareTo(response.getRefundAmount()));
        assertEquals(CancellationStatus.PENDING, response.getStatus());
        assertEquals(2, sampleDeparture.getAvailableSeats(), "Phải trả lại 2 ghế vào kho");
        assertEquals(DepartureStatus.OPEN, sampleDeparture.getStatus(), "Chuyến SOLD_OUT phải mở lại thành OPEN");
        assertEquals(BookingStatus.CANCELLED, sampleBooking.getBookingStatus());
        verify(notificationService, times(1)).sendAndSaveNotification(any(NotificationSendRequest.class));
    }

    @Test
    @DisplayName("requestCancellation - Hủy trước 7 đến 14 ngày (đã thanh toán) phải phạt 30% và hoàn 70%")
    void requestCancellation_KhiHuyTruoc10NgayDaThanhToan_Phat30PhanTramVaHoan70PhanTram() {
        // GIVEN
        sampleDeparture.setDepartureDate(LocalDate.now().plusDays(10));
        CancellationRequest request = new CancellationRequest();
        request.setBookingId(100L);
        request.setReason("Thay đổi lịch trình công tác");

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(sampleBooking));
        when(bookingCancellationRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(tourDepartureRepository.findByWithLock(10L)).thenReturn(Optional.of(sampleDeparture));
        when(bookingCancellationRepository.save(any(BookingCancellation.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        CancellationResponse response = cancellationService.requestCancellation(request);

        // THEN
        assertEquals(0, new BigDecimal("30.00").compareTo(response.getCancellationFeePercentage()));
        assertEquals(0, new BigDecimal("7000000.00").compareTo(response.getRefundAmount()));
        assertEquals(CancellationStatus.PENDING, response.getStatus());
    }

    @Test
    @DisplayName("requestCancellation - Khi đơn chưa thanh toán (UNPAID) phải hoàn 0đ và tự động APPROVED")
    void requestCancellation_KhiDonChuaThanhToan_SoTienHoanBangKhongVaDuyetNgay() {
        // GIVEN
        sampleBooking.setPaymentStatus(PaymentStatus.UNPAID);
        sampleBooking.setBookingStatus(BookingStatus.PENDING);

        CancellationRequest request = new CancellationRequest();
        request.setBookingId(100L);
        request.setReason("Đặt nhầm ngày khởi hành");

        when(bookingRepository.findById(100L)).thenReturn(Optional.of(sampleBooking));
        when(bookingCancellationRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(tourDepartureRepository.findByWithLock(10L)).thenReturn(Optional.of(sampleDeparture));
        when(bookingCancellationRepository.save(any(BookingCancellation.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        CancellationResponse response = cancellationService.requestCancellation(request);

        // THEN
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getRefundAmount()));
        assertEquals(CancellationStatus.APPROVED, response.getStatus());
    }
}
