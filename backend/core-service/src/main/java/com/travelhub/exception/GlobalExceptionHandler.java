package com.travelhub.exception;

import com.travelhub.dto.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Objects;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. LỖI VALIDATION (@NotBlank, @NotNull, @Email... trên DTO) -> HTTP 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = Objects.requireNonNull(ex.getBindingResult().getFieldError()).getDefaultMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<Void>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(errorMessage)
                .data(null)
                .build());
    }

    // 2. LỖI DỮ LIỆU ĐẦU VÀO KHÔNG ĐÚNG ĐỊNH DẠNG (Sai Enum, sai format JSON, sai kiểu ngày...) -> HTTP 400
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<Void>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Dữ liệu gửi lên không đúng định dạng hoặc giá trị không hợp lệ")
                .data(null)
                .build());
    }

    // 3. LỖI SAI KIỂU DỮ LIỆU TRÊN ĐƯỜNG DẪN URL (Ví dụ: /tours/abc thay vì /tours/1) -> HTTP 400
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Tham số '%s' có giá trị không hợp lệ", ex.getName());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<Void>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(message)
                .data(null)
                .build());
    }

    // 4. LỖI BẢO MẬT: KHÔNG ĐỦ QUYỀN TRUY CẬP -> HTTP 403 FORBIDDEN
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.<Void>builder()
                .status(HttpStatus.FORBIDDEN.value())
                .message("Bạn không có quyền thực hiện thao tác này")
                .data(null)
                .build());
    }

    // 5. LỖI ĐĂNG NHẬP: SAI EMAIL HOẶC MẬT KHẨU -> HTTP 401 UNAUTHORIZED
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.<Void>builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Tài khoản hoặc mật khẩu không chính xác")
                .data(null)
                .build());
    }

    // 6. LỖI NGHIỆP VỤ DO LẬP TRÌNH VIÊN NÉM RA (throw new RuntimeException("...")) -> HTTP 400
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<Void>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .data(null)
                .build());
    }

    // 7. LỖI HỆ THỐNG KHÔNG XÁC ĐỊNH (Phòng tuyến cuối cùng) -> HTTP 500 INTERNAL SERVER ERROR
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.<Void>builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("Hệ thống xảy ra lỗi không mong muốn, vui lòng thử lại sau!")
                .data(null)
                .build());
    }
}   