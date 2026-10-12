package com.travelhub.config;

import com.travelhub.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Cho phép dùng @PreAuthorize kiểm tra quyền ở từng hàm nếu muốn
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // 1. BEAN BĂM MẬT KHẨU TOÀN HỆ THỐNG
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2. BEAN QUẢN LÝ XÁC THỰC
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    // 3. CHUỖI BỘ LỌC AN NINH (TRÁI TIM CỦA SPRING SECURITY)
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Tắt CSRF (vì dùng Token JWT, không dùng Cookie)
            .csrf(AbstractHttpConfigurer::disable)

            // Cho phép CORS hoạt động (liên kết với CorsConfig đã viết)
            .cors(Customizer.withDefaults())

            // Cấu hình STATELESS: Không lưu Session trong RAM của Server
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ==================== PHÂN QUYỀN ĐƯỜNG DẪN (AUTHORIZATION RULES) ====================
            .authorizeHttpRequests(auth -> auth
                // 1. CÁC ĐƯỜNG DẪN MỞ TOÀNG (Ai cũng vào được, không cần đăng nhập)
                .requestMatchers("/api/v1/auth/**").permitAll()           // Đăng nhập, Đăng ký
                .requestMatchers(HttpMethod.GET, "/api/v1/tours/**").permitAll()     // Xem danh sách và chi tiết tour
                .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()// Xem danh mục tour
                .requestMatchers(HttpMethod.GET, "/api/v1/promotions/check").permitAll() // Kiểm tra voucher
                .requestMatchers("/error").permitAll()                     // Trang báo lỗi mặc định

                // 2. CÁC ĐƯỜNG DẪN BẮT BUỘC PHẢI CÓ QUYỀN ADMIN (ROLE_ADMIN)
                // Lưu ý: hasRole("ADMIN") tự động hiểu là kiểm tra quyền "ROLE_ADMIN" trong DB
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                // 3. CÁC ĐƯỜNG DẪN CÒN LẠI (Đặt tour, Xem vé của tôi, Hủy vé...)
                // Bắt buộc phải ĐÃ ĐĂNG NHẬP (Authenticated) mới được gọi!
                .anyRequest().authenticated()
            );

        // ==================== ĐẶT BỘ LỌC JWT VÀO VỊ TRÍ GÁC CỔNG ====================
        // Đặt JwtAuthenticationFilter đứng TRƯỚC UsernamePasswordAuthenticationFilter mặc định
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}