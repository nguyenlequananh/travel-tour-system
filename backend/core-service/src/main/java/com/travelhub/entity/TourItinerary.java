package com.travelhub.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tour_itineraries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourItinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // KHÓA NGOẠI: Nhiều ngày lịch trình thuộc về 1 Tour
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber; // Ngày 1, Ngày 2...

    @Column(nullable = false)
    private String title; // Tiêu đề ngày

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String details; // Chi tiết hoạt động sáng, trưa, tối

    @Column(length = 100)
    private String meals; // Bữa ăn kèm theo (vd: "Sáng, Trưa, Tối")

    @Column(length = 255)
    private String accommodation; // Nơi nghỉ đêm (Khách sạn/Resort)
}