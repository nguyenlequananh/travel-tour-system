package com.travelhub.controller.client;

import com.travelhub.dto.request.LoginRequest;
import com.travelhub.dto.request.UserCreateRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.AuthResponse;
import com.travelhub.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 1. ĐĂNG NHẬP
    // URL: POST http://localhost:8081/api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .status(200)
                .message("Đăng nhập thành công!")
                .data(response)
                .build());
    }

    // 2. ĐĂNG KÝ
    // URL: POST http://localhost:8081/api/v1/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody UserCreateRequest request) {
        AuthResponse response = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<AuthResponse>builder()
                .status(201)
                .message("Đăng ký tài khoản thành công!")
                .data(response)
                .build());
    }
}