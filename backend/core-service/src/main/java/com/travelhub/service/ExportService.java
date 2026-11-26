package com.travelhub.service;

import java.io.ByteArrayInputStream;

public interface ExportService {
    // 1. Xuất Excel báo cáo tài chính & doanh thu theo tháng cho Admin
    ByteArrayInputStream exportMonthlyFinancialReport(int month, int year);

    // 2. Xuất Excel danh sách hành khách chuyến đi cho Hướng dẫn viên (Tour Guide)
    ByteArrayInputStream exportGuideDepartureManifest(Long departureId, Long guideUserId);

    // 3. Xuất Vé điện tử & Hóa đơn PDF cho Khách hàng
    ByteArrayInputStream exportBookingTicketPdf(Long bookingId);
}