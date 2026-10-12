package com.travelhub.dto.request;

import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TourUpdateRequest {

    @NotNull(message = "Danh mục tour không được để trống")
    private Integer categoryId;

    @NotBlank(message = "Mã tour không được để trống")
    private String tourCode;

    @NotBlank(message = "Tên tour không được để trống")
    private String name;

    @NotNull(message = "Loại tour không được để trống")
    private TourType tourType;

    @NotBlank(message = "Thành phố khởi hành không được để trống")
    private String departureCity;

    @NotBlank(message = "Thành phố điểm đến không được để trống")
    private String destinationCity;

    @NotNull(message = "Số ngày đi không được để trống")
    @Min(value = 1, message = "Số ngày đi tối thiểu là 1")
    private Integer durationDays;

    @NotNull(message = "Số đêm nghỉ không được để trống")
    @Min(value = 0, message = "Số đêm nghỉ tối thiểu là 0")
    private Integer durationNights;

    private String featuredImage;
    private String summary;
    private String description;

    @NotNull(message = "Trạng thái tour không được để trống")
    private TourStatus status; // ACTIVE hoặc INACTIVE
}