package com.travelhub.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TourGuideRequest {

    @NotNull(message = "ID đợt khởi hành không được để trống")
    private Long departureId;

    @NotNull(message = "ID hướng dẫn viên không được để trống")
    private Long userId;

    private Boolean isLeadGuide = true;
}