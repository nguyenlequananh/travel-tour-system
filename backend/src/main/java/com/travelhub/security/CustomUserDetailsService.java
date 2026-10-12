package com.travelhub.security;

import com.travelhub.entity.User;
import com.travelhub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Tìm user từ Database bằng Email (Trong hệ thống này ta dùng Email làm định danh)
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));

        // 2. Chuyển đổi Set<Role> trong Entity thành List<GrantedAuthority> của Spring Security
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName())) // ví dụ: "ROLE_ADMIN"
                .map(auth -> (GrantedAuthority) auth)
                .toList();

        // 3. Đóng gói thành đối tượng UserDetails đạt chuẩn của Spring Security
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())         // Định danh (Email)
                .password(user.getPassword())      // Mật khẩu đã băm
                .authorities(authorities)          // Danh sách quyền hạn
                .disabled(!user.getIsActive())     // Nếu isActive = false thì khóa tài khoản
                .build();
    }
}