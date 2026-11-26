package com.travelhub.unit.service;

import com.travelhub.dto.response.GuideDepartureResponse;
import com.travelhub.dto.response.GuidePassengerResponse;
import com.travelhub.entity.Booking;
import com.travelhub.entity.BookingPassenger;
import com.travelhub.entity.Role;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.TourGuide;
import com.travelhub.entity.TourPickupPoint;
import com.travelhub.entity.User;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.enums.PassengerType;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourGuideRepository;
import com.travelhub.repository.TourPickupPointRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.service.impl.GuideServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test - Nghiệp vụ Hướng dẫn viên & Sắp xếp lịch trình (GuideServiceImpl)")
class GuideServiceUnitTest {

    @Mock
    private TourGuideRepository tourGuideRepository;
    @Mock
    private TourDepartureRepository tourDepartureRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private TourPickupPointRepository tourPickupPointRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GuideServiceImpl guideService;

    private User guideUser;
    private Tour sampleTour;

    @BeforeEach
    void setUp() {
        Role guideRole = Role.builder().id(2).name("ROLE_GUIDE").build();
        guideUser = User.builder()
                .id(5L)
                .fullName("Trần Hướng Dẫn")
                .email("guide@travelhub.vn")
                .roles(Set.of(guideRole))
                .build();

        sampleTour = Tour.builder()
                .id(1L)
                .tourCode("TO-NT-01")
                .name("Nha Trang 3N2Đ")
                .build();
    }

    @Test
    @DisplayName("getMyAssignedDepartures - Phải ưu tiên chuyến sắp đi (ASC) lên trước, chuyến đã qua (DESC) xuống sau")
    void getMyAssignedDepartures_KhiCoChuyenSapDiVaDaQua_UuTienSapDiTangDanRoiDenDaQuaGiamDan() {
        // GIVEN: 4 chuyến với thứ tự lộn xộn trong DB
        LocalDate today = LocalDate.now();
        TourDeparture pastOld = TourDeparture.builder().id(1L).tour(sampleTour).departureDate(today.minusDays(20)).returnDate(today.minusDays(18)).status(DepartureStatus.CLOSED).build();
        TourDeparture upcomingFar = TourDeparture.builder().id(2L).tour(sampleTour).departureDate(today.plusDays(15)).returnDate(today.plusDays(18)).status(DepartureStatus.OPEN).build();
        TourDeparture pastRecent = TourDeparture.builder().id(3L).tour(sampleTour).departureDate(today.minusDays(3)).returnDate(today.minusDays(1)).status(DepartureStatus.CLOSED).build();
        TourDeparture upcomingSoon = TourDeparture.builder().id(4L).tour(sampleTour).departureDate(today.plusDays(2)).returnDate(today.plusDays(5)).status(DepartureStatus.OPEN).build();

        List<TourGuide> assignments = List.of(
                TourGuide.builder().id(1L).guide(guideUser).departure(pastOld).isLeadGuide(true).build(),
                TourGuide.builder().id(2L).guide(guideUser).departure(upcomingFar).isLeadGuide(true).build(),
                TourGuide.builder().id(3L).guide(guideUser).departure(pastRecent).isLeadGuide(false).build(),
                TourGuide.builder().id(4L).guide(guideUser).departure(upcomingSoon).isLeadGuide(true).build()
        );

        when(userRepository.findById(5L)).thenReturn(Optional.of(guideUser));
        when(tourGuideRepository.findAllByGuideId(5L)).thenReturn(assignments);
        when(tourPickupPointRepository.findAllByDepartureId(anyLong())).thenReturn(Collections.emptyList());
        when(bookingRepository.findConfirmedBookingsByDepartureId(anyLong())).thenReturn(Collections.emptyList());

        // WHEN
        List<GuideDepartureResponse> result = guideService.getMyAssignedDepartures(5L);

        // THEN: Thứ tự chuẩn phải là: sắp đi gần nhất (4) -> sắp đi xa hơn (2) -> đã qua gần nhất (3) -> đã qua lâu nhất (1)
        assertEquals(4, result.size());
        assertEquals(4L, result.get(0).getDepartureId());
        assertEquals(2L, result.get(1).getDepartureId());
        assertEquals(3L, result.get(2).getDepartureId());
        assertEquals(1L, result.get(3).getDepartureId());
    }

