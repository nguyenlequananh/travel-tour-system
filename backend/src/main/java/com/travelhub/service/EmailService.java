package com.travelhub.service;

import com.travelhub.dto.message.BookingEmailMessage;
import com.travelhub.dto.message.RefundEmailMessage;

public interface EmailService {
    // Hàm nhận vào đối tượng Booking (chứa toàn bộ thông tin vé vừa đặt)
    void sendBookingConfirmationEmail(BookingEmailMessage bookingEmailMessage);
    void sendRefundConfirmationEmail(RefundEmailMessage refundEmailMessage);
}