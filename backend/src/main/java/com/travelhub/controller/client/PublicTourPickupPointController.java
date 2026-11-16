package com.travelhub.controller.client;
    
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.TourPickupPointResponse;
import com.travelhub.service.TourPickupPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pickup-points")
@RequiredArgsConstructor
public class PublicTourPickupPointController {

    private final TourPickupPointService pickupPointService;

    /**
     * API công khai (Public): Dùng cho cả Khách hàng đặt tour và Tour Guide / Tài xế xem danh sách điểm đón
     * URL: GET http://localhost:8081/api/v1/pickup-points/departure/{departureId}
     */
    @GetMapping("/departure/{departureId}")
    public ResponseEntity<ApiResponse<List<TourPickupPointResponse>>> getPickupPointsByDepartureId(@PathVariable Long departureId) {
        return ResponseEntity.ok(ApiResponse.<List<TourPickupPointResponse>>builder()
                .status(200)
                .message("Lấy danh sách điểm đón thành công")
                .data(pickupPointService.getPickupPointsByDepartureId(departureId))
                .build());
    }

    /**
     * API xem chi tiết 1 điểm đón cụ thể
     * URL: GET http://localhost:8081/api/v1/pickup-points/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourPickupPointResponse>> getPickupPointById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TourPickupPointResponse>builder()
                .status(200)
                .message("Lấy thông tin điểm đón thành công")
                .data(pickupPointService.getPickupPointById(id))
                .build());
    }
}