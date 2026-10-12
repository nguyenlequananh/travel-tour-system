package com.travelhub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE) // Đặt ưu tiên cao nhất, chạy trước mọi bộ lọc khác
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 1. Cho phép React ở cổng 5173 và 3000
        config.setAllowedOriginPatterns(List.of("http://localhost:5173", "http://localhost:3000", "*"));
        
        // 2. Cho phép gửi Token / Cookie
        config.setAllowCredentials(true);
        
        // 3. Cho phép TẤT CẢ các Header
        config.setAllowedHeaders(List.of("*"));
        
        // 4. Cho phép ĐẦY ĐỦ các phương thức (Đặc biệt là PATCH và OPTIONS)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}