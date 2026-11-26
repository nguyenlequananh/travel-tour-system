package com.travelhub.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;

@Component
public class AdminEmailLogAuthFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // 1. Chỉ áp dụng kiểm tra cho tuyến /api/v1/email-logs/**
        if (!path.startsWith("/api/v1/email-logs")) {
            return chain.filter(exchange);
        }

        // 2. Cho phép request CORS preflight (OPTIONS) đi qua để trình duyệt không bị lỗi CORS
        if (HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return chain.filter(exchange);
        }

        // 3. Kiểm tra Header "Authorization: Bearer <token>"
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return writeErrorResponse(exchange, HttpStatus.UNAUTHORIZED,
                    "Vui lòng đăng nhập bằng tài khoản ADMIN để xem nhật ký email!");
        }

        String token = authHeader.substring(7);
        try {
            // 4. Tính lại chữ ký & đối chiếu bằng đúng JWT_SECRET chung với core-service
            Key signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // 5. Đọc danh sách quyền từ payload đã xác thực
            List<?> roles = claims.get("roles", List.class);
            if (roles == null || !roles.contains("ROLE_ADMIN")) {
                return writeErrorResponse(exchange, HttpStatus.FORBIDDEN,
                        "Truy cập bị từ chối: Chỉ Quản trị viên (ROLE_ADMIN) mới có quyền xem!");
            }

            // 6. Hợp lệ -> cho request đi tiếp sang notification-service (Port 8082)
            return chain.filter(exchange);
        } catch (Exception e) {
            return writeErrorResponse(exchange, HttpStatus.UNAUTHORIZED,
                    "Token không hợp lệ hoặc đã hết hạn!");
        }
    }

    private Mono<Void> writeErrorResponse(ServerWebExchange exchange, HttpStatus status, String message) {
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String body = "{\"status\":" + status.value() + ",\"message\":\"" + message + "\"}";
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1; // Chạy sớm trước khi định tuyến sang notification-service
    }
}