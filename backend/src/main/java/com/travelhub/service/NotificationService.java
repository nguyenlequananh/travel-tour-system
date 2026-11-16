package com.travelhub.service;

import com.travelhub.dto.request.NotificationFilterRequest;
import com.travelhub.dto.request.NotificationSendRequest; // Import DTO vừa tạo
import com.travelhub.dto.response.NotificationResponse;
import com.travelhub.dto.response.PageResponse;

import java.util.List;

public interface NotificationService {

    // 1. Lấy danh sách thông báo của 1 tài khoản
    PageResponse<NotificationResponse> getMyNotifications(NotificationFilterRequest request);

    // 2. Đếm số lượng thông báo chưa đọc
    Long countUnreadNotifications(Long userId);

    // 3. Đánh dấu 1 thông báo cụ thể là đã đọc
    void markAsRead(Long notificationId);

    // 4. Đánh dấu tất cả thông báo của user này là đã đọc
    void markAllAsRead(Long userId);

    // 5. HÀM GỬI THÔNG BÁO: Gom gọn vào 1 DTO Request duy nhất!
    NotificationResponse sendAndSaveNotification(NotificationSendRequest request);
}