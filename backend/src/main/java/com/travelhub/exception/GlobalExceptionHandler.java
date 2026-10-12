package com.travelhub.exception;

import com.travelhub.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Objects;

@RestControllerAdvice // Đánh dấu đây là lưới hứng lỗi tập trung của toàn bộ Controller
public class GlobalExceptionHandler {

    // 1. HỨNG TẤT CẢ CÁC LỖI NGHIỆP VỤ (Do chính bạn ném ra trong Service)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<Void>builder()
                .status(HttpStatus.BAD_REQUEST.value()) // Trả về mã 400 Bad Request sạch sẽ!
                .message(ex.getMessage())              // Lấy đúng câu chữ tiếng Việt của bạn
                .data(null)
                .build());
    }

    // 2. HỨNG CÁC LỖI VALIDATION (Khi vi phạm @NotBlank, @NotNull, @Email trong DTO)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        // Lấy câu thông báo lỗi đầu tiên trong validation
        String errorMessage = Objects.requireNonNull(ex.getBindingResult().getFieldError()).getDefaultMessage();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.<Void>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(errorMessage)
                .data(null)
                .build());
    }

    // 3. HỨNG CÁC LỖI HỆ THỐNG KHÔNG XÁC ĐỊNH (Phòng thủ cuối cùng)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.<Void>builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("Hệ thống xảy ra lỗi không mong muốn, vui lòng thử lại sau!")
                .data(null)
                .build());
    }
}