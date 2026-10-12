package com.travelhub.entity;

import com.travelhub.enums.CustomTourStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_tour_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomTourRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;

    @Column(nullable = false)
    private String destination;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Column(name = "estimated_duration_days", nullable = false)
    private Integer estimatedDurationDays;

    @Column(name = "estimated_guests", nullable = false)
    private Integer estimatedGuests;

    @Column(name = "budget_per_person", precision = 15, scale = 2)
    private BigDecimal budgetPerPerson;

    @Column(name = "special_requirements", columnDefinition = "TEXT")
    private String specialRequirements;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CustomTourStatus status = CustomTourStatus.NEW;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}   