package com.travelhub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // 1. Kích hoạt tính năng Message Broker của WebSocket
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 2. Đây là cổng bắt tay kết nối (Handshake Endpoint) giữa React và Spring Boot
        // URL kết nối từ React sẽ là: http://localhost:8081/ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Cho phép React (localhost:5173, localhost:3000) kết nối mà không bị lỗi CORS
                .withSockJS();                 // Kích hoạt SockJS để dự phòng nếu trình duyệt không hỗ trợ WebSocket thuần
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 3. Định nghĩa các "Kênh phát thanh" (Broker) trong bộ nhớ:
        // - /topic: Kênh chung cho nhiều người cùng nghe (Broadcast, ví dụ: /topic/admin/notifications)
        // - /queue: Kênh gửi riêng cho đúng 1 người cụ thể (Private, ví dụ: gửi riêng cho HDV hoặc Khách)
        registry.enableSimpleBroker("/topic", "/queue");

        // 4. Tiền tố khi Client (React) muốn chủ động gửi tin nhắn ngược lại cho Server
        registry.setApplicationDestinationPrefixes("/app");

        // 5. Tiền tố phục vụ cho việc gửi tin nhắn riêng cho từng User
        registry.setUserDestinationPrefix("/user");
    }
}   