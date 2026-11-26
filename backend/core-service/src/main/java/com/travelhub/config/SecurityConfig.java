package com.travelhub.config;

import com.travelhub.security.JwtAuthenticationFilter;
import com.travelhub.security.OAuth2AuthenticationSuccessHandler;
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
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

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

    // 3. CHUỖI BỘ LỌC BẢO MẬT TRUNG TÂM
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                // =========================================================================
                // NHÓM 1: CÔNG KHAI (PUBLIC - AI CŨNG VÀO ĐƯỢC, KHÔNG CẦN TOKEN)
                // =========================================================================
                .requestMatchers("/api/v1/auth/**").permitAll()                           // Đăng nhập, đăng ký
                .requestMatchers("/ws/**").permitAll()                                    // Kết nối WebSocket Real-time
                .requestMatchers("/api/v1/payments/vnpay-callback").permitAll()          // Cổng VNPay trả kết quả thanh toán
                .requestMatchers(HttpMethod.GET, "/api/v1/tours/**").permitAll()          // Xem danh sách và chi tiết tour
                .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()     // Xem danh mục tour
                .requestMatchers(HttpMethod.GET, "/api/v1/pickup-points/**").permitAll()  // Xem danh sách điểm đón khách
                .requestMatchers(HttpMethod.GET, "/api/v1/reviews/**").permitAll()        // Xem đánh giá, số sao của tour
                .requestMatchers(HttpMethod.GET, "/api/v1/promotions/check").permitAll()  // Kiểm tra mã voucher giảm giá
                .requestMatchers(HttpMethod.POST, "/api/v1/custom-tours").permitAll()     // Khách gửi form đặt tour đoàn riêng
                .requestMatchers("/api/v1/ai/**").permitAll()                             // Trợ lý ảo AI tư vấn tour
                .requestMatchers("/api/demo-rabbit/**").permitAll()                       // Test RabbitMQ
                .requestMatchers("/error").permitAll()                                    // Trang báo lỗi mặc định

                // =========================================================================
                // NHÓM 2: DÀNH RIÊNG CHO HƯỚNG DẪN VIÊN & QUẢN TRỊ VIÊN
                // =========================================================================
                .requestMatchers("/api/v1/guide/**").hasAnyRole("GUIDE", "ADMIN")

                // =========================================================================
                // NHÓM 3: DÀNH RIÊNG CHO QUẢN TRỊ VIÊN TỐI CAO (ROLE_ADMIN)
                // =========================================================================
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                // =========================================================================
                // NHÓM 4: CÁC NGHIỆP VỤ BẮT BUỘC ĐĂNG NHẬP (Authenticated)
                // (Bao gồm: Đặt tour, Thanh toán, Hủy vé, Xem thông báo cá nhân...)
                // =========================================================================
                .anyRequest().authenticated()
            )

            // KÍCH HOẠT ĐĂNG NHẬP GOOGLE OAUTH2
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2AuthenticationSuccessHandler)
            )

            // ĐẶT BỘ LỌC JWT TRƯỚC BỘ LỌC MẶC ĐỊNH
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}