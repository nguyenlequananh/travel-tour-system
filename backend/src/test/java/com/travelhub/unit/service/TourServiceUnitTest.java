package com.travelhub.unit.service;

import com.travelhub.dto.request.TourCreateRequest;
import com.travelhub.dto.request.TourUpdateRequest;
import com.travelhub.dto.response.TourAdminResponse;
import com.travelhub.dto.response.TourDetailResponse;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourCategory;
import com.travelhub.enums.CategoryStatus;
import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;
import com.travelhub.repository.TourCategoryRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourImageRepository;
import com.travelhub.repository.TourItineraryRepository;
import com.travelhub.repository.TourPolicyRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.service.impl.TourServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test - Nghiệp vụ Quản lý Tour (TourServiceImpl)")
class TourServiceUnitTest {

    @Mock
    private TourRepository tourRepository;
    @Mock
    private TourCategoryRepository tourCategoryRepository;
    @Mock
    private TourDepartureRepository departureRepository;
    @Mock
    private TourItineraryRepository itineraryRepository;
    @Mock
    private TourImageRepository imageRepository;
    @Mock
    private TourPolicyRepository policyRepository;

    @InjectMocks
    private TourServiceImpl tourService;

    private TourCategory sampleCategory;
    private Tour sampleTour;

    @BeforeEach
    void setUp() {
        sampleCategory = TourCategory.builder()
                .id(1)
                .name("Du lịch biển đảo")
                .slug("du-lich-bien-dao")
                .status(CategoryStatus.ACTIVE)
                .build();

        sampleTour = Tour.builder()
                .id(10L)
                .category(sampleCategory)
                .tourCode("TO-PQ-01")
                .name("Khám phá Phú Quốc 3N2Đ")
                .tourType(TourType.DOMESTIC)
                .departureCity("TP.HCM")
                .destinationCity("Phú Quốc")
                .durationDays(3)
                .durationNights(2)
                .status(TourStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("createTour - Khi dữ liệu hợp lệ phải lưu thành công với trạng thái ACTIVE")
    void createTour_KhiDuLieuHopLe_LuuThanhCongVaTrangThaiActive() {
        // GIVEN
        TourCreateRequest request = new TourCreateRequest();
        request.setCategoryId(1);
        request.setTourCode("TO-DN-01");
        request.setName("Đà Nẵng - Hội An 3N2Đ");
        request.setTourType(TourType.DOMESTIC);
        request.setDepartureCity("TP.HCM");
        request.setDestinationCity("Đà Nẵng");
        request.setDurationDays(3);
        request.setDurationNights(2);

        when(tourCategoryRepository.findById(1)).thenReturn(Optional.of(sampleCategory));
        when(tourRepository.existsByTourCode("TO-DN-01")).thenReturn(false);
        when(tourRepository.save(any(Tour.class))).thenAnswer(inv -> {
            Tour t = inv.getArgument(0);
            t.setId(11L);
            return t;
        });

        // WHEN
        TourAdminResponse response = tourService.createTour(request);

        // THEN
        assertNotNull(response);
        assertEquals(11L, response.getId());
        assertEquals("TO-DN-01", response.getTourCode());
        assertEquals(TourStatus.ACTIVE, response.getStatus());
        verify(tourRepository, times(1)).save(any(Tour.class));
    }

    @Test
    @DisplayName("createTour - Khi trùng mã tour phải ném RuntimeException và không gọi save")
    void createTour_KhiTrungMaTour_NemRaRuntimeExceptionVaKhongLuu() {
        // GIVEN
        TourCreateRequest request = new TourCreateRequest();
        request.setCategoryId(1);
        request.setTourCode("TO-PQ-01");

        when(tourCategoryRepository.findById(1)).thenReturn(Optional.of(sampleCategory));
        when(tourRepository.existsByTourCode("TO-PQ-01")).thenReturn(true);

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> tourService.createTour(request));
        assertTrue(ex.getMessage().contains("Mã tour đã tồn tại"));
        verify(tourRepository, never()).save(any());
    }

    @Test
    @DisplayName("createTour - Khi không tìm thấy danh mục tour phải ném RuntimeException")
    void createTour_KhiKhongTimThayDanhMuc_NemRaRuntimeException() {
        // GIVEN
        TourCreateRequest request = new TourCreateRequest();
        request.setCategoryId(999);

        when(tourCategoryRepository.findById(999)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> tourService.createTour(request));
        assertTrue(ex.getMessage().contains("Danh mục tour không tồn tại"));
        verify(tourRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateTour - Khi mã tour mới bị trùng với một tour khác phải ném RuntimeException")
    void updateTour_KhiTrungMaTourVoiTourKhac_NemRaRuntimeException() {
        // GIVEN
        TourUpdateRequest request = new TourUpdateRequest();
        request.setCategoryId(1);
        request.setTourCode("TO-TRUNG-02");

        when(tourRepository.findById(10L)).thenReturn(Optional.of(sampleTour));
        when(tourRepository.existsByTourCodeAndIdNot("TO-TRUNG-02", 10L)).thenReturn(true);

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> tourService.updateTour(10L, request));
        assertTrue(ex.getMessage().contains("Mã tour đã tồn tại"));
        verify(tourRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteTour - Phải thực hiện xóa mềm bằng cách chuyển trạng thái sang INACTIVE")
    void deleteTour_KhiTonTai_ChuyenTrangThaiSangInactive() {
        // GIVEN
        when(tourRepository.findById(10L)).thenReturn(Optional.of(sampleTour));

        // WHEN
        tourService.deleteTour(10L);

        // THEN
        assertEquals(TourStatus.INACTIVE, sampleTour.getStatus());
        verify(tourRepository, times(1)).save(sampleTour);
        verify(tourRepository, never()).delete(any());
    }

    @Test
    @DisplayName("getTourDetailById - Khi tour tồn tại phải tổng hợp đủ đợt khởi hành, lịch trình, ảnh và chính sách")
    void getTourDetailById_KhiTourTonTai_TongHopDayDuThongTinTour() {
        // GIVEN
        when(tourRepository.findById(10L)).thenReturn(Optional.of(sampleTour));
        when(departureRepository.findAllByTourId(10L)).thenReturn(Collections.emptyList());
        when(itineraryRepository.findAllByTourId(10L)).thenReturn(Collections.emptyList());
        when(imageRepository.findAllByTourId(10L)).thenReturn(Collections.emptyList());
        when(policyRepository.findAllByTourId(10L)).thenReturn(Collections.emptyList());

        // WHEN
        TourDetailResponse detail = tourService.getTourDetailById(10L);

        // THEN
        assertNotNull(detail);
        assertNotNull(detail.getTour());
        assertEquals("TO-PQ-01", detail.getTour().getTourCode());
        verify(departureRepository, times(1)).findAllByTourId(10L);
        verify(itineraryRepository, times(1)).findAllByTourId(10L);
        verify(imageRepository, times(1)).findAllByTourId(10L);
        verify(policyRepository, times(1)).findAllByTourId(10L);
    }
}
