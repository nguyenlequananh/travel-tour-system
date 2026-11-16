package com.travelhub.controller.client;

import com.travelhub.dto.request.TourFilterRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.PageResponse;
import com.travelhub.dto.response.TourAdminResponse;
import com.travelhub.dto.response.TourDetailResponse;
import com.travelhub.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tours")
@RequiredArgsConstructor
public class PublicTourController {

    // CHỈ CẦN DUY NHẤT 1 SERVICE
    private final TourService tourService;

    // 1. Lấy chi tiết tour trọn gói (Tour + Departures + Itineraries + Images + Policies)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourDetailResponse>> getTourDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TourDetailResponse>builder()
                .status(200)
                .message("Lấy chi tiết tour thành công")
                .data(tourService.getTourDetailById(id)) // Ủy quyền 100% cho Service
                .build());
    }

    // 2. Lấy danh sách tour có phân trang và bộ lọc
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TourAdminResponse>>> getPublicTours(TourFilterRequest request) {
        return ResponseEntity.ok(ApiResponse.<PageResponse<TourAdminResponse>>builder()
                .status(200)
                .message("Lấy danh sách tour thành công")
                .data(tourService.getToursWithFilter(request))
                .build());
    }
}