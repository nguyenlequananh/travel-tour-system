package com.travelhub.controller.admin;

import com.travelhub.dto.request.TourCreateRequest;
import com.travelhub.dto.request.TourFilterRequest;
import com.travelhub.dto.request.TourUpdateRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.PageResponse;
import com.travelhub.dto.response.TourAdminResponse;
import com.travelhub.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/tours")
@RequiredArgsConstructor
public class AdminTourController {

    private final TourService tourService;

    // 1. Lấy tất cả tour
    @GetMapping
    public ResponseEntity<ApiResponse<List<TourAdminResponse>>> getAllTours() {
        return ResponseEntity.ok(ApiResponse.<List<TourAdminResponse>>builder()
                .status(200)
                .message("Lấy danh sách tour thành công")
                .data(tourService.getAllTours())
                .build());
    }

    // 2. Lấy chi tiết 1 tour
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourAdminResponse>> getTourById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TourAdminResponse>builder()
                .status(200)
                .message("Lấy thông tin tour thành công")
                .data(tourService.getTourById(id))
                .build());
    }

    // 3. Tạo mới tour
    @PostMapping
    public ResponseEntity<ApiResponse<TourAdminResponse>> createTour(@Valid @RequestBody TourCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<TourAdminResponse>builder()
                .status(201)
                .message("Tạo tour mới thành công")
                .data(tourService.createTour(request))
                .build());
    }

    // 4. Cập nhật tour
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TourAdminResponse>> updateTour(
            @PathVariable Long id,
            @Valid @RequestBody TourUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<TourAdminResponse>builder()
                .status(200)
                .message("Cập nhật tour thành công")
                .data(tourService.updateTour(id, request))
                .build());
    }

    // 5. Xóa mềm tour (chuyển sang INACTIVE)
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Ẩn tour thành công")
                .data(null)
                .build());
    }
   
}