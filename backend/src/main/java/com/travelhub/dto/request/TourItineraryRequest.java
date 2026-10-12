package com.travelhub.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TourItineraryRequest {

    @NotNull(message = "ID của Tour không được để trống")
    private Long tourId; // Khóa ngoại trỏ đến Tour

    @NotNull(message = "Ngày thứ mấy không được để trống")
    @Min(value = 1, message = "Số thứ tự ngày phải từ 1 trở lên")
    private Integer dayNumber;

    @NotBlank(message = "Tiêu đề ngày không được để trống")
    @Size(max = 255, message = "Tiêu đề không quá 255 ký tự")
    private String title;

    @NotBlank(message = "Chi tiết hoạt động không được để trống")
    private String details;

    private String meals;
    private String accommodation;
}