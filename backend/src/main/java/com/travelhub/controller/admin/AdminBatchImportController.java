package com.travelhub.controller.admin;

import com.travelhub.dto.common.ApiResponse;
import com.travelhub.dto.response.BatchImportResponse;
import com.travelhub.service.BatchImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/admin/batch/departures")
@RequiredArgsConstructor
public class AdminBatchImportController {

    private final BatchImportService batchImportService;

    // 1. Tải file CSV mẫu về cho Admin điền dữ liệu
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        String csvContent = "\uFEFF"
                + "tourCode,departureDate,adultPrice,childPrice,singleRoomSupplement,maxSeats\n"
                + "TOUR-DN-01,2026-12-20,3590000,2590000,600000,30\n"
                + "TOUR-DN-01,2026-12-27,3890000,2790000,600000,25\n";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=template_import_departures.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvContent.getBytes(StandardCharsets.UTF_8));
    }

    // 2. Upload file CSV để chạy Spring Batch Job import đợt khởi hành hàng loạt
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BatchImportResponse>> importDepartures(
            @RequestParam("file") MultipartFile file) {
        BatchImportResponse result = batchImportService.importDeparturesFromCsv(file);
        return ResponseEntity.ok(ApiResponse.<BatchImportResponse>builder()
                .status(200)
                .message("Chạy Spring Batch Import hoàn tất!")
                .data(result)
                .build());
    }
}
