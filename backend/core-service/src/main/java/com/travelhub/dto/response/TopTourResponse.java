package com.travelhub.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TopTourResponse {
    private Long tourId;
    private String tourCode;
    private String tourName;
    private Long totalBookings;
    private BigDecimal totalRevenue;
}