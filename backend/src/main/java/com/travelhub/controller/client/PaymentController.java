package com.travelhub.controller.client;

import com.travelhub.dto.response.ApiResponse;
import com.travelhub.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final VnPayService vnPayService;

    // 1. Tạo Link thanh toán VNPay
    // URL: POST http://localhost:8081/api/v1/payments/create-vnpay-url?bookingId=1
    @PostMapping("/create-vnpay-url")
    public ResponseEntity<ApiResponse<String>> createVnPayUrl(
            @RequestParam Long bookingId,
            HttpServletRequest request) {

        String paymentUrl = vnPayService.createPaymentUrl(bookingId, request);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .status(200)
                .message("Tạo đường dẫn thanh toán VNPay thành công!")
                .data(paymentUrl)
                .build());
    }

    // 2. Hứng kết quả VNPay trả về
    // URL: GET http://localhost:8081/api/v1/payments/vnpay-callback?...
    @GetMapping("/vnpay-callback")
    public ResponseEntity<ApiResponse<Boolean>> handleVnPayCallback(
            @RequestParam Map<String, String> queryParams) {

        boolean isSuccess = vnPayService.processPaymentCallback(queryParams);

        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .status(isSuccess ? 200 : 400)
                .message(isSuccess ? "Thanh toán đơn hàng thành công!" : "Giao dịch thanh toán thất bại hoặc đã bị hủy!")
                .data(isSuccess)
                .build());
    }
}