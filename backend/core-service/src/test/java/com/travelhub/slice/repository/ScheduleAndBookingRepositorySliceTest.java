package com.travelhub.slice.repository;

import com.travelhub.entity.Tour;
import com.travelhub.entity.TourCategory;
import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.TourItinerary;
import com.travelhub.entity.TourPickupPoint;
import com.travelhub.enums.CategoryStatus;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourItineraryRepository;
import com.travelhub.repository.TourPickupPointRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("Slice Test (@DataJpaTest) - Kiểm thử câu @Query ORDER BY cho Lịch trình, Đợt đi & Điểm đón")
class ScheduleAndBookingRepositorySliceTest {

    @Autowired
    private TourItineraryRepository itineraryRepository;

    @Autowired
    private TourDepartureRepository departureRepository;

    @Autowired
    private TourPickupPointRepository pickupPointRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Tour sampleTour;

    @BeforeEach
    void setUp() {
        TourCategory cat = entityManager.persist(TourCategory.builder()
                .name("Nghỉ dưỡng")
                .slug("nghi-duong-sort")
                .status(CategoryStatus.ACTIVE)
                .build());

        sampleTour = entityManager.persist(Tour.builder()
                .category(cat)
                .tourCode("TO-SORT-01")
                .name("Tour Kiểm Thử Sắp Xếp")
                .tourType(TourType.DOMESTIC)
                .departureCity("TP.HCM")
                .destinationCity("Đà Lạt")
                .durationDays(3)
                .durationNights(2)
                .status(TourStatus.ACTIVE)
                .build());
    }

    @Test
    @DisplayName("TourItineraryRepository.findAllByTourId - Dù chèn lộn xộn Ngày 3, Ngày 1, Ngày 2 phải trả về đúng thứ tự 1 -> 2 -> 3")
    void findAllByTourId_KhiThemLichTrinhLonXon_SapXepDungTheoDayNumberTangDan() {
        // GIVEN: Cố tình chèn sai thứ tự ngày
        entityManager.persist(TourItinerary.builder().tour(sampleTour).dayNumber(3).title("Ngày 3").details("Về lại TP.HCM").build());
        entityManager.persist(TourItinerary.builder().tour(sampleTour).dayNumber(1).title("Ngày 1").details("Khởi hành đi Đà Lạt").build());
        entityManager.persist(TourItinerary.builder().tour(sampleTour).dayNumber(2).title("Ngày 2").details("Tham quan Langbiang").build());
        entityManager.flush();
        entityManager.clear();

        // WHEN
        List<TourItinerary> itineraries = itineraryRepository.findAllByTourId(sampleTour.getId());

        // THEN
        assertEquals(3, itineraries.size());
        assertEquals(1, itineraries.get(0).getDayNumber());
        assertEquals(2, itineraries.get(1).getDayNumber());
        assertEquals(3, itineraries.get(2).getDayNumber());
    }

    @Test
    @DisplayName("TourDepartureRepository.findAllByTourId - Các đợt khởi hành phải luôn được sắp xếp theo departureDate ASC")
    void findAllByTourId_KhiThemDotKhoiHanhKhongTheoThuTu_SapXepTheoDepartureDateTangDan() {
        // GIVEN: Cố tình chèn đợt tháng sau trước đợt tuần tới
        LocalDate nearDate = LocalDate.now().plusDays(5);
        LocalDate midDate = LocalDate.now().plusDays(15);
        LocalDate farDate = LocalDate.now().plusDays(30);

        entityManager.persist(TourDeparture.builder().tour(sampleTour).departureDate(farDate).returnDate(farDate.plusDays(2))
                .adultPrice(new BigDecimal("3000000")).childPrice(new BigDecimal("1500000")).maxSeats(20).availableSeats(20).status(DepartureStatus.OPEN).build());
        entityManager.persist(TourDeparture.builder().tour(sampleTour).departureDate(nearDate).returnDate(nearDate.plusDays(2))
                .adultPrice(new BigDecimal("3000000")).childPrice(new BigDecimal("1500000")).maxSeats(20).availableSeats(20).status(DepartureStatus.OPEN).build());
        entityManager.persist(TourDeparture.builder().tour(sampleTour).departureDate(midDate).returnDate(midDate.plusDays(2))
                .adultPrice(new BigDecimal("3000000")).childPrice(new BigDecimal("1500000")).maxSeats(20).availableSeats(20).status(DepartureStatus.OPEN).build());
        entityManager.flush();
        entityManager.clear();

        // WHEN
        List<TourDeparture> departures = departureRepository.findAllByTourId(sampleTour.getId());

        // THEN
        assertEquals(3, departures.size());
        assertEquals(nearDate, departures.get(0).getDepartureDate());
        assertEquals(midDate, departures.get(1).getDepartureDate());
        assertEquals(farDate, departures.get(2).getDepartureDate());
    }

    @Test
    @DisplayName("TourPickupPointRepository.findAllByDepartureId - Các điểm đón phải được sắp xếp đúng lộ trình giờ đón ASC")
    void findAllByDepartureId_KhiThemDiemDonKhongTheoThuTu_SapXepTheoPickupTimeTangDan() {
        // GIVEN
        TourDeparture dep = entityManager.persist(TourDeparture.builder()
                .tour(sampleTour)
                .departureDate(LocalDate.now().plusDays(10))
                .returnDate(LocalDate.now().plusDays(12))
                .adultPrice(new BigDecimal("3000000"))
                .childPrice(new BigDecimal("1500000"))
                .maxSeats(20)
                .availableSeats(20)
                .status(DepartureStatus.OPEN)
                .build());

        entityManager.persist(TourPickupPoint.builder().departure(dep).locationName("Trạm 3 - Sân bay").pickupTime(LocalTime.of(6, 45)).build());
        entityManager.persist(TourPickupPoint.builder().departure(dep).locationName("Trạm 1 - Nhà Văn Hóa").pickupTime(LocalTime.of(5, 0)).build());
        entityManager.persist(TourPickupPoint.builder().departure(dep).locationName("Trạm 2 - Hàng Xanh").pickupTime(LocalTime.of(5, 45)).build());
        entityManager.flush();
        entityManager.clear();

        // WHEN
        List<TourPickupPoint> points = pickupPointRepository.findAllByDepartureId(dep.getId());

        // THEN
        assertEquals(3, points.size());
        assertEquals(LocalTime.of(5, 0), points.get(0).getPickupTime());
        assertEquals(LocalTime.of(5, 45), points.get(1).getPickupTime());
        assertEquals(LocalTime.of(6, 45), points.get(2).getPickupTime());
    }
}
