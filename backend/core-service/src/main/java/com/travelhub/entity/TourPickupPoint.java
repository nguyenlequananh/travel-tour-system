package com.travelhub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "tour_pickup_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourPickupPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // KHÓA NGOẠI: Nhiều điểm đón thuộc về 1 đợt khởi hành
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departure_id", nullable = false)
    private TourDeparture departure;

    @Column(name = "location_name", nullable = false, length = 255)
    private String locationName; // Tên/địa chỉ điểm đón (vd: Cây xăng Hàng Xanh)

    @Column(name = "pickup_time", nullable = false)
    private LocalTime pickupTime; // Giờ đón (vd: 05:00:00)
}