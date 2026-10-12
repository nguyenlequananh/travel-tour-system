package com.travelhub.entity;

import com.travelhub.enums.CancellationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_cancellations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCancellation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // KHÓA NGOẠI 1-1: Mỗi đơn chỉ có 1 biên bản hủy
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(name = "cancellation_date")
    @Builder.Default
    private LocalDateTime cancellationDate = LocalDateTime.now();

    @Column(name = "cancellation_fee_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal cancellationFeePercentage; // Tỷ lệ phạt (%)

    @Column(name = "refund_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal refundAmount; // Số tiền hoàn trả

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CancellationStatus status = CancellationStatus.PENDING;
}