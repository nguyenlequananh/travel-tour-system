package com.travelhub.entity;

import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tours")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // KHÓA NGOẠI: Nhiều Tour thuộc về 1 Danh mục cha
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private TourCategory category;

    @Column(name = "tour_code", nullable = false, unique = true, length = 30)
    private String tourCode; // vd: TO-PHUQUOC-01

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "tour_type", nullable = false)
    private TourType tourType; // DOMESTIC (Nội địa) / INTERNATIONAL (Quốc tế)

    @Column(name = "departure_city", nullable = false, length = 100)
    private String departureCity; // Thành phố xuất phát (TP.HCM, Hà Nội...)

    @Column(name = "destination_city", nullable = false, length = 100)
    private String destinationCity; // Điểm đến (Phú Quốc, Đà Nẵng...)

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays; // Số ngày (VD: 3)

    @Column(name = "duration_nights", nullable = false)
    private Integer durationNights; // Số đêm (VD: 2)

    @Column(name = "featured_image")
    private String featuredImage; // Link ảnh đại diện (Thumbnail)

    @Column(columnDefinition = "TEXT")
    private String summary; // Tóm tắt ngắn

    @Column(columnDefinition = "LONGTEXT")
    private String description; // Bài viết chi tiết

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TourStatus status = TourStatus.ACTIVE; // Mặc định tạo mới là ACTIVE

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}