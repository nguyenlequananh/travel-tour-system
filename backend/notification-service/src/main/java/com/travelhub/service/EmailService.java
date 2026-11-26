package com.travelhub.service;

import com.travelhub.dto.message.BookingEmailMessage;
import com.travelhub.dto.message.RefundEmailMessage;

public interface EmailService {

    void sendBookingConfirmationEmail(BookingEmailMessage emailMsg);

    void sendRefundConfirmationEmail(RefundEmailMessage refundEmailMessage);
}
