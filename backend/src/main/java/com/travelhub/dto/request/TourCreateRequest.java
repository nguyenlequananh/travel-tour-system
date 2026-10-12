package com.travelhub.dto.request;

import com.travelhub.enums.TourType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TourCreateRequest {

    @NotNull(message = "Danh mục tour không được để trống")
    private Integer categoryId; // Khóa ngoại gửi từ dropdown chọn danh mục

    @NotBlank(message = "Mã tour không được để trống")
    @Size(min = 3, max = 30, message = "Mã tour từ 3 đến 30 ký tự")
    private String tourCode; // vd: TO-DN-01

    @NotBlank(message = "Tên tour không được để trống")
    private String name;

    @NotNull(message = "Loại tour không được để trống")
    private TourType tourType; // DOMESTIC hoặc INTERNATIONAL

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
}