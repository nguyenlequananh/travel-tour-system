package com.travelhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class TourPickupPointRequest {

    @NotNull(message = "ID đợt khởi hành không được để trống")
    private Long departureId;

    @NotBlank(message = "Tên địa điểm đón không được để trống")
    private String locationName;

    @NotNull(message = "Giờ đón khách không được để trống")
    private LocalTime pickupTime;
}