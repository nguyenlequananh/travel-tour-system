package com.travelhub.controller.admin;

import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.DashboardResponse;
import com.travelhub.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardResponse>> getStats(
            @RequestParam(required = false) Integer year) {
        
        DashboardResponse stats = dashboardService.getDashboardStats(year);
        
        return ResponseEntity.ok(ApiResponse.<DashboardResponse>builder()
                .status(200)
                .message("Lấy dữ liệu thống kê thành công")
                .data(stats)
                .build());
    }
}