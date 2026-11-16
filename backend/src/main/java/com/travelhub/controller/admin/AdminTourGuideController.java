package com.travelhub.controller.admin;

import com.travelhub.dto.request.TourGuideRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.TourGuideResponse;
import com.travelhub.dto.response.UserResponse;
import com.travelhub.service.TourGuideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/tour-guides")
@RequiredArgsConstructor
public class AdminTourGuideController {

    private final TourGuideService tourGuideService;

    // 1. Khi mở Modal: Lấy danh sách HDV đang dẫn đợt khởi hành này
    // URL: GET http://localhost:8081/api/v1/admin/tour-guides/departure/{departureId}
    @GetMapping("/departure/{departureId}")
    public ResponseEntity<ApiResponse<List<TourGuideResponse>>> getGuidesByDepartureId(@PathVariable Long departureId) {
        return ResponseEntity.ok(ApiResponse.<List<TourGuideResponse>>builder()
                .status(200)
                .message("Lấy danh sách hướng dẫn viên theo đợt khởi hành thành công")
                .data(tourGuideService.getGuidesByDepartureId(departureId))
                .build());
    }

    // 2. Lấy danh sách tất cả tài khoản có quyền HDV (ROLE_GUIDE) để đổ vào Dropdown Select của Modal
    // URL: GET http://localhost:8081/api/v1/admin/tour-guides/available-guides
    @GetMapping("/available-guides")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAvailableGuides() {
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .status(200)
                .message("Lấy danh sách hướng dẫn viên khả dụng thành công")
                .data(tourGuideService.getAvailableGuides())
                .build());
    }

    // 3. Lấy thông tin chi tiết 1 phân công theo ID
    // URL: GET http://localhost:8081/api/v1/admin/tour-guides/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourGuideResponse>> getGuideAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TourGuideResponse>builder()
                .status(200)
                .message("Lấy thông tin phân công hướng dẫn viên thành công")
                .data(tourGuideService.getGuideAssignmentById(id))
                .build());
    }

    // 4. Phân công HDV vào đợt khởi hành (Bấm nút [Lưu phân công] trong Modal)
    // URL: POST http://localhost:8081/api/v1/admin/tour-guides
    @PostMapping
    public ResponseEntity<ApiResponse<TourGuideResponse>> assignGuide(
            @Valid @RequestBody TourGuideRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<TourGuideResponse>builder()
                .status(201)
                .message("Phân công hướng dẫn viên thành công")
                .data(tourGuideService.assignGuide(request))
                .build());
    }

    // 5. Cập nhật phân công (Đổi vai trò trưởng đoàn hoặc đổi người khác)
    // URL: PUT http://localhost:8081/api/v1/admin/tour-guides/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TourGuideResponse>> updateGuideAssignment(
            @PathVariable Long id,
            @Valid @RequestBody TourGuideRequest request) {
        return ResponseEntity.ok(ApiResponse.<TourGuideResponse>builder()
                .status(200)
                .message("Cập nhật phân công hướng dẫn viên thành công")
                .data(tourGuideService.updateGuideAssignment(id, request))
                .build());
    }

    // 6. Hủy phân công HDV (Bấm icon [Xóa] trong Modal)
    // URL: DELETE http://localhost:8081/api/v1/admin/tour-guides/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeGuideAssignment(@PathVariable Long id) {
        tourGuideService.removeGuideAssignment(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Hủy phân công hướng dẫn viên thành công")
                .data(null)
                .build());
    }
}