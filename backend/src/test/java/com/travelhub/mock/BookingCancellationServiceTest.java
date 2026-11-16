package com.travelhub.mock;

import com.travelhub.dto.request.CancellationRequest;
import com.travelhub.dto.response.CancellationResponse;
import com.travelhub.entity.*;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.CancellationStatus;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.repository.BookingCancellationRepository;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.service.impl.BookingCancellationServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class BookingCancellationServiceTest {

    @Mock
    private BookingCancellationRepository bookingCancellationRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private TourDepartureRepository tourDepartureRepository;

    @InjectMocks
    private BookingCancellationServiceImpl cancellationService;

    private Booking mockBooking;
    private TourDeparture mockDeparture;

    @BeforeEach
    public void setUp() {
        mockDeparture = TourDeparture.builder()
                .id(1L)
                .departureDate(LocalDate.now().plusDays(20)) // Khởi hành sau 20 ngày (Miễn phí hủy)
                .availableSeats(10)
                .maxSeats(20)
                .build();

        mockBooking = Booking.builder()
                .id(1L)
                .bookingCode("BK-TEST-01")
                .departure(mockDeparture)
                .totalAmount(BigDecimal.valueOf(5000000))
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PAID)
                .totalPassengers(2)
                .build();
    }

    // 1. TEST YÊU CẦU HỦY TOUR TRƯỚC 15 NGÀY (MIỄN PHÍ - PHẠT 0%)
    @Test
    public void testRequestCancellation_Before15Days_FreeRefund() {
        CancellationRequest request = new CancellationRequest();
        request.setBookingId(1L);
        request.setReason("Đổi ý không đi nữa");

        Mockito.when(bookingRepository.findById(1L)).thenReturn(Optional.of(mockBooking));
        Mockito.when(bookingCancellationRepository.findByBookingId(1L)).thenReturn(Optional.empty());
        Mockito.when(tourDepartureRepository.findByWithLock(1L)).thenReturn(Optional.of(mockDeparture));
        
        Mockito.when(bookingCancellationRepository.save(Mockito.any(BookingCancellation.class)))
                .thenAnswer(invocation -> {
                    BookingCancellation c = invocation.getArgument(0);
                    c.setId(10L);
                    return c;
                });

        CancellationResponse response = cancellationService.requestCancellation(request);

        Assertions.assertNotNull(response);
        // Phạt 0% vì hủy trước 20 ngày, hoàn 100% tiền (5.000.000)
        Assertions.assertEquals(BigDecimal.valueOf(0.0), response.getCancellationFeePercentage().setScale(1));
        Assertions.assertEquals(BigDecimal.valueOf(5000000.00).setScale(2), response.getRefundAmount());
        Assertions.assertEquals(CancellationStatus.APPROVED, response.getStatus());
        
        // Kiểm tra ghế đã được cộng trả lại kho (10 + 2 = 12)
        Assertions.assertEquals(12, mockDeparture.getAvailableSeats());
    }
}