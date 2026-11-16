package com.travelhub.mock;

import com.travelhub.dto.request.BookingCreateRequest;
import com.travelhub.dto.request.PassengerRequest;
import com.travelhub.dto.response.BookingResponse;
import com.travelhub.entity.*;
import com.travelhub.enums.*;
import com.travelhub.repository.*;
import com.travelhub.service.EmailService;
import com.travelhub.service.impl.BookingServiceImpl;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import com.travelhub.config.RabbitMQConfig;
import com.travelhub.dto.message.BookingEmailMessage;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BookingPassagerRepository bookingPassagerRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TourDepartureRepository tourDepartureRepository;
    @Mock
    private PromotionRepository promotionRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User mockUser;
    private TourDeparture mockDeparture;
    private Tour mockTour;

    @BeforeEach
    public void setUp() {
        mockUser = User.builder()
                .id(1L)
                .fullName("Nguyễn Văn Khách")
                .email("khach@gmail.com")
                .isActive(true)
                .build();

        mockTour = Tour.builder()
                .id(1L)
                .name("Tour Phú Quốc")
                .build();

        mockDeparture = TourDeparture.builder()
                .id(1L)
                .tour(mockTour)
                .departureDate(LocalDate.now().plusDays(10))
                .returnDate(LocalDate.now().plusDays(13))
                .adultPrice(BigDecimal.valueOf(5000000))
                .childPrice(BigDecimal.valueOf(2500000))
                .maxSeats(20)
                .availableSeats(10) // Còn 10 chỗ trống
                .status(DepartureStatus.OPEN)
                .build();
    }

    // 1. TEST ĐẶT TOUR THÀNH CÔNG (Kiểm tra trừ ghế, tính tiền)
    @Test
    public void testCreateBooking_Success() {
        BookingCreateRequest request = new BookingCreateRequest();
        request.setUserId(1L);
        request.setDepartureId(1L);
        request.setContactName("Nguyễn Văn Khách");
        request.setContactPhone("0901234567");
        request.setContactEmail("khach@gmail.com");

        PassengerRequest passenger1 = new PassengerRequest();
        passenger1.setFullName("Người lớn 1");
        passenger1.setPassengerType(PassengerType.ADULT);

        request.setPassengers(List.of(passenger1));

        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        Mockito.when(tourDepartureRepository.findByWithLock(1L)).thenReturn(Optional.of(mockDeparture));
        Mockito.when(bookingRepository.save(Mockito.any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(100L);
            return b;
        });
        Mockito.when(bookingPassagerRepository.save(Mockito.any(BookingPassenger.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.createBooking(request);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(9, mockDeparture.getAvailableSeats()); // Ghế trống phải giảm từ 10 xuống 9
        Mockito.verify(rabbitTemplate, Mockito.times(1))
        .convertAndSend(Mockito.eq(RabbitMQConfig.BOOKING_EMAIL_QUEUE), Mockito.any(BookingEmailMessage.class));
    }

    // 2. TEST ĐẶT TOUR THẤT BẠI DO VƯỢT QUÁ SỐ GHẾ TRỐNG
    @Test
    public void testCreateBooking_NotEnoughSeats_ThrowsException() {
        mockDeparture.setAvailableSeats(1); // Chỉ còn 1 chỗ

        BookingCreateRequest request = new BookingCreateRequest();
        request.setUserId(1L);
        request.setDepartureId(1L);
        request.setContactName("Khách");
        request.setContactPhone("090");
        request.setContactEmail("k@gmail.com");

        // Đặt 2 vé nhưng kho chỉ còn 1
        PassengerRequest p1 = new PassengerRequest();
        p1.setPassengerType(PassengerType.ADULT);
        PassengerRequest p2 = new PassengerRequest();
        p2.setPassengerType(PassengerType.ADULT);
        request.setPassengers(List.of(p1, p2));

        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        Mockito.when(tourDepartureRepository.findByWithLock(1L)).thenReturn(Optional.of(mockDeparture));

        Exception exception = Assertions.assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(request);
        });

        Assertions.assertTrue(exception.getMessage().contains("vượt quá số ghế trống"));
    }
}