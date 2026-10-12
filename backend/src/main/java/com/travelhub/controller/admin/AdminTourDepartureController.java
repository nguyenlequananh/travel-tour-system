package com.travelhub.controller.admin;

import com.travelhub.dto.request.TourDepartureCreateRequest;
import com.travelhub.dto.request.TourDepartureUpdateRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.TourDepartureResponse;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.service.TourDepartureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/departures")
@RequiredArgsConstructor
public class AdminTourDepartureController {

    private final TourDepartureService departureService;

    // 1. Lấy tất cả các đợt đi của 1 Tour cụ thể
    @GetMapping("/tour/{tourId}")
    public ResponseEntity<ApiResponse<List<TourDepartureResponse>>> getDeparturesByTourId(@PathVariable Long tourId) {
        ApiResponse<List<TourDepartureResponse>> response = ApiResponse.<List<TourDepartureResponse>>builder()
                .status(200)
                .message("Lấy danh sách đợt khởi hành của tour thành công")
                .data(departureService.getDeparturesByTourId(tourId))
                .build();
        return ResponseEntity.ok(response);
    }

    // 2. Lấy chi tiết 1 đợt khởi hành theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourDepartureResponse>> getDepartureById(@PathVariable Long id) {
        ApiResponse<TourDepartureResponse> response = ApiResponse.<TourDepartureResponse>builder()
                .status(200)
                .message("Lấy thông tin đợt khởi hành thành công")
                .data(departureService.getDepartureById(id))
                .build();
        return ResponseEntity.ok(response);
    }

    // 3. Mở bán đợt khởi hành mới (POST) - ĐÃ TÁCH 2 DÒNG ĐỂ HẾT LỖI
    @PostMapping
    public ResponseEntity<ApiResponse<TourDepartureResponse>> createDeparture(
            @Valid @RequestBody TourDepartureCreateRequest request) {
        
        ApiResponse<TourDepartureResponse> response = ApiResponse.<TourDepartureResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Mở bán đợt khởi hành mới thành công")
                .data(departureService.createDeparture(request))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 4. Cập nhật đợt khởi hành (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TourDepartureResponse>> updateDeparture(
            @PathVariable Long id,
            @Valid @RequestBody TourDepartureUpdateRequest request) {
        
        ApiResponse<TourDepartureResponse> response = ApiResponse.<TourDepartureResponse>builder()
                .status(200)
                .message("Cập nhật đợt khởi hành thành công")
                .data(departureService.updateDeparture(id, request))
                .build();

        return ResponseEntity.ok(response);
    }

    // 5. Đổi trạng thái (vd: Khóa sổ CLOSED hoặc Hủy chuyến CANCELLED)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> changeStatus(
            @PathVariable Long id,
            @RequestParam DepartureStatus status) {
        
        departureService.changeDepartureStatus(id, status);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(200)
                .message("Cập nhật trạng thái đợt khởi hành thành công")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }
}