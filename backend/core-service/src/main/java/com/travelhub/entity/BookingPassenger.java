package com.travelhub.entity;

import com.travelhub.enums.Gender;
import com.travelhub.enums.PassengerType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "booking_passengers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingPassenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // KHÓA NGOẠI: Thuộc về đơn đặt tour nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "passenger_type", nullable = false)
    private PassengerType passengerType; // ADULT hoặc CHILD

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "id_card_or_passport", length = 50)
    private String idCardOrPassport;

    @Column(name = "requires_single_room")
    @Builder.Default
    private Boolean requiresSingleRoom = false;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price; // Giá vé chốt tại thời điểm mua
}