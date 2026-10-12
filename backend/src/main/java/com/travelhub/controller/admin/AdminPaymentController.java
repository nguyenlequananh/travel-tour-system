package com.travelhub.controller.admin;

import com.travelhub.dto.request.PaymentCreateRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.PaymentResponse;
import com.travelhub.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    // 1. Lấy danh sách toàn bộ giao dịch thanh toán
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.<List<PaymentResponse>>builder()
                .status(200)
                .message("Lấy danh sách thanh toán thành công")
                .data(paymentService.getAllPayments())
                .build());
    }

    // 2. Lấy chi tiết 1 giao dịch
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                .status(200)
                .message("Lấy thông tin thanh toán thành công")
                .data(paymentService.getPaymentById(id))
                .build());
    }

    // 3. Lấy lịch sử các lần thanh toán của 1 đơn đặt tour cụ thể
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(ApiResponse.<List<PaymentResponse>>builder()
                .status(200)
                .message("Lấy lịch sử thanh toán của đơn thành công")
                .data(paymentService.getPaymentsByBookingId(bookingId))
                .build());
    }

    // 4. Tạo giao dịch thanh toán thủ công (vd: Khách đóng tiền mặt tại quầy)
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody PaymentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<PaymentResponse>builder()
                .status(201)
                .message("Ghi nhận thanh toán thành công")
                .data(paymentService.processPayment(request))
                .build());
    }
}