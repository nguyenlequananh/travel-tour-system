package com.travelhub.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewRequest {

    @NotNull(message = "ID của Tour không được để trống")
    private Long tourId;

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Đánh giá tối thiểu là 1 sao")
    @Max(value = 5, message = "Đánh giá tối đa là 5 sao")
    private Integer rating;

    @NotBlank(message = "Nội dung nhận xét không được để trống")
    @Size(max = 1000, message = "Nhận xét không được quá 1000 ký tự")
    private String comment;
}