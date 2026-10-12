package com.travelhub.controller.client;

import com.travelhub.dto.request.ReviewRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.ReviewResponse;
import com.travelhub.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class PublicReviewController {

    private final ReviewService reviewService;

    // 1. Khách xem tất cả đánh giá của 1 Tour cụ thể
    // URL: GET http://localhost:8081/api/v1/reviews/tour/1
    @GetMapping("/tour/{tourId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByTourId(@PathVariable Long tourId) {
        return ResponseEntity.ok(ApiResponse.<List<ReviewResponse>>builder()
                .status(200)
                .message("Lấy danh sách đánh giá thành công")
                .data(reviewService.getReviewsByTourId(tourId))
                .build());
    }

    // 2. Lấy điểm sao trung bình của Tour (ví dụ: 4.8 sao)
    // URL: GET http://localhost:8081/api/v1/reviews/tour/1/rating
    @GetMapping("/tour/{tourId}/rating")
    public ResponseEntity<ApiResponse<Double>> getAverageRating(@PathVariable Long tourId) {
        return ResponseEntity.ok(ApiResponse.<Double>builder()
                .status(200)
                .message("Lấy điểm đánh giá trung bình thành công")
                .data(reviewService.getAverageRating(tourId))
                .build());
    }

    // 3. Khách hàng gửi đánh giá mới
    // URL: POST http://localhost:8081/api/v1/reviews?userId=3
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @RequestParam Long userId,
            @Valid @RequestBody ReviewRequest request) {

        ReviewResponse response = reviewService.createReview(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ReviewResponse>builder()
                .status(201)
                .message("Gửi đánh giá thành công! Cảm ơn phản hồi của bạn.")
                .data(response)
                .build());
    }
}