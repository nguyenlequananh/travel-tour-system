package com.travelhub.unit.service;

import com.travelhub.batch.DepartureItemProcessor;
import com.travelhub.dto.request.DepartureCsvRow;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.repository.TourRepository;
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
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test - Bộ xử lý từng dòng CSV của Spring Batch (DepartureItemProcessor)")
class DepartureItemProcessorUnitTest {

    @Mock
    private TourRepository tourRepository;

    @InjectMocks
    private DepartureItemProcessor processor;

    private Tour sampleTour;

    @BeforeEach
    void setUp() {
        sampleTour = Tour.builder()
                .id(1L)
                .tourCode("TOUR-DN-01")
                .name("Đà Nẵng 3N2Đ")
                .durationDays(3)
                .durationNights(2)
                .build();
    }

    @Test
    @DisplayName("process - Khi dòng CSV hợp lệ phải ánh xạ thành TourDeparture và tự tính returnDate = ngày đi + (durationDays - 1)")
    void process_KhiDongCsvHopLe_TaoTourDepartureVaTuTinhNgayVe() {
        // GIVEN
        LocalDate depDate = LocalDate.now().plusDays(15);
        DepartureCsvRow row = DepartureCsvRow.builder()
                .tourCode("TOUR-DN-01")
                .departureDate(depDate.toString())
                .adultPrice("3590000")
                .childPrice("2590000")
                .singleRoomSupplement("600000")
                .maxSeats("30")
                .build();

        when(tourRepository.findByTourCode("TOUR-DN-01")).thenReturn(Optional.of(sampleTour));

        // WHEN
        TourDeparture result = processor.process(row);

        // THEN
        assertNotNull(result);
        assertEquals(depDate, result.getDepartureDate());
        assertEquals(depDate.plusDays(2), result.getReturnDate());
        assertEquals(0, new BigDecimal("3590000").compareTo(result.getAdultPrice()));
        assertEquals(30, result.getMaxSeats());
        assertEquals(30, result.getAvailableSeats());
        assertEquals(DepartureStatus.OPEN, result.getStatus());
    }

    @Test
    @DisplayName("process - Khi mã tour không tồn tại phải ném IllegalArgumentException để Spring Batch Skip")
    void process_KhiMaTourKhongTonTai_NemIllegalArgumentException() {
        // GIVEN
        DepartureCsvRow row = DepartureCsvRow.builder()
                .tourCode("TOUR-KHONG-CO")
                .departureDate(LocalDate.now().plusDays(10).toString())
                .adultPrice("3000000")
                .childPrice("1500000")
                .maxSeats("20")
                .build();

        when(tourRepository.findByTourCode("TOUR-KHONG-CO")).thenReturn(Optional.empty());

        // WHEN & THEN
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> processor.process(row));
        assertTrue(ex.getMessage().contains("Không tìm thấy tour"));
    }

    @Test
    @DisplayName("process - Khi ngày khởi hành nằm trong quá khứ phải ném IllegalArgumentException để Spring Batch Skip")
    void process_KhiNgayKhoiHanhTrongQuaKhu_NemIllegalArgumentException() {
        // GIVEN
        DepartureCsvRow row = DepartureCsvRow.builder()
                .tourCode("TOUR-DN-01")
                .departureDate(LocalDate.now().minusDays(2).toString())
                .adultPrice("3000000")
                .childPrice("1500000")
                .maxSeats("20")
                .build();

        when(tourRepository.findByTourCode("TOUR-DN-01")).thenReturn(Optional.of(sampleTour));

        // WHEN & THEN
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> processor.process(row));
        assertTrue(ex.getMessage().contains("quá khứ"));
    }
}
