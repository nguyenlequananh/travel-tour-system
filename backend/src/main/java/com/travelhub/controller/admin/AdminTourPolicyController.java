package com.travelhub.controller.admin;

import com.travelhub.dto.request.TourPolicyRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.TourPolicyResponse;
import com.travelhub.service.TourPolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/policies")
@RequiredArgsConstructor
public class AdminTourPolicyController {

    private final TourPolicyService policyService;

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<ApiResponse<List<TourPolicyResponse>>> getPoliciesByTourId(@PathVariable Long tourId) {
        return ResponseEntity.ok(ApiResponse.<List<TourPolicyResponse>>builder()
                .status(200)
                .message("Lấy danh sách chính sách thành công")
                .data(policyService.getPoliciesByTourId(tourId))
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourPolicyResponse>> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TourPolicyResponse>builder()
                .status(200)
                .message("Lấy thông tin chính sách thành công")
                .data(policyService.getPolicyById(id))
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TourPolicyResponse>> createPolicy(
            @Valid @RequestBody TourPolicyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<TourPolicyResponse>builder()
                .status(201)
                .message("Thêm chính sách mới thành công")
                .data(policyService.createPolicy(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TourPolicyResponse>> updatePolicy(
            @PathVariable Long id,
            @Valid @RequestBody TourPolicyRequest request) {
        return ResponseEntity.ok(ApiResponse.<TourPolicyResponse>builder()
                .status(200)
                .message("Cập nhật chính sách thành công")
                .data(policyService.updatePolicy(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa chính sách thành công")
                .data(null)
                .build());
    }
}