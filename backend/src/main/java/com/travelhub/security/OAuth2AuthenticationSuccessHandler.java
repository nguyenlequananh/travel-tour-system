package com.travelhub.security;

import com.travelhub.entity.Role;
import com.travelhub.entity.User;
import com.travelhub.repository.RoleRepository;
import com.travelhub.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String oauth2RedirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // 1. Lấy thông tin từ Google
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // 2. Tìm kiếm trong Database, nếu chưa có thì tạo tài khoản mới tự động
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền ROLE_CUSTOMER"));

            User newUser = User.builder()
                    .email(email)
                    .fullName(name != null ? name : "Google User")
                    .password(UUID.randomUUID().toString()) // Mật khẩu ngẫu nhiên vì đăng nhập qua Google
                    .isActive(true)
                    .roles(new HashSet<>(Set.of(customerRole)))
                    .build();
            return userRepository.save(newUser);
        });

        // 3. Sinh Token JWT quen thuộc của hệ thống TravelHub
        String token = jwtUtils.generateToken(user);

        // 4. Chuyển hướng về lại giao diện React kèm Token trên đường link
        String redirectUrl = oauth2RedirectUri + "?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}