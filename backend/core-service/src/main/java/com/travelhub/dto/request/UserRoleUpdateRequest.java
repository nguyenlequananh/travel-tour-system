package com.travelhub.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UserRoleUpdateRequest {
    @NotEmpty(message = "Danh sách quyền không được để trống")
    private List<String> roleNames; // Chứa: ["ROLE_ADMIN", "ROLE_CUSTOMER", ...]
}