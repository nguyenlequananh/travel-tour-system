package com.travelhub.entity;

import com.travelhub.enums.DepartureStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tour_departures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourDeparture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // KHÓA NGOẠI: Nhiều đợt khởi hành thuộc về 1 Tour
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate; // Ngày đi

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate; // Ngày về

    @Column(name = "adult_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal adultPrice; // Giá vé người lớn

    @Column(name = "child_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal childPrice; // Giá vé trẻ em

    @Column(name = "single_room_supplement", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal singleRoomSupplement = BigDecimal.ZERO; // Phụ thu phòng đơn

    @Column(name = "max_seats", nullable = false)
    private Integer maxSeats; // Tổng số chỗ mở bán (vd: 30)

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats; // Số chỗ còn lại

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DepartureStatus status = DepartureStatus.OPEN;
}