package com.travelhub.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tour_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // KHÓA NGOẠI: Nhiều hình ảnh thuộc về 1 Tour
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl; // Link hoặc đường dẫn lưu trữ ảnh
}