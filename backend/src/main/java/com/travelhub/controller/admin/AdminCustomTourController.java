package com.travelhub.controller.admin;

import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.CustomTourResponse;
import com.travelhub.enums.CustomTourStatus;
import com.travelhub.service.CustomTourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/custom-tours")
@RequiredArgsConstructor
public class AdminCustomTourController {

    private final CustomTourService customTourService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomTourResponse>>> getAllRequests() {
        return ResponseEntity.ok(ApiResponse.<List<CustomTourResponse>>builder()
                .status(200)
                .message("Lấy danh sách yêu cầu tour đoàn thành công")
                .data(customTourService.getAllRequests())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomTourResponse>> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<CustomTourResponse>builder()
                .status(200)
                .message("Lấy chi tiết yêu cầu thành công")
                .data(customTourService.getRequestById(id))
                .build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CustomTourResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam CustomTourStatus status) {

        return ResponseEntity.ok(ApiResponse.<CustomTourResponse>builder()
                .status(200)
                .message("Cập nhật trạng thái xử lý thành công")
                .data(customTourService.updateStatus(id, status))
                .build());
    }
}