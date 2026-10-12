package com.travelhub.service;
import com.travelhub.dto.request.TourCreateRequest;
import com.travelhub.dto.request.TourFilterRequest;
import com.travelhub.dto.request.TourUpdateRequest;
import com.travelhub.dto.response.PageResponse;
import com.travelhub.dto.response.TourAdminResponse;
import java.util.List;

import org.springframework.data.domain.Pageable;

public interface TourService {
    List<TourAdminResponse> getAllTours();
    TourAdminResponse getTourById(Long id);
    TourAdminResponse createTour(TourCreateRequest request);
    TourAdminResponse updateTour(Long id, TourUpdateRequest request);
    void deleteTour(Long id);
    PageResponse<TourAdminResponse>  getToursWithFilter(TourFilterRequest request);
}
