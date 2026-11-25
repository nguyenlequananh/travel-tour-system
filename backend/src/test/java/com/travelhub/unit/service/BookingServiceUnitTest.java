package com.travelhub.unit.service;

import com.travelhub.config.RabbitMQConfig;
import com.travelhub.dto.message.BookingEmailMessage;
import com.travelhub.dto.message.NotificationSendRequest;
import com.travelhub.dto.request.BookingCreateRequest;
import com.travelhub.dto.request.PassengerRequest;
import com.travelhub.dto.response.BookingResponse;
import com.travelhub.entity.Booking;
import com.travelhub.entity.BookingPassenger;
import com.travelhub.entity.Promotion;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.User;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.enums.DiscountType;
import com.travelhub.enums.PassengerType;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.repository.BookingPassagerRepository;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.PromotionRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourPickupPointRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.service.EmailService;
import com.travelhub.service.NotificationService;
import com.travelhub.service.impl.BookingServiceImpl;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test - Nghiệp vụ Đặt tour & Trừ ghế (BookingServiceImpl)")
class BookingServiceUnitTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BookingPassagerRepository bookingPassengerRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TourDepartureRepository tourDepartureRepository;
    @Mock
    private PromotionRepository promotionRepository;
    @Mock
    private EmailService emailService;
    @Mock
    private TourPickupPointRepository tourPickupPointRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User sampleUser;
    private TourDeparture sampleDeparture;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("Lê Khách Hàng")
                .email("khach@travelhub.vn")
                .build();

        Tour sampleTour = Tour.builder()
                .id(10L)
                .tourCode("TO-PQ-01")
                .name("Tour Phú Quốc 3N2Đ")
                .build();

        sampleDeparture = TourDeparture.builder()
                .id(100L)
                .tour(sampleTour)
                .departureDate(LocalDate.now().plusDays(15))
                .returnDate(LocalDate.now().plusDays(18))
                .adultPrice(new BigDecimal("5000000"))
                .childPrice(new BigDecimal("2500000"))
                .singleRoomSupplement(new BigDecimal("1000000"))
                .maxSeats(20)
                .availableSeats(10)
                .status(DepartureStatus.OPEN)
                .build();
    }

    @Test
    @DisplayName("createBooking - Khi đặt 1 người lớn (phòng đơn) + 1 trẻ em không voucher phải tính đúng tiền, trừ ghế và đẩy RabbitMQ")
    void createBooking_KhiKhongCoKhuyenMai_TinhDungTienTruGheVaGuiThongBao() {
        // GIVEN
        PassengerRequest adult = new PassengerRequest();
        adult.setFullName("Nguyễn Văn A");
        adult.setPassengerType(PassengerType.ADULT);
        adult.setRequiresSingleRoom(true); // 5,000,000 + 1,000,000 = 6,000,000

        PassengerRequest child = new PassengerRequest();
        child.setFullName("Bé B");
        child.setPassengerType(PassengerType.CHILD); // 2,500,000

        BookingCreateRequest request = new BookingCreateRequest();
        request.setUserId(1L);
        request.setDepartureId(100L);
        request.setContactName("Lê Khách Hàng");
        request.setContactPhone("0909111222");
        request.setContactEmail("khach@travelhub.vn");
        request.setPassengers(List.of(adult, child));

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(tourDepartureRepository.findByWithLock(100L)).thenReturn(Optional.of(sampleDeparture));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            if (b.getId() == null) b.setId(500L);
            return b;
        });
        when(bookingPassengerRepository.save(any(BookingPassenger.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        BookingResponse response = bookingService.createBooking(request);

        // THEN
        assertEquals(0, new BigDecimal("8500000").compareTo(response.getTotalAmount()));
        assertEquals(8, sampleDeparture.getAvailableSeats(), "Phải trừ đúng 2 ghế từ 10 xuống 8");
        assertEquals(BookingStatus.PENDING, response.getBookingStatus());
        assertEquals(PaymentStatus.UNPAID, response.getPaymentStatus());
        verify(rabbitTemplate, times(1))
                .convertAndSend(eq(RabbitMQConfig.BOOKING_EMAIL_QUEUE), any(BookingEmailMessage.class));
        verify(notificationService, times(1))
                .sendAndSaveNotification(any(NotificationSendRequest.class));
    }

    @Test
    @DisplayName("createBooking - Khi áp dụng mã giảm giá % vượt trần tối đa phải cắt theo maxDiscountAmount và tăng usedCount")
    void createBooking_KhiApDungMaGiamGiaPhanTramVuotTran_ApDungMaxDiscountVaTangUsedCount() {
        // GIVEN: 2 người lớn = 10,000,000. Giảm 20% = 2,000,000 nhưng trần tối đa chỉ 1,000,000 -> còn 9,000,000
        Promotion promo = Promotion.builder()
                .id(7L)
                .code("SUMMER20")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("20"))
                .maxDiscountAmount(new BigDecimal("1000000"))
                .minOrderAmount(new BigDecimal("5000000"))
                .validFrom(LocalDateTime.now().minusDays(2))
                .validTo(LocalDateTime.now().plusDays(10))
                .usageLimit(50)
                .usedCount(3)
                .isActive(true)
                .build();

        PassengerRequest p1 = new PassengerRequest();
        p1.setFullName("Khách 1");
        p1.setPassengerType(PassengerType.ADULT);
        PassengerRequest p2 = new PassengerRequest();
        p2.setFullName("Khách 2");
        p2.setPassengerType(PassengerType.ADULT);

        BookingCreateRequest request = new BookingCreateRequest();
        request.setUserId(1L);
        request.setDepartureId(100L);
        request.setPromotionCode("SUMMER20");
        request.setContactName("Lê Khách Hàng");
        request.setContactPhone("0909111222");
        request.setContactEmail("khach@travelhub.vn");
        request.setPassengers(List.of(p1, p2));

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(tourDepartureRepository.findByWithLock(100L)).thenReturn(Optional.of(sampleDeparture));
        when(promotionRepository.findByCode("SUMMER20")).thenReturn(Optional.of(promo));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookingPassengerRepository.save(any(BookingPassenger.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        BookingResponse response = bookingService.createBooking(request);

        // THEN
        assertEquals(0, new BigDecimal("9000000").compareTo(response.getTotalAmount()));
        assertEquals(4, promo.getUsedCount(), "Số lượt dùng voucher phải tăng từ 3 lên 4");
        verify(promotionRepository, times(1)).save(promo);
    }

    @Test
    @DisplayName("createBooking - Khi số hành khách vượt quá số ghế trống phải ném RuntimeException và không lưu đơn")
    void createBooking_KhiSoKhachVuotQuaSoGheTrong_NemRaRuntimeExceptionVaKhongLuu() {
        // GIVEN: Chuyến chỉ còn đúng 1 ghế trống nhưng khách đặt 2 người
        sampleDeparture.setAvailableSeats(1);

        PassengerRequest p1 = new PassengerRequest();
        p1.setFullName("Khách 1");
        p1.setPassengerType(PassengerType.ADULT);
        PassengerRequest p2 = new PassengerRequest();
        p2.setFullName("Khách 2");
        p2.setPassengerType(PassengerType.ADULT);

        BookingCreateRequest request = new BookingCreateRequest();
        request.setUserId(1L);
        request.setDepartureId(100L);
        request.setPassengers(List.of(p1, p2));

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(tourDepartureRepository.findByWithLock(100L)).thenReturn(Optional.of(sampleDeparture));

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> bookingService.createBooking(request));
        assertTrue(ex.getMessage().contains("vượt quá số ghế trống"));
        verify(bookingRepository, never()).save(any());
        verifyNoInteractions(rabbitTemplate);
    }

    @Test
    @DisplayName("createBooking - Khi đặt hết số ghế cuối cùng phải tự động chuyển trạng thái đợt khởi hành sang SOLD_OUT")
    void createBooking_KhiDatHetGheCuoiCung_ChuyenTrangThaiDotKhoiHanhSangSoldOut() {
        // GIVEN: Còn đúng 1 ghế trống và khách đặt 1 người
        sampleDeparture.setAvailableSeats(1);

        PassengerRequest p1 = new PassengerRequest();
        p1.setFullName("Khách Cuối Cùng");
        p1.setPassengerType(PassengerType.ADULT);

        BookingCreateRequest request = new BookingCreateRequest();
        request.setUserId(1L);
        request.setDepartureId(100L);
        request.setContactName("Lê Khách Hàng");
        request.setContactPhone("0909111222");
        request.setContactEmail("khach@travelhub.vn");
        request.setPassengers(List.of(p1));

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(tourDepartureRepository.findByWithLock(100L)).thenReturn(Optional.of(sampleDeparture));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));
        when(bookingPassengerRepository.save(any(BookingPassenger.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        bookingService.createBooking(request);

        // THEN
        assertEquals(0, sampleDeparture.getAvailableSeats());
        assertEquals(DepartureStatus.SOLD_OUT, sampleDeparture.getStatus());
        verify(tourDepartureRepository, times(1)).save(sampleDeparture);
    }
}