    @Test
    @DisplayName("getDeparturePassengers - Phải sắp xếp khách theo giờ đón ASC (tự túc xuống cuối) và gom theo bookingCode")
    void getDeparturePassengers_KhiCoNhieuDiemDon_SapXepTheoGioDonTangDanVaGomTheoBookingCode() {
        // GIVEN
        TourDeparture dep = TourDeparture.builder().id(10L).tour(sampleTour).build();
        TourPickupPoint pointLate = TourPickupPoint.builder().id(2L).locationName("Sân bay").pickupTime(LocalTime.of(6, 30)).build();
        TourPickupPoint pointEarly = TourPickupPoint.builder().id(1L).locationName("Hàng Xanh").pickupTime(LocalTime.of(5, 30)).build();

        Booking bookingSelf = Booking.builder()
                .bookingCode("BK-001")
                .pickupPoint(null) // Tự túc -> xuống cuối
                .passengers(List.of(BookingPassenger.builder().id(1L).fullName("Khách Tự Túc").passengerType(PassengerType.ADULT).build()))
                .build();

        Booking bookingLate = Booking.builder()
                .bookingCode("BK-002")
                .pickupPoint(pointLate)
                .passengers(List.of(BookingPassenger.builder().id(2L).fullName("Khách Đón Muộn").passengerType(PassengerType.ADULT).build()))
                .build();

        Booking bookingEarlyB = Booking.builder()
                .bookingCode("BK-004")
                .pickupPoint(pointEarly)
                .passengers(List.of(BookingPassenger.builder().id(3L).fullName("Khách Đón Sớm B").passengerType(PassengerType.ADULT).build()))
                .build();

        Booking bookingEarlyA = Booking.builder()
                .bookingCode("BK-003")
                .pickupPoint(pointEarly)
                .passengers(List.of(BookingPassenger.builder().id(4L).fullName("Khách Đón Sớm A").passengerType(PassengerType.ADULT).build()))
                .build();

        when(userRepository.findById(5L)).thenReturn(Optional.of(guideUser));
        when(tourDepartureRepository.findById(10L)).thenReturn(Optional.of(dep));
        when(tourGuideRepository.existsByDepartureIdAndGuideId(10L, 5L)).thenReturn(true);
        when(bookingRepository.findConfirmedBookingsByDepartureId(10L))
                .thenReturn(List.of(bookingSelf, bookingLate, bookingEarlyB, bookingEarlyA));

        // WHEN
        List<GuidePassengerResponse> manifest = guideService.getDeparturePassengers(10L, 5L);

        // THEN: 05:30 (BK-003 -> BK-004) -> 06:30 (BK-002) -> Tự túc null (BK-001)
        assertEquals(4, manifest.size());
        assertEquals("BK-003", manifest.get(0).getBookingCode());
        assertEquals("BK-004", manifest.get(1).getBookingCode());
        assertEquals("BK-002", manifest.get(2).getBookingCode());
        assertEquals("BK-001", manifest.get(3).getBookingCode());
        assertNull(manifest.get(3).getPickupTime());
    }

    @Test
    @DisplayName("getMyAssignedDepartures - Khi tài khoản chỉ có ROLE_CUSTOMER phải ném RuntimeException chặn truy cập")
    void getMyAssignedDepartures_KhiTaiKhoanKhongCoQuyenGuide_NemRaRuntimeException() {
        // GIVEN
        User normalCustomer = User.builder()
                .id(99L)
                .roles(Set.of(Role.builder().id(1).name("ROLE_CUSTOMER").build()))
                .build();
        when(userRepository.findById(99L)).thenReturn(Optional.of(normalCustomer));

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> guideService.getMyAssignedDepartures(99L));
        assertTrue(ex.getMessage().contains("ROLE_GUIDE"));
        verifyNoInteractions(tourGuideRepository);
    }
}
