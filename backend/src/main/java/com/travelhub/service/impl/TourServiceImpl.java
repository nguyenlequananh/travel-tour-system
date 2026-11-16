package com.travelhub.service.impl;

import com.travelhub.dto.request.TourCreateRequest;
import com.travelhub.dto.request.TourFilterRequest;
import com.travelhub.dto.request.TourUpdateRequest;
import com.travelhub.dto.response.PageResponse;
import com.travelhub.dto.response.TourAdminResponse;
import com.travelhub.dto.response.TourDepartureResponse;
import com.travelhub.dto.response.TourDetailResponse;
import com.travelhub.dto.response.TourImageResponse;
import com.travelhub.dto.response.TourItineraryResponse;
import com.travelhub.dto.response.TourPolicyResponse;
import com.travelhub.repository.TourRepository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.travelhub.service.TourService;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourCategory;
import com.travelhub.repository.TourCategoryRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourImageRepository;
import com.travelhub.repository.TourItineraryRepository;
import com.travelhub.repository.TourPolicyRepository;
import com.travelhub.enums.TourStatus;

@Service
@RequiredArgsConstructor

public class TourServiceImpl implements TourService {
    private final TourRepository tourRepository;
    private final TourCategoryRepository tourCategoryRepository;

    private final TourDepartureRepository departureRepository;
    private final TourItineraryRepository itineraryRepository;
    private final TourImageRepository imageRepository;
    private final TourPolicyRepository policyRepository;

   @Override
   @Transactional(readOnly = true)
   public PageResponse<TourAdminResponse> getToursWithFilter(TourFilterRequest request) {
             Pageable pageable = request.toPageable();

        // 1. Làm sạch từ khóa
        String cleanKeyword = (request.getKeyword() != null && !request.getKeyword().trim().isEmpty())
                ? request.getKeyword().trim()
                : null;

        // 2. Làm sạch nơi khởi hành
        String cleanDepartureCity = (request.getDepartureCity() != null && !request.getDepartureCity().trim().isEmpty())
                ? request.getDepartureCity().trim()
                : null;

        // 3. Gọi Repository lọc đa tiêu chí chuẩn xác
        Page<Tour> tourPage = tourRepository.filterTours(
                cleanKeyword,
                request.getCategoryId(),
                cleanDepartureCity,
                request.getTourType(),
                pageable
        );

       return PageResponse.fromPage(tourPage, TourAdminResponse::fromEntity);
   }


    @Override
    @Transactional(readOnly = true)
    public List<TourAdminResponse> getAllTours() {
        return tourRepository.findAll()
                .stream()
                .map(TourAdminResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public TourAdminResponse getTourById(Long id) {
        return TourAdminResponse.fromEntity(findTourEntityById(id));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourAdminResponse createTour(TourCreateRequest request) {
        TourCategory category = tourCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục tour không tồn tại!"));
        if (tourRepository.existsByTourCode(request.getTourCode())) {
            throw new RuntimeException("Mã tour đã tồn tại!");
        }
        Tour tour = Tour.builder()
                .category(category)
                .tourCode(request.getTourCode())
                .name(request.getName())
                .tourType(request.getTourType())
                .departureCity(request.getDepartureCity())
                .destinationCity(request.getDestinationCity())
                .durationDays(request.getDurationDays())
                .durationNights(request.getDurationNights())
                .featuredImage(request.getFeaturedImage())
                .summary(request.getSummary())
                .description(request.getDescription())
                .status(TourStatus.ACTIVE)
                .build();
        return TourAdminResponse.fromEntity(tourRepository.save(tour));
    }

    @Override
    @Transactional (rollbackFor = Exception.class)
    public TourAdminResponse updateTour(Long id, TourUpdateRequest request) {
        Tour tour = findTourEntityById(id);
        if (tourRepository.existsByTourCodeAndIdNot(request.getTourCode(), id)) {
            throw new RuntimeException("Mã tour đã tồn tại!");
        }
        TourCategory category = tourCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục tour không tồn tại!"));
        tour.setCategory(category);
        tour.setTourCode(request.getTourCode());
        tour.setName(request.getName());
        tour.setTourType(request.getTourType());
        tour.setDepartureCity(request.getDepartureCity());
        tour.setDestinationCity(request.getDestinationCity());
        tour.setDurationDays(request.getDurationDays());
        tour.setDurationNights(request.getDurationNights());
        tour.setFeaturedImage(request.getFeaturedImage());
        tour.setSummary(request.getSummary());
        tour.setDescription(request.getDescription());
        tour.setStatus(request.getStatus());
        return TourAdminResponse.fromEntity(tourRepository.save(tour));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTour(Long id) {
        Tour tour = findTourEntityById(id);
        tour.setStatus(TourStatus.INACTIVE);
        tourRepository.save(tour);
    }

    @Transactional(readOnly = true)
    private Tour findTourEntityById(Long id) {
        return tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tour với ID: " + id));
    }

     @Override
    @Transactional(readOnly = true)
    public TourDetailResponse getTourDetailById(Long id) {
        // 1. Kiểm tra tour có tồn tại không
        Tour tour = findTourEntityById(id);

        // 2. Lấy danh sách các đợt đi, lịch trình, ảnh phụ và chính sách
        List<TourDepartureResponse> departures = departureRepository.findAllByTourId(id).stream()
                .map(TourDepartureResponse::fromEntity)
                .toList();

        List<TourItineraryResponse> itineraries = itineraryRepository.findAllByTourId(id).stream()
                .map(TourItineraryResponse::fromEntity)
                .toList();

        List<TourImageResponse> images = imageRepository.findAllByTourId(id).stream()
                .map(TourImageResponse::fromEntity)
                .toList();

        List<TourPolicyResponse> policies = policyRepository.findAllByTourId(id).stream()
                .map(TourPolicyResponse::fromEntity)
                .toList();

        // 3. Đóng gói DTO hoàn chỉnh
        return TourDetailResponse.builder()
                .tour(TourAdminResponse.fromEntity(tour))
                .departures(departures)
                .itineraries(itineraries)
                .images(images)
                .policies(policies)
                .build();
    }
}
