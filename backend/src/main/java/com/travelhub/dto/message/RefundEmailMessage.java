package com.travelhub.dto.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundEmailMessage implements Serializable {
    private String contactEmail;
    private String contactName;
    private String bookingCode;
    private String tourName;
    private BigDecimal refundAmount;
    private String reason;
}