package com.travelhub.controller.admin;

import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.ReviewResponse;
import com.travelhub.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    // 1. Admin xem toàn bộ đánh giá của khách hàng trong hệ thống
    // URL: GET http://localhost:8081/api/v1/admin/reviews
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.<List<ReviewResponse>>builder()
                .status(200)
                .message("Lấy danh sách đánh giá thành công")
                .data(reviewService.getAllReviews())
                .build());
    }

    // 2. Admin xóa đánh giá xấu / vi phạm tiêu chuẩn cộng đồng
    // URL: DELETE http://localhost:8081/api/v1/admin/reviews/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa đánh giá thành công")
                .data(null)
                .build());
    }
}