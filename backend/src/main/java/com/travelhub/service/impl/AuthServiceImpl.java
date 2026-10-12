package com.travelhub.service.impl;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.travelhub.dto.request.LoginRequest;
import com.travelhub.dto.request.UserCreateRequest;
import com.travelhub.dto.response.AuthResponse;
import com.travelhub.entity.User;
import com.travelhub.repository.RoleRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.security.JwtUtils;
import com.travelhub.service.AuthService;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;
import com.travelhub.entity.Role;
import java.util.UUID;

@RequiredArgsConstructor 
@Service 
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(); 
    private final JwtUtils jwtUtils; // Tiêm JwtUtils
    
    @Override
    @Transactional (readOnly = true)
    public AuthResponse login(LoginRequest request) {
        if(!userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email chưa được đăng ký!");
        }
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu không đúng!");
        }
        if(user.getIsActive() == false) {
            throw new RuntimeException("Tài khoản của bạn đã bị vô hiệu hóa!");
        }
        
        List<String> roles = user.getRoles().stream().map(role -> role.getName()).toList();

        if(user.getRoles().isEmpty()){
            roles = List.of("ROLE_CUSTOMER");

        }
        String token = jwtUtils.generateToken(user);
        return AuthResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phoneNumber(user.getPhoneNumber())
            .roles(roles)
            .token(token)
            .build();
    }
    @Override
    @Transactional (rollbackFor = Exception.class)
    public AuthResponse register(UserCreateRequest request) {
        if(userRepository.existsByEmail(request.getEmail().trim().toLowerCase())){
            throw new RuntimeException("Email đã tồn tại!");
        }
        String encodedPassword = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(request.getPassword());
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER").orElseThrow(() -> new RuntimeException("Không tìm thấy quyền ROLE_CUSTOMER!"));

        User newUser = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(encodedPassword) // Mật khẩu đã được băm an toàn
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .isActive(true) // Tài khoản mới tạo mặc định mở hoạt động
                .createdAt(java.time.LocalDateTime.now())
                .build();
        newUser.getRoles().add(customerRole); // Gán quyền ROLE_CUSTOMER cho người dùng mới
        User savedUser = userRepository.save(newUser);
        String token = UUID.randomUUID().toString(); // Giả sử bạn đã có token từ quá trình đăng nhập trước đó
        return AuthResponse.builder()
                .id(savedUser.getId())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .phoneNumber(savedUser.getPhoneNumber())
                .roles(List.of("ROLE_CUSTOMER"))
                .token(token)
                .build();
    }
}
