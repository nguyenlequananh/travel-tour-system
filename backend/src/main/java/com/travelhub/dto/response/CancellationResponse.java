package com.travelhub.dto.response;

import com.travelhub.entity.BookingCancellation;
import com.travelhub.enums.CancellationStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CancellationResponse {
    private Long id;
    private Long bookingId;
    private String bookingCode;
    private String customerName;
    private String reason;
    private LocalDateTime cancellationDate;
    private BigDecimal cancellationFeePercentage;
    private BigDecimal refundAmount;
    private CancellationStatus status;

    public static CancellationResponse fromEntity(BookingCancellation c) {
        if (c == null) return null;
        return CancellationResponse.builder()
                .id(c.getId())
                .bookingId(c.getBooking() != null ? c.getBooking().getId() : null)
                .bookingCode(c.getBooking() != null ? c.getBooking().getBookingCode() : null)
                .customerName(c.getBooking() != null ? c.getBooking().getContactName() : null)
                .reason(c.getReason())
                .cancellationDate(c.getCancellationDate())
                .cancellationFeePercentage(c.getCancellationFeePercentage())
                .refundAmount(c.getRefundAmount())
                .status(c.getStatus())
                .build();
    }
}