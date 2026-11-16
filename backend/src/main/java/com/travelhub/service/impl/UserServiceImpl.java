package com.travelhub.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.travelhub.dto.request.ChangePasswordRequest;
import com.travelhub.dto.request.ProfileUpdateRequest;
import com.travelhub.dto.request.UserCreateRequest;
import com.travelhub.dto.request.UserFilterRequest;
import com.travelhub.dto.request.UserRoleUpdateRequest;
import com.travelhub.dto.request.UserUpdateRequest;
import com.travelhub.dto.response.PageResponse;
import com.travelhub.dto.response.UserResponse;
import com.travelhub.service.UserService;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.travelhub.repository.RoleRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.entity.Role;
import com.travelhub.entity.User;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        // TODO Auto-generated method stub
        return UserResponse.fromEntity(findUserEntityById(id));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quyền ROLE_CUSTOMER!"));

        User newUser = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(encodedPassword) // Mật khẩu đã được băm an toàn
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .isActive(true) // Tài khoản mới tạo mặc định mở hoạt động
                .roles(Set.of(customerRole))
                .build();
        return UserResponse.fromEntity(userRepository.save(newUser));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse updateUser(Long id, UserUpdateRequest request) {

        User user = findUserEntityById(id);
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long id) {
        User user = findUserEntityById(id);
        user.setIsActive(false);
        userRepository.save(user);

    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Không tìm thấy người dùng!"));
        return UserResponse.fromEntity(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Không tìm thấy người dùng!"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng!");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại đã được sử dụng!");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu mới không trùng nhau!");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Không tìm thấy người dùng!"));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserResponse updateUserRoles(Long userId, UserRoleUpdateRequest request) {
        User user = findUserEntityById(userId);
        Set<Role> roleNew = new HashSet<>();
        for (String roleName : request.getRoleNames()) {
            Role role = roleRepository.findByName(roleName).orElseThrow(
                    () -> new RuntimeException("Không tìm thấy quyền: " + roleName));
            roleNew.add(role);
        }
        user.setRoles(roleNew);
        return UserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    private User findUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsersWithFilter(UserFilterRequest request) {
        Pageable pageable = request.toPageable();

        String keyword = (request.getKeyword() != null && !request.getKeyword().trim().isEmpty())
                ? request.getKeyword().trim()
                : null;

        Page<User> userPage = userRepository.filterUsers(keyword, request.getIsActive(), pageable);

        return PageResponse.fromPage(userPage, UserResponse::fromEntity);
    }
}
