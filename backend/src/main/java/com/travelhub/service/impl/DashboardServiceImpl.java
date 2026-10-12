package com.travelhub.service.impl;

import com.travelhub.dto.response.DashboardResponse;
import com.travelhub.dto.response.MonthlyRevenueResponse;
import com.travelhub.dto.response.TopTourResponse;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.TourStatus;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable; // <-- DÙNG DÒNG NÀY

import java.math.BigDecimal;
import java.time.Year;
import java.util.*;

@RequiredArgsConstructor
@Service
public class DashboardServiceImpl implements DashboardService {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardStats(Integer year) {
        // 1. Nếu không truyền năm thì lấy năm hiện tại
        if (year == null) {
            year = Year.now().getValue();
        }

        // 2. Lấy 4 thẻ KPI tổng quan (Bạn đã làm rất chuẩn chỗ này)
        BigDecimal totalRevenue = bookingRepository.calculateTotalRevenue();
        Long totalBookings = bookingRepository.count();
        Long totalPassengers = bookingRepository.calculateTotalPassengers();
        Long activeTours = tourRepository.countByStatus(TourStatus.ACTIVE);
        // 3. XỬ LÝ BIỂU ĐỒ 12 THÁNG (Bù số 0 cho các tháng không có doanh thu)
        List<Object[]> rawMonthly = bookingRepository.getMonthlyRevenueByYear(year);
        
        // Đưa dữ liệu từ DB vào Map tạm để dễ tra cứu: <Tháng, DoanhThu>
        Map<Integer, BigDecimal> revenueMap = new HashMap<>();
        for (Object[] row : rawMonthly) {
            Integer month = ((Number) row[0]).intValue();
            BigDecimal revenue = (BigDecimal) row[1];
            revenueMap.put(month, revenue);
        }

        // Chạy vòng lặp từ Tháng 1 đến Tháng 12 để đảm bảo đủ 12 cột cho biểu đồ
        List<MonthlyRevenueResponse> monthlyRevenues = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            BigDecimal rev = revenueMap.getOrDefault(m, BigDecimal.ZERO);
            monthlyRevenues.add(new MonthlyRevenueResponse(m, rev));
        }

        // 4. LẤY TOP 5 TOUR BÁN CHẠY NHẤT
        List<Object[]> rawTopTours = bookingRepository.findTopSellingTours(PageRequest.of(0, 5));
        List<TopTourResponse> topSellingTours = rawTopTours.stream()
                .map(row -> TopTourResponse.builder()
                        .tourId(((Number) row[0]).longValue())
                        .tourCode((String) row[1])
                        .tourName((String) row[2])
                        .totalBookings(((Number) row[3]).longValue())
                        .totalRevenue((BigDecimal) row[4])
                        .build())
                .toList();

        // 5. ĐẾM SỐ LƯỢNG ĐƠN HÀNG THEO TỪNG TRẠNG THÁI
        Map<String, Long> bookingStatusCounts = new HashMap<>();
        for (BookingStatus status : BookingStatus.values()) {
            bookingStatusCounts.put(status.name(), bookingRepository.countByBookingStatus(status));
        }

        // 6. ĐÓNG TẤT CẢ VÀO 1 CHIẾC GIỎ DUY NHẤT VÀ TRẢ VỀ
        return DashboardResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalBookings(totalBookings)
                .totalPassengers(totalPassengers != null ? totalPassengers : 0L)
                .activeTours(activeTours)
                .monthlyRevenues(monthlyRevenues)
                .topSellingTours(topSellingTours)
                .bookingStatusCounts(bookingStatusCounts)
                .build();
    }
}