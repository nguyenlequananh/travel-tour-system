package com.travelhub.mock;

import com.travelhub.dto.request.TourCreateRequest;
import com.travelhub.dto.request.TourFilterRequest;
import com.travelhub.dto.request.TourUpdateRequest;
import com.travelhub.dto.response.PageResponse;
import com.travelhub.dto.response.TourAdminResponse;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourCategory;
import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;
import com.travelhub.repository.TourCategoryRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.service.impl.TourServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class TourServiceTest {

    @Mock
    private TourRepository tourRepository;

    @Mock
    private TourCategoryRepository tourCategoryRepository;

    @InjectMocks
    private TourServiceImpl tourService;

    private Tour mockTour;
    private TourCategory mockCategory;

    @BeforeEach
    public void setUp() {
        mockCategory = TourCategory.builder()
                .id(1)
                .name("Tour Biển Đảo")
                .slug("tour-bien-dao")
                .build();

        mockTour = Tour.builder()
                .id(1L)
                .category(mockCategory)
                .tourCode("TO-TEST-01")
                .name("Tour Test Hạ Long")
                .tourType(TourType.DOMESTIC)
                .departureCity("Hà Nội")
                .destinationCity("Quảng Ninh")
                .durationDays(2)
                .durationNights(1)
                .status(TourStatus.ACTIVE)
                .build();
    }

    // 1. TEST CHỨC NĂNG: LẤY TẤT CẢ TOUR
    @Test
    public void testGetAllTours_Success() {
        Mockito.when(tourRepository.findAll()).thenReturn(List.of(mockTour));

        List<TourAdminResponse> tours = tourService.getAllTours();

        Assertions.assertNotNull(tours);
        Assertions.assertEquals(1, tours.size());
        Assertions.assertEquals("TO-TEST-01", tours.get(0).getTourCode());
        Mockito.verify(tourRepository, Mockito.times(1)).findAll();
    }

    // 2. TEST CHỨC NĂNG: LẤY CHI TIẾT TOUR THEO ID (THÀNH CÔNG & THẤT BẠI)
    @Test
    public void testGetTourById_Success() {
        Mockito.when(tourRepository.findById(1L)).thenReturn(Optional.of(mockTour));

        TourAdminResponse response = tourService.getTourById(1L);

        Assertions.assertNotNull(response);
        Assertions.assertEquals("Tour Test Hạ Long", response.getName());
    }

    @Test
    public void testGetTourById_NotFound_ThrowsException() {
        Mockito.when(tourRepository.findById(99L)).thenReturn(Optional.empty());

        Exception exception = Assertions.assertThrows(RuntimeException.class, () -> {
            tourService.getTourById(99L);
        });

        Assertions.assertTrue(exception.getMessage().contains("Không tìm thấy tour"));
    }

    // 3. TEST CHỨC NĂNG: TẠO MỚI TOUR (THÀNH CÔNG & LỖI TRÙNG MÃ TOUR)
    @Test
    public void testCreateTour_Success() {
        TourCreateRequest request = new TourCreateRequest();
        request.setCategoryId(1);
        request.setTourCode("TO-NEW-01");
        request.setName("Tour Mới");
        request.setTourType(TourType.DOMESTIC);
        request.setDepartureCity("TP.HCM");
        request.setDestinationCity("Đà Lạt");
        request.setDurationDays(3);
        request.setDurationNights(2);

        Mockito.when(tourCategoryRepository.findById(1)).thenReturn(Optional.of(mockCategory));
        Mockito.when(tourRepository.existsByTourCode("TO-NEW-01")).thenReturn(false);
        Mockito.when(tourRepository.save(Mockito.any(Tour.class))).thenReturn(mockTour);

        TourAdminResponse response = tourService.createTour(request);

        Assertions.assertNotNull(response);
        Mockito.verify(tourRepository, Mockito.times(1)).save(Mockito.any(Tour.class));
    }

    @Test
    public void testCreateTour_DuplicateCode_ThrowsException() {
        TourCreateRequest request = new TourCreateRequest();
        request.setTourCode("TO-TEST-01"); // Mã đã tồn tại
        request.setCategoryId(1);

        Mockito.when(tourCategoryRepository.findById(1)).thenReturn(Optional.of(mockCategory));
        Mockito.when(tourRepository.existsByTourCode("TO-TEST-01")).thenReturn(true);

        Exception exception = Assertions.assertThrows(RuntimeException.class, () -> {
            tourService.createTour(request);
        });

        Assertions.assertEquals("Mã tour đã tồn tại!", exception.getMessage());
        Mockito.verify(tourRepository, Mockito.never()).save(Mockito.any(Tour.class));    }

    // 4. TEST CHỨC NĂNG: XÓA MỀM TOUR (SOFT DELETE)
    @Test
    public void testDeleteTour_Success() {
        Mockito.when(tourRepository.findById(1L)).thenReturn(Optional.of(mockTour));
        Mockito.when(tourRepository.save(Mockito.any(Tour.class))).thenReturn(mockTour);

        tourService.deleteTour(1L);

        Assertions.assertEquals(TourStatus.INACTIVE, mockTour.getStatus());
        Mockito.verify(tourRepository, Mockito.times(1)).save(mockTour);
    }

    // 5. TEST CHỨC NĂNG: LỌC VÀ PHÂN TRANG TOUR
    @Test
    public void testGetToursWithFilter_Success() {
        TourFilterRequest filterRequest = new TourFilterRequest();
        filterRequest.setKeyword("Hạ Long");
        filterRequest.setPage(0);
        filterRequest.setSize(10);

        Page<Tour> tourPage = new PageImpl<>(List.of(mockTour));

        Mockito.when(tourRepository.filterTours(
                Mockito.eq("Hạ Long"),
                Mockito.eq(null),
                Mockito.eq(null),
                Mockito.eq(null),
                Mockito.any(Pageable.class)
        )).thenReturn(tourPage);

        PageResponse<TourAdminResponse> response = tourService.getToursWithFilter(filterRequest);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(1, response.getTotalElements());
        Assertions.assertEquals(1, response.getData().size());
    }
}