package com.travelhub.service;
import com.travelhub.dto.request.UserCreateRequest;
import com.travelhub.dto.request.UserUpdateRequest;
import com.travelhub.dto.response.UserResponse;
import java.util.List;
public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);
}
