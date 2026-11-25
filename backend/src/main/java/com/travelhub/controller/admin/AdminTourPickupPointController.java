package com.travelhub.controller.admin;

import com.travelhub.dto.request.TourPickupPointRequest;
import com.travelhub.dto.common.ApiResponse;
import com.travelhub.dto.response.TourPickupPointResponse;
import com.travelhub.service.TourPickupPointService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/pickup-points")
@RequiredArgsConstructor
public class AdminTourPickupPointController {

    private final TourPickupPointService pickupPointService;

    // 1. Lấy tất cả điểm đón của 1 đợt khởi hành cụ thể
    // URL: GET http://localhost:8081/api/v1/admin/pickup-points/departure/{departureId}
    @GetMapping("/departure/{departureId}")
    public ResponseEntity<ApiResponse<List<TourPickupPointResponse>>> getPickupPointsByDepartureId(@PathVariable Long departureId) {
        return ResponseEntity.ok(ApiResponse.<List<TourPickupPointResponse>>builder()
                .status(200)
                .message("Lấy danh sách điểm đón thành công")
                .data(pickupPointService.getPickupPointsByDepartureId(departureId))
                .build());
    }

    // 2. Lấy chi tiết 1 điểm đón theo ID
    // URL: GET http://localhost:8081/api/v1/admin/pickup-points/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourPickupPointResponse>> getPickupPointById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TourPickupPointResponse>builder()
                .status(200)
                .message("Lấy thông tin điểm đón thành công")
                .data(pickupPointService.getPickupPointById(id))
                .build());
    }

    // 3. Thêm mới 1 điểm đón (POST)
    // URL: POST http://localhost:8081/api/v1/admin/pickup-points
    @PostMapping
    public ResponseEntity<ApiResponse<TourPickupPointResponse>> createPickupPoint(
            @Valid @RequestBody TourPickupPointRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<TourPickupPointResponse>builder()
                .status(201)
                .message("Thêm điểm đón mới thành công")
                .data(pickupPointService.createPickupPoint(request))
                .build());
    }

    // 4. Cập nhật thông tin điểm đón (PUT)
    // URL: PUT http://localhost:8081/api/v1/admin/pickup-points/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TourPickupPointResponse>> updatePickupPoint(
            @PathVariable Long id,
            @Valid @RequestBody TourPickupPointRequest request) {
        return ResponseEntity.ok(ApiResponse.<TourPickupPointResponse>builder()
                .status(200)
                .message("Cập nhật điểm đón thành công")
                .data(pickupPointService.updatePickupPoint(id, request))
                .build());
    }

    // 5. Xóa 1 điểm đón (DELETE - Xóa cứng)
    // URL: DELETE http://localhost:8081/api/v1/admin/pickup-points/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePickupPoint(@PathVariable Long id) {
        pickupPointService.deletePickupPoint(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa điểm đón thành công")
                .data(null)
                .build());
    }
}