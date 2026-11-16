package com.travelhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TourImageRequest {

    @NotNull(message = "ID Tour không được để trống")
    private Long tourId;

    @NotBlank(message = "Đường dẫn ảnh không được để trống")
    private String imageUrl;
}