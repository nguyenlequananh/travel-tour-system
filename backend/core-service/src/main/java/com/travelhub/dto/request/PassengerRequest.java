package com.travelhub.dto.request;

import com.travelhub.enums.Gender;
import com.travelhub.enums.PassengerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PassengerRequest {
    @NotBlank(message = "Họ tên hành khách không được để trống")
    private String fullName;

    @NotNull(message = "Loại hành khách không được để trống")
    private PassengerType passengerType; // ADULT hoặc CHILD

    private Gender gender;
    private LocalDate birthDate;
    private String idCardOrPassport;
    private boolean requiresSingleRoom = false;
}