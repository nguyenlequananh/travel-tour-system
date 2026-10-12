package com.travelhub.controller.admin;

import com.travelhub.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.travelhub.service.UserService;
import com.travelhub.dto.response.UserResponse;
import com.travelhub.dto.request.UserCreateRequest;
import com.travelhub.dto.request.UserUpdateRequest;

@RestController // 1. Đánh dấu đây là Controller chuyên trả về JSON (dành cho React)
@RequestMapping("/api/v1/admin/users") // 2. Đường dẫn tiền tố chung cho tất cả các API bên dưới
@RequiredArgsConstructor 
public class AdminUserController {
    public final UserService userService;
    
    @GetMapping 
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(){
        ApiResponse<List<UserResponse>> response =  ApiResponse.<List<UserResponse>>builder()
                .status(200)
                .message("Lấy danh sách người dùng thành công")
                .data(userService.getAllUsers())
                .build();
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id){
        ApiResponse<UserResponse> response = ApiResponse.<UserResponse>builder()
                .status(200)
                .message("Lấy thông tin người dùng thành công")
                .data(userService.getUserById(id))
                .build();
        return ResponseEntity.ok(response);
    }
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request){
        ApiResponse<UserResponse> response = ApiResponse.<UserResponse>builder()
                .status(201)
                .message("")
                .data(userService.createUser(request))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PutMapping ("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request){
        ApiResponse<UserResponse> response = ApiResponse.<UserResponse>builder()
                .status(200)
                .message("Sửa thông tin người dùng thành công")
                .data( userService.updateUser(id, request))
                .build();
        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id){
        userService.deleteUser(id);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa người dùng thành công")
                .data(null)
                .build();
        return ResponseEntity.ok(response);
    }
}
