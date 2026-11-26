package com.travelhub.integration;

import com.travelhub.dto.request.BookingCreateRequest;
import com.travelhub.dto.request.CancellationRequest;
import com.travelhub.dto.request.PassengerRequest;
import com.travelhub.dto.response.BookingResponse;
import com.travelhub.dto.response.CancellationResponse;
import com.travelhub.entity.Booking;
import com.travelhub.entity.BookingPassenger;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourCategory;
import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.User;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.CancellationStatus;
import com.travelhub.enums.CategoryStatus;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.enums.PassengerType;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;
import com.travelhub.repository.BookingCancellationRepository;
import com.travelhub.repository.BookingPassagerRepository;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.NotificationRepository;
import com.travelhub.repository.PaymentRepository;
import com.travelhub.repository.TourCategoryRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.service.BookingCancellationService;
import com.travelhub.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Integration Test (@SpringBootTest) - Luồng Đặt tour, Rollback @Transactional và Hủy vé trên H2 thật")
class BookingAndCancellationIntegrationTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingCancellationService cancellationService;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TourCategoryRepository tourCategoryRepository;
    @Autowired
    private TourRepository tourRepository;
    @Autowired
    private TourDepartureRepository tourDepartureRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private BookingCancellationRepository bookingCancellationRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private NotificationRepository notificationRepository;

    @MockitoSpyBean
    private BookingPassagerRepository bookingPassengerRepository;

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    private User testUser;
    private TourDeparture testDeparture;

    @BeforeEach
    void setUp() {
        reset(bookingPassengerRepository);

        paymentRepository.deleteAll();
        bookingCancellationRepository.deleteAll();
        bookingPassengerRepository.deleteAll();
        bookingRepository.deleteAll();
        notificationRepository.deleteAll();
        tourDepartureRepository.deleteAll();
        tourRepository.deleteAll();
        tourCategoryRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .fullName("Nguyễn Tích Hợp")
                .email("integration@travelhub.vn")
                .password("$2a$10$encodedDummyPassword")
                .phoneNumber("0909000111")
                .isActive(true)
                .build());

        TourCategory category = tourCategoryRepository.save(TourCategory.builder()
                .name("Biển đảo")
                .slug("bien-dao-it")
                .status(CategoryStatus.ACTIVE)
                .build());

        Tour tour = tourRepository.save(Tour.builder()
                .category(category)
                .tourCode("TO-IT-01")
                .name("Phú Quốc Integration Test 3N2Đ")
                .tourType(TourType.DOMESTIC)
                .departureCity("TP.HCM")
                .destinationCity("Phú Quốc")
                .durationDays(3)
                .durationNights(2)
                .status(TourStatus.ACTIVE)
                .build());

        testDeparture = tourDepartureRepository.save(TourDeparture.builder()
                .tour(tour)
                .departureDate(LocalDate.now().plusDays(20))
                .returnDate(LocalDate.now().plusDays(23))
                .adultPrice(new BigDecimal("4000000"))
                .childPrice(new BigDecimal("2000000"))
                .singleRoomSupplement(new BigDecimal("500000"))
                .maxSeats(20)
                .availableSeats(10)
                .status(DepartureStatus.OPEN)
                .build());
    }

    @Test
    @DisplayName("createBooking - Chạy toàn bộ luồng thật với H2 phải lưu đơn, lưu hành khách và trừ ghế trong DB")
    void createBooking_KhiChayFullFlowVoiH2_LuuHoaDonHanhKhachVaTruGheTrongDB() {
        // GIVEN
        BookingCreateRequest request = buildSampleBookingRequest();

        // WHEN
        BookingResponse response = bookingService.createBooking(request);

        // THEN: Đọc lại trực tiếp từ H2 Database để xác nhận
        TourDeparture updatedDeparture = tourDepartureRepository.findById(testDeparture.getId()).orElseThrow();
        Booking savedBooking = bookingRepository.findBookingByBookingCode(response.getBookingCode()).orElseThrow();

        assertEquals(8, updatedDeparture.getAvailableSeats(), "Số ghế trống trong H2 phải giảm từ 10 xuống 8");
        assertEquals(0, new BigDecimal("6000000").compareTo(savedBooking.getTotalAmount()));
        assertEquals(BookingStatus.PENDING, savedBooking.getBookingStatus());
        assertEquals(2, bookingPassengerRepository.findAll().size());
    }

    @Test
    @DisplayName("createBooking - Khi xảy ra lỗi giữa giao dịch lưu hành khách, @Transactional phải tự động ROLLBACK toàn bộ ghế đã trừ")
    void createBooking_KhiLoiGiuaGiaoDich_TransactionalTuDongRollbackGiuNguyenSoGhe() {
        // GIVEN: Giả lập lỗi DB ngay khi lưu bảng booking_passengers (sau khi đã trừ ghế và lưu bookings)
        BookingCreateRequest request = buildSampleBookingRequest();
        doThrow(new RuntimeException("Mô phỏng mất kết nối Database giữa giao dịch!"))
                .when(bookingPassengerRepository).save(any(BookingPassenger.class));

        // WHEN & THEN
        assertThrows(RuntimeException.class, () -> bookingService.createBooking(request));

        // Kiểm tra H2 Database thật: Số ghế PHẢI giữ nguyên 10 và không tồn tại đơn rác nào!
        TourDeparture departureAfterRollback = tourDepartureRepository.findById(testDeparture.getId()).orElseThrow();
        assertEquals(10, departureAfterRollback.getAvailableSeats(), "Ghế phải được rollback hoàn nguyên về 10");
        assertEquals(0, bookingRepository.count(), "Không được tồn tại đơn hàng rác sau khi rollback");
    }

    @Test
    @DisplayName("requestCancellation - Hủy đơn đã thanh toán trước 20 ngày phải chuyển CANCELLED, hoàn 100% và trả lại ghế vào H2")
    void requestCancellation_KhiHuyDonDaDat_CapNhatTrangThaiCancelledVaHoanLaiSoGhe() {
        // GIVEN: Tạo 1 đơn thật và đánh dấu đã thanh toán
        BookingResponse created = bookingService.createBooking(buildSampleBookingRequest());
        Booking booking = bookingRepository.findById(created.getId()).orElseThrow();
        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        CancellationRequest cancelRequest = new CancellationRequest();
        cancelRequest.setBookingId(booking.getId());
        cancelRequest.setReason("Thay đổi kế hoạch du lịch");

        // WHEN
        CancellationResponse cancelResp = cancellationService.requestCancellation(cancelRequest);

        // THEN: Kiểm tra toàn bộ dữ liệu sau hủy trong H2
        TourDeparture departureAfterCancel = tourDepartureRepository.findById(testDeparture.getId()).orElseThrow();
        Booking bookingAfterCancel = bookingRepository.findById(booking.getId()).orElseThrow();

        assertEquals(10, departureAfterCancel.getAvailableSeats(), "Phải hoàn đủ 2 ghế về lại 10 ghế trống");
        assertEquals(BookingStatus.CANCELLED, bookingAfterCancel.getBookingStatus());
        assertEquals(CancellationStatus.PENDING, cancelResp.getStatus());
        assertEquals(0, new BigDecimal("6000000.00").compareTo(cancelResp.getRefundAmount()));
    }

    private BookingCreateRequest buildSampleBookingRequest() {
        PassengerRequest adult = new PassengerRequest();
        adult.setFullName("Nguyễn Văn A");
        adult.setPassengerType(PassengerType.ADULT);

        PassengerRequest child = new PassengerRequest();
        child.setFullName("Nguyễn Bé B");
        child.setPassengerType(PassengerType.CHILD);

        BookingCreateRequest request = new BookingCreateRequest();
        request.setUserId(testUser.getId());
        request.setDepartureId(testDeparture.getId());
        request.setContactName("Nguyễn Tích Hợp");
        request.setContactPhone("0909000111");
        request.setContactEmail("integration@travelhub.vn");
        request.setPassengers(List.of(adult, child));
        return request;
    }
}
