package com.travelhub.unit.service;

import com.travelhub.dto.request.TourDepartureCreateRequest;
import com.travelhub.dto.request.TourDepartureUpdateRequest;
import com.travelhub.dto.response.TourDepartureResponse;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.service.impl.TourDepartureServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test - Nghiệp vụ Đợt khởi hành & Tự động tính ngày về (TourDepartureServiceImpl)")
class TourDepartureServiceUnitTest {

    @Mock
    private TourDepartureRepository repository;
    @Mock
    private TourRepository tourRepository;

    @InjectMocks
    private TourDepartureServiceImpl departureService;

    private Tour sampleTour;

    @BeforeEach
    void setUp() {
        // Tour 3 ngày 2 đêm -> ngày về chuẩn = departureDate + (3 - 1) = departureDate + 2 ngày
        sampleTour = Tour.builder()
                .id(1L)
                .tourCode("TO-DL-01")
                .name("Đà Lạt 3N2Đ")
                .durationDays(3)
                .durationNights(2)
                .build();
    }

    @Test
    @DisplayName("createDeparture - Khi dữ liệu hợp lệ phải tạo mới với availableSeats = maxSeats, OPEN và tự tính đúng returnDate")
    void createDeparture_KhiDuLieuHopLe_TaoMoiVoiAvailableSeatsBangMaxSeatsVaTuTinhNgayVe() {
        // GIVEN
        LocalDate depDate = LocalDate.now().plusDays(10);
        TourDepartureCreateRequest request = new TourDepartureCreateRequest();
        request.setTourId(1L);
        request.setDepartureDate(depDate);
        request.setAdultPrice(new BigDecimal("3500000"));
        request.setChildPrice(new BigDecimal("2000000"));
        request.setSingleRoomSupplement(new BigDecimal("500000"));
        request.setMaxSeats(30);

        when(tourRepository.findById(1L)).thenReturn(Optional.of(sampleTour));
        when(repository.save(any(TourDeparture.class))).thenAnswer(inv -> {
            TourDeparture dep = inv.getArgument(0);
            dep.setId(50L);
            return dep;
        });

        // WHEN
        TourDepartureResponse response = departureService.createDeparture(request);

        // THEN
        assertEquals(50L, response.getId());
        assertEquals(30, response.getMaxSeats());
        assertEquals(30, response.getAvailableSeats());
        assertEquals(DepartureStatus.OPEN, response.getStatus());
        assertEquals(depDate.plusDays(2), response.getReturnDate(),
                "Tour 3N2Đ phải tự tính returnDate = departureDate + (3 - 1)");
        verify(repository, times(1)).save(any(TourDeparture.class));
    }

    @Test
    @DisplayName("createDeparture - Với tour đi trong ngày (durationDays = 1) phải tự tính returnDate trùng với departureDate")
    void createDeparture_KhiTourDiTrongNgay_TuDongTinhNgayVeTrungNgayDi() {
        // GIVEN: Tour 1 ngày 0 đêm -> returnDate = departureDate + (1 - 1) = departureDate
        Tour oneDayTour = Tour.builder()
                .id(2L)
                .tourCode("TO-CỦCHI-1N")
                .name("Địa đạo Củ Chi 1 Ngày")
                .durationDays(1)
                .durationNights(0)
                .build();

        LocalDate depDate = LocalDate.now().plusDays(15);
        TourDepartureCreateRequest request = new TourDepartureCreateRequest();
        request.setTourId(2L);
        request.setDepartureDate(depDate);
        request.setAdultPrice(new BigDecimal("850000"));
        request.setChildPrice(new BigDecimal("500000"));
        request.setMaxSeats(25);

        when(tourRepository.findById(2L)).thenReturn(Optional.of(oneDayTour));
        when(repository.save(any(TourDeparture.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        TourDepartureResponse response = departureService.createDeparture(request);

        // THEN
        assertEquals(depDate, response.getReturnDate());
        verify(repository, times(1)).save(any(TourDeparture.class));
    }

    @Test
    @DisplayName("createDeparture - Khi ngày khởi hành nằm trong quá khứ phải ném RuntimeException")
    void createDeparture_KhiNgayKhoiHanhTrongQuaKhu_NemRaRuntimeException() {
        // GIVEN
        TourDepartureCreateRequest request = new TourDepartureCreateRequest();
        request.setTourId(1L);
        request.setDepartureDate(LocalDate.now().minusDays(1));

        when(tourRepository.findById(1L)).thenReturn(Optional.of(sampleTour));

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> departureService.createDeparture(request));
        assertTrue(ex.getMessage().contains("không được trước ngày hiện tại"));
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("updateDeparture - Khi đổi ngày khởi hành mới phải tự tính lại returnDate theo durationDays và cập nhật ghế")
    void updateDeparture_KhiDoiNgayKhoiHanh_TuDongTinhLaiNgayVeTheoDurationDays() {
        // GIVEN: Max 20, trống 12 -> đã đặt 8 ghế
        LocalDate oldDepDate = LocalDate.now().plusDays(10);
        LocalDate newDepDate = LocalDate.now().plusDays(20);

        TourDeparture existing = TourDeparture.builder()
                .id(50L)
                .tour(sampleTour)
                .departureDate(oldDepDate)
                .returnDate(oldDepDate.plusDays(2))
                .maxSeats(20)
                .availableSeats(12)
                .status(DepartureStatus.OPEN)
                .build();

        TourDepartureUpdateRequest request = new TourDepartureUpdateRequest();
        request.setDepartureDate(newDepDate);
        request.setAdultPrice(new BigDecimal("4000000"));
        request.setChildPrice(new BigDecimal("2500000"));
        request.setMaxSeats(25);
        request.setStatus(DepartureStatus.OPEN);

        when(repository.findById(50L)).thenReturn(Optional.of(existing));
        when(repository.save(any(TourDeparture.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        TourDepartureResponse response = departureService.updateDeparture(50L, request);

        // THEN
        assertEquals(newDepDate, response.getDepartureDate());
        assertEquals(newDepDate.plusDays(2), response.getReturnDate());
        assertEquals(17, response.getAvailableSeats(), "25 chỗ mới - 8 chỗ đã đặt = 17 chỗ trống");
        verify(repository, times(1)).save(existing);
    }

    @Test
    @DisplayName("updateDeparture - Khi giảm maxSeats nhỏ hơn số ghế khách đã đặt phải ném RuntimeException")
    void updateDeparture_KhiGiamMaxSeatsNhoHonSoGheDaDat_NemRaRuntimeException() {
        // GIVEN: Max 20 ghế, còn trống 5 ghế -> Đã đặt 15 ghế
        TourDeparture existing = TourDeparture.builder()
                .id(50L)
                .tour(sampleTour)
                .departureDate(LocalDate.now().plusDays(10))
                .returnDate(LocalDate.now().plusDays(12))
                .maxSeats(20)
                .availableSeats(5)
                .status(DepartureStatus.OPEN)
                .build();

        TourDepartureUpdateRequest request = new TourDepartureUpdateRequest();
        request.setDepartureDate(LocalDate.now().plusDays(10));
        request.setAdultPrice(new BigDecimal("3500000"));
        request.setChildPrice(new BigDecimal("2000000"));
        request.setMaxSeats(10); // Nhỏ hơn 15 ghế đã bán!
        request.setStatus(DepartureStatus.OPEN);

        when(repository.findById(50L)).thenReturn(Optional.of(existing));

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> departureService.updateDeparture(50L, request));
        assertTrue(ex.getMessage().contains("số chỗ đã được đặt"));
        verify(repository, never()).save(any());
    }
}
