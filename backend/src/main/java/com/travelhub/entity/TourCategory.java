package com.travelhub.entity;

import com.travelhub.enums.CategoryStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tour_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private CategoryStatus status = CategoryStatus.ACTIVE;
}