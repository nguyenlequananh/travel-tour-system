package com.travelhub.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // 1. Trích xuất chuỗi JWT Token từ Header của Request
            String jwt = parseJwt(request);

            // 2. Nếu có token và token hợp lệ
            if (jwt != null && jwtUtils.validateToken(jwt)) {
                // Lấy email từ token
                String email = jwtUtils.getEmailFromToken(jwt);

                // Tải thông tin và quyền hạn của user từ Database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // Tạo đối tượng xác thực chính thức của Spring Security
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null, // Không cần password ở bước này
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 3. QUAN TRỌNG NHẤT: Lưu quyền vào SecurityContextHolder
                // Kể từ dòng này, toàn bộ hệ thống đã nhận diện được người đang gửi request là ai!
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            System.err.println("Không thể xác thực người dùng từ JWT: " + e.getMessage());
        }

        // 4. Cho phép request đi tiếp đến Filter tiếp theo hoặc vào Controller
        filterChain.doFilter(request, response);
    }

    // Hàm phụ trợ: Bóc tách token từ Header "Authorization: Bearer <token>"
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        // Chuẩn quốc tế quy định token phải bắt đầu bằng chữ "Bearer "
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // Cắt bỏ 7 ký tự "Bearer " để lấy đúng chuỗi token
        }

        return null;
    }
}