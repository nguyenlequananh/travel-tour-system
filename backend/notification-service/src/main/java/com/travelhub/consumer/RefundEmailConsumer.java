package com.travelhub.consumer;

import com.travelhub.config.RabbitMQConfig;
import com.travelhub.dto.message.RefundEmailMessage;
import com.travelhub.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RefundEmailConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.REFUND_EMAIL_QUEUE)
    public void handleRefundEmail(RefundEmailMessage message) {
        log.info("📩 [RABBITMQ CONSUMER] Nhận message hoàn tiền cho đơn: {}", message.getBookingCode());
        emailService.sendRefundConfirmationEmail(message);
    }
}