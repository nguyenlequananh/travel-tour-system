package com.travelhub.service;
import com.travelhub.dto.request.ChangePasswordRequest;
import com.travelhub.dto.request.ProfileUpdateRequest;
import com.travelhub.dto.request.UserCreateRequest;
import com.travelhub.dto.filter.UserFilterRequest;
import com.travelhub.dto.request.UserRoleUpdateRequest;
import com.travelhub.dto.request.UserUpdateRequest;
import com.travelhub.dto.common.PageResponse;
import com.travelhub.dto.response.UserResponse;
import java.util.List;
public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);
    UserResponse getProfile(String email);
    UserResponse updateProfile(String email, ProfileUpdateRequest request);
    void changePassword(String email, ChangePasswordRequest request);
    UserResponse updateUserRoles(Long userId, UserRoleUpdateRequest request);
    PageResponse<UserResponse> getUsersWithFilter(UserFilterRequest request);
}
