package com.travelhub.service.impl;

import com.travelhub.dto.request.ReviewRequest;
import com.travelhub.dto.response.ReviewResponse;
import com.travelhub.entity.Review;
import com.travelhub.entity.Tour;
import com.travelhub.entity.User;
import com.travelhub.repository.ReviewRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;

    // ================= DÀNH CHO ADMIN =================
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + id));
        reviewRepository.delete(review);
    }

    // ================= DÀNH CHO CLIENT =================
    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByTourId(Long tourId) {
        return reviewRepository.findAllByTourIdOrderByCreatedAtDesc(tourId).stream()
                .map(ReviewResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tour du lịch!"));

        Review review = Review.builder()
                .user(user)
                .tour(tour)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .createdAt(LocalDateTime.now())
                .build();

        return ReviewResponse.fromEntity(reviewRepository.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageRating(Long tourId) {
        return reviewRepository.getAverageRatingByTourId(tourId);
    }
}