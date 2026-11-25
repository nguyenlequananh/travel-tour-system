package com.travelhub.integration;

import com.travelhub.config.VnPayConfig;
import com.travelhub.entity.Booking;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourCategory;
import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.User;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.CategoryStatus;
import com.travelhub.enums.DepartureStatus;
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
import com.travelhub.service.VnPayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Integration Test (@SpringBootTest) - Xác thực chữ ký & Xử lý Callback VNPay")
class VnPayCallbackIntegrationTest {

    @Autowired
    private VnPayService vnPayService;

    @Autowired
    private VnPayConfig vnPayConfig;

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private BookingCancellationRepository bookingCancellationRepository;
    @Autowired
    private BookingPassagerRepository bookingPassengerRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private TourDepartureRepository tourDepartureRepository;
    @Autowired
    private TourRepository tourRepository;
    @Autowired
    private TourCategoryRepository tourCategoryRepository;
    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    private Booking unpaidBooking;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        bookingCancellationRepository.deleteAll();
        bookingPassengerRepository.deleteAll();
        bookingRepository.deleteAll();
        notificationRepository.deleteAll();
        tourDepartureRepository.deleteAll();
        tourRepository.deleteAll();
        tourCategoryRepository.deleteAll();
        userRepository.deleteAll();

        User user = userRepository.save(User.builder()
                .fullName("Khách Thanh Toán")
                .email("vnpay-it@travelhub.vn")
                .password("$2a$10$encodedDummyPassword")
                .isActive(true)
                .build());

        TourCategory cat = tourCategoryRepository.save(TourCategory.builder()
                .name("Quốc tế")
                .slug("quoc-te-vnpay")
                .status(CategoryStatus.ACTIVE)
                .build());

        Tour tour = tourRepository.save(Tour.builder()
                .category(cat)
                .tourCode("TO-VNP-01")
                .name("Tour Nhật Bản 5N4Đ")
                .tourType(TourType.INTERNATIONAL)
                .departureCity("TP.HCM")
                .destinationCity("Tokyo")
                .durationDays(5)
                .durationNights(4)
                .status(TourStatus.ACTIVE)
                .build());

        TourDeparture dep = tourDepartureRepository.save(TourDeparture.builder()
                .tour(tour)
                .departureDate(LocalDate.now().plusDays(30))
                .returnDate(LocalDate.now().plusDays(35))
                .adultPrice(new BigDecimal("25000000"))
                .childPrice(new BigDecimal("18000000"))
                .maxSeats(20)
                .availableSeats(18)
                .status(DepartureStatus.OPEN)
                .build());

        unpaidBooking = bookingRepository.save(Booking.builder()
                .bookingCode("BK-VNPAY001")
                .user(user)
                .departure(dep)
                .contactName("Khách Thanh Toán")
                .contactPhone("0909888999")
                .contactEmail("vnpay-it@travelhub.vn")
                .totalPassengers(1)
                .totalAmount(new BigDecimal("25000000"))
                .bookingStatus(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .build());
    }

    @Test
    @DisplayName("processPaymentCallback - Khi chữ ký HMAC-SHA512 hợp lệ và vnp_ResponseCode = 00 phải cập nhật PAID, CONFIRMED và lưu giao dịch")
    void processPaymentCallback_KhiChuKyHmacHopLeVaMa00_CapNhatPaidConfirmedVaLuuPayment() {
        // GIVEN
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "2500000000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", unpaidBooking.getBookingCode());
        params.put("vnp_TransactionNo", "14567890");
        params.put("vnp_SecureHash", signVnPayParams(params));

        // WHEN
        boolean result = vnPayService.processPaymentCallback(params);

        // THEN
        Booking updated = bookingRepository.findBookingByBookingCode(unpaidBooking.getBookingCode()).orElseThrow();
        assertTrue(result);
        assertEquals(PaymentStatus.PAID, updated.getPaymentStatus());
        assertEquals(BookingStatus.CONFIRMED, updated.getBookingStatus());
        assertTrue(paymentRepository.existsByTransactionCode("VNP-14567890"));
    }

    @Test
    @DisplayName("processPaymentCallback - Khi chữ ký bị giả mạo phải trả về false và giữ nguyên trạng thái UNPAID")
    void processPaymentCallback_KhiChuKyBiGiaMao_TraVeFalseVaGiuNguyenTrangThaiUnpaid() {
        // GIVEN
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "2500000000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", unpaidBooking.getBookingCode());
        params.put("vnp_TransactionNo", "99999999");
        params.put("vnp_SecureHash", "CHU_KY_GIA_MAO_KHONG_HOP_LE");

        // WHEN
        boolean result = vnPayService.processPaymentCallback(params);

        // THEN
        Booking unchanged = bookingRepository.findBookingByBookingCode(unpaidBooking.getBookingCode()).orElseThrow();
        assertFalse(result);
        assertEquals(PaymentStatus.UNPAID, unchanged.getPaymentStatus());
        assertEquals(BookingStatus.PENDING, unchanged.getBookingStatus());
        assertEquals(0, paymentRepository.count());
    }

    private String signVnPayParams(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            hashData.append(fieldName).append('=')
                    .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
            if (itr.hasNext()) {
                hashData.append('&');
            }
        }
        return VnPayConfig.hmacSHA512(vnPayConfig.vnp_HashSecret, hashData.toString());
    }
}
