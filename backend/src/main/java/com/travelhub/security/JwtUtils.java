package com.travelhub.security;

import com.travelhub.entity.Role;
import com.travelhub.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtils {

    // 1. Đọc 2 biến cấu hình từ application.properties vào
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    // Lấy chìa khóa bí mật an toàn
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // 2. HÀM SINH TOKEN (GỌI KHI ĐĂNG NHẬP THÀNH CÔNG)
    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        // Lấy danh sách tên quyền của user (ví dụ: ["ROLE_ADMIN", "ROLE_CUSTOMER"])
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .toList();

        return Jwts.builder()
                .setSubject(user.getEmail())                      // Lưu Email vào Subject
                .claim("userId", user.getId())                    // Nhét thêm ID người dùng
                .claim("fullName", user.getFullName())            // Nhét thêm Họ tên
                .claim("roles", roles)                            // Nhét thêm Danh sách quyền
                .setIssuedAt(now)                                 // Ngày giờ phát hành
                .setExpiration(expiryDate)                        // Ngày giờ hết hạn (24h sau)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Đóng dấu bằng khóa bí mật
                .compact();
    }

    // 3. HÀM BÓC TÁCH EMAIL TỪ TOKEN
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    // 4. HÀM KIỂM TRA TOKEN CÓ HỢP LỆ KHÔNG
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true; // Token chuẩn xác 100%!
        } catch (MalformedJwtException e) {
            System.err.println("Token không đúng định dạng!");
        } catch (ExpiredJwtException e) {
            System.err.println("Token đã hết hạn sử dụng!");
        } catch (UnsupportedJwtException e) {
            System.err.println("Token không được hỗ trợ!");
        } catch (IllegalArgumentException e) {
            System.err.println("Chuỗi token bị rỗng!");
        } catch (SecurityException e) {
            System.err.println("Chữ ký token không hợp lệ (nghi vấn bị làm giả)!");
        }
        return false;
    }
}