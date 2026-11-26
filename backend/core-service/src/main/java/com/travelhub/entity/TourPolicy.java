package com.travelhub.entity;

import com.travelhub.enums.PolicyType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tour_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // KHÓA NGOẠI: Nhiều chính sách thuộc về 1 Tour
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Enumerated(EnumType.STRING)
    @Column(name = "policy_type", nullable = false, length = 20)
    private PolicyType policyType; // INCLUDED, EXCLUDED, POLICY_NOTE

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content; // Nội dung chính sách
}