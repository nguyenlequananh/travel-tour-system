package com.travelhub.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BookingCreateRequest {

    @NotNull(message = "ID người dùng không được để trống")
    private Long userId; // Người bấm đặt

    @NotNull(message = "ID đợt khởi hành không được để trống")
    private Long departureId; // Chọn đi chuyến nào

    private String promotionCode; // Mã voucher (nếu có, vd: "HE2024")

    @NotBlank(message = "Tên người liên hệ không được để trống")
    private String contactName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String contactPhone;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String contactEmail;

    private String contactAddress;
    private String specialRequests;

    @NotEmpty(message = "Danh sách hành khách không được để trống")
    @Valid
    private List<PassengerRequest> passengers; // Danh sách người đi cùng
}