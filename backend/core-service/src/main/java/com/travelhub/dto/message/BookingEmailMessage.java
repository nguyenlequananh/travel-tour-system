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
public class BookingEmailMessage implements Serializable {
    private String contactEmail;
    private String contactName;
    private String bookingCode;
    private String tourName;
    private String departureDate; // Dùng String: Không bao giờ lỗi convert!
    private String returnDate;    // Dùng String
    private Integer totalPassengers;
    private BigDecimal totalAmount;
}