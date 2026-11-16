package com.travelhub.enums;

public enum NotificationType {
    NEW_BOOKING,       // Có đơn đặt tour mới (Gửi Admin)
    PAYMENT_SUCCESS,   // Thanh toán đơn hàng thành công (Gửi Khách & Admin)
    BOOKING_CANCEL,    // Yêu cầu hủy tour hoàn tiền (Gửi Admin)
    GUIDE_ASSIGNED,    // Phân công hướng dẫn viên (Gửi Guide)
    SYSTEM_ALERT       // Thông báo hệ thống
}