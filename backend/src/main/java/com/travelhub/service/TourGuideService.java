package com.travelhub.service;

import com.travelhub.dto.request.TourGuideRequest;
import com.travelhub.dto.response.TourGuideResponse;
import com.travelhub.dto.response.UserResponse;

import java.util.List;

public interface TourGuideService {
    List<TourGuideResponse> getGuidesByDepartureId(Long departureId);
    TourGuideResponse getGuideAssignmentById(Long id);
    TourGuideResponse assignGuide(TourGuideRequest request);
    TourGuideResponse updateGuideAssignment(Long id, TourGuideRequest request);
    void removeGuideAssignment(Long id);
    List<UserResponse> getAvailableGuides();
}