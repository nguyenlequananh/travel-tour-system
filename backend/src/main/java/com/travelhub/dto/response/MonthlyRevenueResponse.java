package com.travelhub.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MonthlyRevenueResponse {
    private int month;              // Tháng 1 -> 12
    private BigDecimal revenue;     // Doanh thu của tháng đó
}