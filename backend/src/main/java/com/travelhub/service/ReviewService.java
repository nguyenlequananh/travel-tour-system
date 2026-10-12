package com.travelhub.service;

import com.travelhub.dto.request.ReviewRequest;
import com.travelhub.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    // Dành cho Admin
    List<ReviewResponse> getAllReviews();
    void deleteReview(Long id); // Xóa đánh giá spam/chửi bậy

    // Dành cho Client
    List<ReviewResponse> getReviewsByTourId(Long tourId);
    ReviewResponse createReview(Long userId, ReviewRequest request);
    Double getAverageRating(Long tourId);
}