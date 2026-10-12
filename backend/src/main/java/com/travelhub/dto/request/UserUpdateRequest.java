package com.travelhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    private String phoneNumber;
    private String address;
}