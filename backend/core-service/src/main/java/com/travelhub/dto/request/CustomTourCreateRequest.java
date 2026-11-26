package com.travelhub.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomTourCreateRequest {

    @NotBlank(message = "Họ tên người liên hệ không được để trống")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @NotBlank(message = "Điểm đến mong muốn không được để trống")
    private String destination;

    @NotNull(message = "Ngày khởi hành dự kiến không được để trống")
    @FutureOrPresent(message = "Ngày khởi hành phải ở hiện tại hoặc tương lai")
    private LocalDate departureDate;

    @NotNull(message = "Số ngày đi dự kiến không được để trống")
    @Min(value = 1, message = "Số ngày đi tối thiểu là 1")
    private Integer estimatedDurationDays;

    @NotNull(message = "Số lượng khách dự kiến không được để trống")
    @Min(value = 5, message = "Tour đoàn tối thiểu từ 5 khách trở lên")
    private Integer estimatedGuests;

    private BigDecimal budgetPerPerson; // Ngân sách dự kiến/người

    private String specialRequirements; // Yêu cầu đặc biệt
}