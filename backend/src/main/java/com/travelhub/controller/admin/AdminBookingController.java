package com.travelhub.controller.admin;

import com.travelhub.dto.request.BookingCreateRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.BookingResponse;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    // 1. Lấy tất cả đơn đặt tour
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings() {
        ApiResponse<List<BookingResponse>> response = ApiResponse.<List<BookingResponse>>builder()
                .status(200)
                .message("Lấy danh sách đơn đặt tour thành công")
                .data(bookingService.getAllBookings())
                .build();
        return ResponseEntity.ok(response);
    }

    // 2. Lấy chi tiết đơn đặt tour theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        ApiResponse<BookingResponse> response = ApiResponse.<BookingResponse>builder()
                .status(200)
                .message("Lấy thông tin đơn đặt tour thành công")
                .data(bookingService.getBookingById(id))
                .build();
        return ResponseEntity.ok(response);
    }

    // 3. Tra cứu đơn đặt tour theo Mã Code (vd: BK-202611-0089)
    @GetMapping("/code/{bookingCode}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByCode(@PathVariable String bookingCode) {
        ApiResponse<BookingResponse> response = ApiResponse.<BookingResponse>builder()
                .status(200)
                .message("Tra cứu mã đơn thành công")
                .data(bookingService.getBookingByCode(bookingCode))
                .build();
        return ResponseEntity.ok(response);
    }

    // 4. Lấy lịch sử đặt tour của 1 người dùng cụ thể
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByUserId(@PathVariable Long userId) {
        ApiResponse<List<BookingResponse>> response = ApiResponse.<List<BookingResponse>>builder()
                .status(200)
                .message("Lấy lịch sử đơn đặt của người dùng thành công")
                .data(bookingService.getBookingsByUserId(userId))
                .build();
        return ResponseEntity.ok(response);
    }

    // 5. Tạo đơn đặt tour mới (POST) - Trừ ghế, tính tiền, lưu hành khách
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingCreateRequest request) {
        
        ApiResponse<BookingResponse> response = ApiResponse.<BookingResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Đặt tour thành công!")
                .data(bookingService.createBooking(request))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 6. Cập nhật tiến độ chuyến đi (vd: PENDING -> CONFIRMED)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        
        ApiResponse<BookingResponse> response = ApiResponse.<BookingResponse>builder()
                .status(200)
                .message("Cập nhật trạng thái đơn thành công")
                .data(bookingService.updateBookingStatus(id, status))
                .build();

        return ResponseEntity.ok(response);
    }

    // 7. Cập nhật trạng thái thanh toán (vd: UNPAID -> PAID)
    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<ApiResponse<BookingResponse>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        
        ApiResponse<BookingResponse> response = ApiResponse.<BookingResponse>builder()
                .status(200)
                .message("Cập nhật trạng thái thanh toán thành công")
                .data(bookingService.updatePaymentStatus(id, status))
                .build();

        return ResponseEntity.ok(response);
    }

    // 8. Hủy đơn đặt tour (Hoàn lại ghế trống vào kho)
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(200)
                .message("Hủy đơn đặt tour và hoàn lại số ghế thành công")
                .data(null)
                .build();

        return ResponseEntity.ok(response);
    }
}