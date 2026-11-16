package com.travelhub.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.travelhub.config.RabbitMQConfig;
import com.travelhub.dto.message.BookingEmailMessage;
import com.travelhub.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingEmailConsumer {

    private final EmailService emailService;

    // Chiếc tai nghe trực 24/7 ở hàng đợi booking_email_queue
    @RabbitListener(queues = RabbitMQConfig.BOOKING_EMAIL_QUEUE)
    public void consumeBookingEmail(BookingEmailMessage message) {
        log.info("📩 [RABBITMQ CONSUMER] Nhận được yêu cầu gửi email cho vé: {}", message.getBookingCode());
        
        // Gọi Service gửi mail
        emailService.sendBookingConfirmationEmail(message);
        
        log.info("✅ [RABBITMQ CONSUMER] Hoàn tất xử lý gửi email cho vé: {}", message.getBookingCode());
    }
}