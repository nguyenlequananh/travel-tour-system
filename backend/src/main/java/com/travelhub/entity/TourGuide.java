package com.travelhub.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tour_guides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourGuide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // KHÓA NGOẠI: Phân công cho Đợt khởi hành nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departure_id", nullable = false)
    private TourDeparture departure;

    // KHÓA NGOẠI: Hướng dẫn viên nào (User có role GUIDE)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User guide;

    @Column(name = "is_lead_guide")
    @Builder.Default
    private Boolean isLeadGuide = true; // Có phải trưởng đoàn không?
}