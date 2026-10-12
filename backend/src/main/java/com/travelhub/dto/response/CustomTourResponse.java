package com.travelhub.dto.response;

import com.travelhub.entity.CustomTourRequest;
import com.travelhub.enums.CustomTourStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomTourResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String destination;
    private LocalDate departureDate;
    private Integer estimatedDurationDays;
    private Integer estimatedGuests;
    private BigDecimal budgetPerPerson;
    private String specialRequirements;
    private CustomTourStatus status;
    private LocalDateTime createdAt;

    public static CustomTourResponse fromEntity(CustomTourRequest entity) {
        if (entity == null) return null;
        return CustomTourResponse.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .email(entity.getEmail())
                .phoneNumber(entity.getPhoneNumber())
                .destination(entity.getDestination())
                .departureDate(entity.getDepartureDate())
                .estimatedDurationDays(entity.getEstimatedDurationDays())
                .estimatedGuests(entity.getEstimatedGuests())
                .budgetPerPerson(entity.getBudgetPerPerson())
                .specialRequirements(entity.getSpecialRequirements())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}