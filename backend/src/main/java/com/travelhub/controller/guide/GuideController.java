package com.travelhub.controller.guide;

import com.travelhub.dto.common.ApiResponse;
import com.travelhub.dto.response.GuideDepartureResponse;
import com.travelhub.dto.response.GuidePassengerResponse;
import com.travelhub.service.GuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/guide")
@RequiredArgsConstructor
public class GuideController {

    private final GuideService guideService;

    // 1. HDV xem các chuyến đi mà mình được phân công phụ trách
    // URL: GET http://localhost:8081/api/v1/guide/my-departures?userId=5
    @GetMapping("/my-departures")
    public ResponseEntity<ApiResponse<List<GuideDepartureResponse>>> getMyAssignedDepartures(
            @RequestParam Long userId) {

        return ResponseEntity.ok(ApiResponse.<List<GuideDepartureResponse>>builder()
                .status(200)
                .message("Lấy danh sách chuyến đi phụ trách thành công")
                .data(guideService.getMyAssignedDepartures(userId))
                .build());
    }

    // 2. HDV xem danh sách đoàn khách chi tiết (để đón khách và điểm danh)
    // URL: GET http://localhost:8081/api/v1/guide/departures/{departureId}/passengers?userId=5
    @GetMapping("/departures/{departureId}/passengers")
    public ResponseEntity<ApiResponse<List<GuidePassengerResponse>>> getDeparturePassengers(
            @PathVariable Long departureId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(ApiResponse.<List<GuidePassengerResponse>>builder()
                .status(200)
                .message("Lấy danh sách đoàn khách thành công")
                .data(guideService.getDeparturePassengers(departureId, userId))
                .build());
    }
}