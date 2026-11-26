package com.travelhub.dto.request;

import com.travelhub.enums.PolicyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TourPolicyRequest {

    @NotNull(message = "ID Tour không được để trống")
    private Long tourId;

    @NotNull(message = "Loại chính sách không được để trống")
    private PolicyType policyType;

    @NotBlank(message = "Nội dung chính sách không được để trống")
    private String content;
}