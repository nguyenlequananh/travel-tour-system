package com.travelhub.config;

import org.springframework.amqp.core.Binding; // ✅ ĐÚNG (Thư viện của Spring AMQP)
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.RepublishMessageRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.amqp.core.Message;

import org.springframework.amqp.rabbit.retry.MessageRecoverer;

@Configuration
public class RabbitMQConfig {

    public static final String BOOKING_EMAIL_QUEUE = "booking_email_queue";
    public static final String GLOBAL_DEAD_LETTER_EXCHANGE = "travelhub_dead_letter_exchange";
    public static final String BOOKING_EMAIL_DLQ = "booking_email_dlq";
    public static final String BOOKING_EMAIL_ROUTING_KEY = "booking.email.fail";

    public static final String REFUND_EMAIL_QUEUE = "refund_email_queue";
    public static final String REFUND_EMAIL_DLQ = "refund_email_dlq";
    public static final String REFUND_EMAIL_ROUTING_KEY = "refund.email.fail";

    @Bean
    public Queue bookingEmailQueue() {
        return new Queue(BOOKING_EMAIL_QUEUE, true);
    }

    @Bean
    public Queue refundEmailQueue() {
        return new Queue(REFUND_EMAIL_QUEUE, true);
    }

    @Bean 
    public DirectExchange globalDeadLetterExchange() {
        return new DirectExchange(GLOBAL_DEAD_LETTER_EXCHANGE);
    }

    @Bean 
    public Queue bookingEmailDLQ() {
        return new Queue(BOOKING_EMAIL_DLQ, true);
    }

    @Bean 
    public Queue refundEmailDLQ() {
        return new Queue(REFUND_EMAIL_DLQ, true);
    }

    @Bean
    public Binding refundEmailDLQBinding(){
        return BindingBuilder.bind(refundEmailDLQ())
            .to(globalDeadLetterExchange())
            .with(REFUND_EMAIL_ROUTING_KEY);
    }

    @Bean
    public Binding bookingEmailDLQBinding(){
        return BindingBuilder.bind(bookingEmailDLQ())
            .to(globalDeadLetterExchange())
            .with(BOOKING_EMAIL_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // Dùng converter nguyên bản của Spring AMQP, không cần import thêm gì cả!
      @Bean
    public MessageRecoverer messageRecoverer(RabbitTemplate rabbitTemplate) {
        return new RepublishMessageRecoverer(rabbitTemplate, GLOBAL_DEAD_LETTER_EXCHANGE, BOOKING_EMAIL_ROUTING_KEY) {
            @Override
            protected void doSend(String exchange, String routingKey, Message message) {
                String queue = message.getMessageProperties().getConsumerQueue();
                String targetRoutingKey = REFUND_EMAIL_QUEUE.equals(queue) 
                        ? REFUND_EMAIL_ROUTING_KEY 
                        : BOOKING_EMAIL_ROUTING_KEY;
                super.doSend(exchange, targetRoutingKey, message);
            }
        };
    }
}