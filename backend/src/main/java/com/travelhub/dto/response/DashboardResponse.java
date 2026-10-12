package com.travelhub.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardResponse {
    // 4 KPI Cards
    private BigDecimal totalRevenue;
    private Long totalBookings;
    private Long totalPassengers;
    private Long activeTours;

    // Doanh thu 12 tháng
    private List<MonthlyRevenueResponse> monthlyRevenues;

    // Top tour bán chạy
    private List<TopTourResponse> topSellingTours;

    // Tỷ lệ trạng thái đơn (PENDING, CONFIRMED, COMPLETED, CANCELLED)
    private Map<String, Long> bookingStatusCounts;
}