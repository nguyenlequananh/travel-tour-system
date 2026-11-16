package com.travelhub.service;

import com.travelhub.dto.request.TourImageRequest;
import com.travelhub.dto.response.TourImageResponse;

import java.util.List;

public interface TourImageService {
    List<TourImageResponse> getImagesByTourId(Long tourId);
    TourImageResponse getImageById(Long id);
    TourImageResponse createImage(TourImageRequest request);
    TourImageResponse updateImage(Long id, TourImageRequest request);
    void deleteImage(Long id);
}