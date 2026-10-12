package com.travelhub.controller.admin;

import com.travelhub.dto.request.TourItineraryRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.TourItineraryResponse;
import com.travelhub.service.TourItineraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/itineraries")
@RequiredArgsConstructor
public class AdminTourItineraryController {

    private final TourItineraryService itineraryService;

    // 1. Lấy toàn bộ lịch trình của một Tour (xếp Ngày 1 -> 2 -> 3)
    // URL: GET http://localhost:8081/api/v1/admin/itineraries/tour/{tourId}
    @GetMapping("/tour/{tourId}")
    public ResponseEntity<ApiResponse<List<TourItineraryResponse>>> getItinerariesByTourId(@PathVariable Long tourId) {
        return ResponseEntity.ok(ApiResponse.<List<TourItineraryResponse>>builder()
                .status(200)
                .message("Lấy danh sách lịch trình của tour thành công")
                .data(itineraryService.getItinerariesByTourId(tourId))
                .build());
    }

    // 2. Lấy chi tiết lịch trình của 1 ngày cụ thể
    // URL: GET http://localhost:8081/api/v1/admin/itineraries/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourItineraryResponse>> getItineraryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TourItineraryResponse>builder()
                .status(200)
                .message("Lấy thông tin lịch trình thành công")
                .data(itineraryService.getItineraryById(id))
                .build());
    }

    // 3. Thêm mới 1 ngày lịch trình (POST)
    // URL: POST http://localhost:8081/api/v1/admin/itineraries
    @PostMapping
    public ResponseEntity<ApiResponse<TourItineraryResponse>> createItinerary(
            @Valid @RequestBody TourItineraryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<TourItineraryResponse>builder()
                .status(201)
                .message("Tạo lịch trình ngày mới thành công")
                .data(itineraryService.createItinerary(request))
                .build());
    }

    // 4. Cập nhật lịch trình của 1 ngày (PUT)
    // URL: PUT http://localhost:8081/api/v1/admin/itineraries/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TourItineraryResponse>> updateItinerary(
            @PathVariable Long id,
            @Valid @RequestBody TourItineraryRequest request) {
        return ResponseEntity.ok(ApiResponse.<TourItineraryResponse>builder()
                .status(200)
                .message("Cập nhật lịch trình thành công")
                .data(itineraryService.updateItinerary(id, request))
                .build());
    }

    // 5. Xóa cứng 1 ngày lịch trình (DELETE)
    // URL: DELETE http://localhost:8081/api/v1/admin/itineraries/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItinerary(@PathVariable Long id) {
        itineraryService.deleteItinerary(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa lịch trình thành công")
                .data(null)
                .build());
    }
}