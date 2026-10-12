package com.travelhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancellationRequest {
    @NotNull(message = "ID đơn hàng không được để trống")
    private Long bookingId;

    @NotBlank(message = "Lý do hủy tour không được để trống")
    private String reason;
}