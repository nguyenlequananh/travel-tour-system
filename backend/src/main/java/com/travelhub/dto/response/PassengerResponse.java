package com.travelhub.dto.response;

import com.travelhub.entity.BookingPassenger;
import com.travelhub.enums.Gender;
import com.travelhub.enums.PassengerType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PassengerResponse {
    private Long id;
    private String fullName;
    private PassengerType passengerType;
    private Gender gender;
    private LocalDate birthDate;
    private String idCardOrPassport;
    private Boolean requiresSingleRoom;
    private BigDecimal price;

    public static PassengerResponse fromEntity(BookingPassenger p) {
        if (p == null) return null;
        return PassengerResponse.builder()
                .id(p.getId())
                .fullName(p.getFullName())
                .passengerType(p.getPassengerType())
                .gender(p.getGender())
                .birthDate(p.getBirthDate())
                .idCardOrPassport(p.getIdCardOrPassport())
                .requiresSingleRoom(p.getRequiresSingleRoom())
                .price(p.getPrice())
                .build();
    }
}