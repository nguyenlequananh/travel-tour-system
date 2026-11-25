package com.travelhub.controller.common;

import com.travelhub.dto.filter.NotificationFilterRequest;
import com.travelhub.dto.common.ApiResponse;
import com.travelhub.dto.response.NotificationResponse;
import com.travelhub.dto.common.PageResponse;
import com.travelhub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // 1. Lấy danh sách thông báo của tài khoản (Phân trang Load More)
    // URL: GET http://localhost:8081/api/v1/notifications/my-notifications?userId=1&page=0&size=10
    @GetMapping("/my-notifications")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getMyNotifications(
            NotificationFilterRequest request) {

        return ResponseEntity.ok(ApiResponse.<PageResponse<NotificationResponse>>builder()
                .status(200)
                .message("Lấy danh sách thông báo thành công")
                .data(notificationService.getMyNotifications(request))
                .build());
    }

    // 2. Đếm số lượng thông báo chưa đọc (Hiện số đỏ trên chuông 🔔)
    // URL: GET http://localhost:8081/api/v1/notifications/unread-count?userId=1
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> countUnreadNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .status(200)
                .message("Lấy số lượng thông báo chưa đọc thành công")
                .data(notificationService.countUnreadNotifications(userId))
                .build());
    }

    // 3. Đánh dấu 1 thông báo cụ thể là đã đọc (Khi bấm vào 1 dòng thông báo)
    // URL: PATCH http://localhost:8081/api/v1/notifications/{id}/read
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Đánh dấu thông báo đã đọc thành công")
                .data(null)
                .build());
    }

    // 4. Đánh dấu tất cả thông báo của tài khoản là đã đọc (Nút "Đọc tất cả")
    // URL: PATCH http://localhost:8081/api/v1/notifications/read-all?userId=1
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Đã đánh dấu đọc tất cả thông báo")
                .data(null)
                .build());
    }
}