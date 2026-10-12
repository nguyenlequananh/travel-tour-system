package com.travelhub.service.impl;
import java.util.List;

import com.travelhub.dto.request.UserCreateRequest;
import com.travelhub.dto.request.UserUpdateRequest;
import com.travelhub.dto.response.UserResponse;
import com.travelhub.service.UserService;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import com.travelhub.repository.UserRepository;
import com.travelhub.entity.User;
import lombok.RequiredArgsConstructor;
@RequiredArgsConstructor 
@Service
public class UserServiceImpl implements  UserService {
    private final UserRepository userRepository;
    @Override
    @Transactional (readOnly = true)
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
        .stream()
        .map(UserResponse::fromEntity)
        .toList();
    }
    @Override
    @Transactional (readOnly = true)
    public UserResponse getUserById(Long id) {
        // TODO Auto-generated method stub
        return UserResponse.fromEntity(findUserEntityById(id));
    }
    @Override
    @Transactional (rollbackFor = Exception.class)  
    public UserResponse createUser(UserCreateRequest request) {
         if(userRepository.existsByEmail(request.getEmail().trim().toLowerCase())){
            throw new RuntimeException("Email đã tồn tại!");
         }
         String encodedPassword = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder()
                .encode(request.getPassword());
        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(encodedPassword) // Mật khẩu đã được băm an toàn
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .isActive(true) // Tài khoản mới tạo mặc định mở hoạt động
                .createdAt(java.time.LocalDateTime.now())
                .build();
        return UserResponse.fromEntity(userRepository.save(user));
    }
    @Override
    @Transactional (rollbackFor = Exception.class)
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
      
        User user = findUserEntityById(id);
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        return UserResponse.fromEntity(userRepository.save(user));
    }
    @Override
    @Transactional (rollbackFor = Exception.class)
    public void deleteUser(Long id) {
        User user = findUserEntityById(id);
        user.setIsActive(false);
        userRepository.save(user);
        
    }

    @Transactional (readOnly = true)
    private User findUserEntityById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));    
    }
}
