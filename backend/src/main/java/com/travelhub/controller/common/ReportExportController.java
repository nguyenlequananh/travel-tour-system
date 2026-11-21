package com.travelhub.controller.common;

import com.travelhub.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/v1/export")
@RequiredArgsConstructor
public class ReportExportController {

    private final ExportService exportService;

    // 1. Xuất Excel báo cáo tài chính tháng (Admin)
    // GET /api/v1/export/financial-report?month=11&year=2026
    @GetMapping("/financial-report")
    public ResponseEntity<InputStreamResource> exportFinancialReport(
            @RequestParam int month,
            @RequestParam int year) {

        ByteArrayInputStream in = exportService.exportMonthlyFinancialReport(month, year);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=BaoCaoTaiChinh_Thang" + month + "_" + year + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    // 2. Xuất Excel danh sách đoàn cho Hướng dẫn viên (Guide)
    // GET /api/v1/export/guide/departures/{departureId}/manifest?guideUserId=5
    @GetMapping("/guide/departures/{departureId}/manifest")
    public ResponseEntity<InputStreamResource> exportGuideManifest(
            @PathVariable Long departureId,
            @RequestParam Long guideUserId) {

        ByteArrayInputStream in = exportService.exportGuideDepartureManifest(departureId, guideUserId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=DanhSachDoan_ChuyenDi_" + departureId + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    // 3. Xuất Vé điện tử & Hóa đơn PDF cho Khách hàng
    // GET /api/v1/export/booking/{bookingId}/ticket-pdf
    @GetMapping("/booking/{bookingId}/ticket-pdf")
    public ResponseEntity<InputStreamResource> exportBookingTicketPdf(
            @PathVariable Long bookingId) {

        ByteArrayInputStream in = exportService.exportBookingTicketPdf(bookingId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=VeTour_TravelHub_" + bookingId + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(in));
    }
}