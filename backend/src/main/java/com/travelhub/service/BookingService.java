package com.travelhub.service;

import com.travelhub.dto.request.BookingCreateRequest;
import com.travelhub.dto.response.BookingResponse;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.PaymentStatus;

import java.util.List;

public interface BookingService {

    // 1. Tạo đơn đặt tour (Trọng tâm: Trừ số ghế, tính tiền, lưu hành khách)
    BookingResponse createBooking(BookingCreateRequest request);

    // 2. Lấy chi tiết đơn đặt tour theo ID
    BookingResponse getBookingById(Long id);

    // 3. Tra cứu đơn đặt tour theo Mã Code (vd: BK-202611-0089)
    BookingResponse getBookingByCode(String bookingCode);

    // 4. Lấy tất cả đơn đặt tour (dành cho Admin quản lý)
    List<BookingResponse> getAllBookings();

    // 5. Lấy lịch sử đặt tour của 1 Khách hàng cụ thể
    List<BookingResponse> getBookingsByUserId(Long userId);

    // 6. Cập nhật trạng thái đơn (vd: PENDING -> CONFIRMED)
    BookingResponse updateBookingStatus(Long id, BookingStatus status);

    // 7. Cập nhật trạng thái thanh toán (vd: UNPAID -> PAID)
    BookingResponse updatePaymentStatus(Long id, PaymentStatus status);

    // 8. Hủy đơn đặt tour (Hoàn lại số ghế trống vào kho)
    void cancelBooking(Long id);
}