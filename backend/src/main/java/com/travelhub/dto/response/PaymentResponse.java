package com.travelhub.dto.response;

import com.travelhub.entity.Payment;
import com.travelhub.enums.PaymentMethod;
import com.travelhub.enums.PaymentType;
import com.travelhub.enums.TransactionStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private String bookingCode;
    private String transactionCode;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentType paymentType;
    private String gatewayResponseCode;
    private LocalDateTime paymentTime;
    private TransactionStatus status;

    public static PaymentResponse fromEntity(Payment p) {
        if (p == null) return null;
        return PaymentResponse.builder()
                .id(p.getId())
                .bookingId(p.getBooking() != null ? p.getBooking().getId() : null)
                .bookingCode(p.getBooking() != null ? p.getBooking().getBookingCode() : null)
                .transactionCode(p.getTransactionCode())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .paymentType(p.getPaymentType())
                .gatewayResponseCode(p.getGatewayResponseCode())
                .paymentTime(p.getPaymentTime())
                .status(p.getStatus())
                .build();
    }
}