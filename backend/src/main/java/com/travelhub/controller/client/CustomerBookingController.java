package com.travelhub.controller.client;

import com.travelhub.dto.request.BookingCreateRequest;
import com.travelhub.dto.request.CancellationRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.BookingResponse;
import com.travelhub.dto.response.CancellationResponse;
import com.travelhub.service.BookingCancellationService;
import com.travelhub.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings") // Đường dẫn cho khách thao tác đặt và quản lý vé
@RequiredArgsConstructor
public class CustomerBookingController {

    private final BookingService bookingService;
    private final BookingCancellationService cancellationService;

    // 1. Khách bấm Đặt Tour
    // URL: POST http://localhost:8081/api/v1/bookings
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingCreateRequest request) {

        BookingResponse response = bookingService.createBooking(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<BookingResponse>builder()
                .status(201)
                .message("Đặt tour thành công! Vui lòng tiến hành thanh toán.")
                .data(response)
                .build());
    }

    // 2. Khách xem danh sách các vé của chính mình
    // URL: GET http://localhost:8081/api/v1/bookings/my-bookings?userId=3
    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @RequestParam Long userId) {

        List<BookingResponse> myBookings = bookingService.getBookingsByUserId(userId);

        return ResponseEntity.ok(ApiResponse.<List<BookingResponse>>builder()
                .status(200)
                .message("Lấy danh sách đơn đặt của bạn thành công")
                .data(myBookings)
                .build());
    }

    // 3. Khách tra cứu thông tin vé qua Mã Đơn (vd: BK-202410-001)
    // URL: GET http://localhost:8081/api/v1/bookings/track/BK-202410-001
    @GetMapping("/track/{bookingCode}")
    public ResponseEntity<ApiResponse<BookingResponse>> trackBooking(
            @PathVariable String bookingCode) {

        BookingResponse response = bookingService.getBookingByCode(bookingCode);

        return ResponseEntity.ok(ApiResponse.<BookingResponse>builder()
                .status(200)
                .message("Tra cứu thông tin vé thành công")
                .data(response)
                .build());
    }

    // 4. Khách tự yêu cầu Hủy vé
    // URL: POST http://localhost:8081/api/v1/bookings/cancel
    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<CancellationResponse>> requestCancel(
            @Valid @RequestBody CancellationRequest request) {

        CancellationResponse response = cancellationService.requestCancellation(request);

        return ResponseEntity.ok(ApiResponse.<CancellationResponse>builder()
                .status(200)
                .message("Gửi yêu cầu hủy tour thành công!")
                .data(response)
                .build());
    }
}