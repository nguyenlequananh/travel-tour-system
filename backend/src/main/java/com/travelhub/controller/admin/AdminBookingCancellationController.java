package com.travelhub.controller.admin;

import com.travelhub.dto.request.CancellationRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.CancellationResponse;
import com.travelhub.service.BookingCancellationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/cancellations")
@RequiredArgsConstructor
public class AdminBookingCancellationController {

    private final BookingCancellationService cancellationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CancellationResponse>>> getAllCancellations() {
        return ResponseEntity.ok(ApiResponse.<List<CancellationResponse>>builder()
                .status(200)
                .message("Lấy danh sách yêu cầu hủy thành công")
                .data(cancellationService.getAllCancellations())
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CancellationResponse>> requestCancellation(
            @Valid @RequestBody CancellationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<CancellationResponse>builder()
                .status(201)
                .message("Tạo yêu cầu hủy tour và hoàn trả chỗ thành công")
                .data(cancellationService.requestCancellation(request))
                .build());
    }

    @PatchMapping("/{id}/confirm-refund")
    public ResponseEntity<ApiResponse<CancellationResponse>> confirmRefund(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<CancellationResponse>builder()
                .status(200)
                .message("Xác nhận hoàn tiền thành công")
                .data(cancellationService.confirmRefund(id))
                .build());
    }
}