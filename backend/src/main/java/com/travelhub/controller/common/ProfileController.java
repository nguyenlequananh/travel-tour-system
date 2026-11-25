package com.travelhub.controller.common;

import com.travelhub.dto.request.ChangePasswordRequest;
import com.travelhub.dto.request.ProfileUpdateRequest;
import com.travelhub.dto.common.ApiResponse;
import com.travelhub.dto.response.UserResponse;
import com.travelhub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    // 1. Xem thông tin của chính mình
    @GetMapping
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(Authentication authentication) {
        String email = authentication.getName(); // Lấy email trực tiếp từ JWT Token
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .status(200)
                .message("Lấy thông tin cá nhân thành công")
                .data(userService.getProfile(email))
                .build());
    }

    // 2. Cập nhật thông tin cá nhân
    @PutMapping
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .status(200)
                .message("Cập nhật thông tin cá nhân thành công")
                .data(userService.updateProfile(email, request))
                .build());
    }

    // 3. Đổi mật khẩu
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = authentication.getName();
        userService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.")
                .data(null)
                .build());
    }
}