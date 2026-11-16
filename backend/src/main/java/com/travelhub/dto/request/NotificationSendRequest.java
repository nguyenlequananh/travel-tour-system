package com.travelhub.dto.request;

import com.travelhub.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationSendRequest {

    private Long recipientUserId;

    @NotBlank(message = "Tiêu đề thông báo không được để trống")
    private String title;

    @NotBlank(message = "Nội dung thông báo không được để trống")
    private String content;

    @NotNull(message = "Loại thông báo không được để trống")
    private NotificationType type;

    private String referenceId;  // Mã đơn BK-... hoặc ID liên quan

    private String referenceUrl; // Link điều hướng: /admin/bookings, /guide...

    @NotBlank(message = "Kênh WebSocket (destinationTopic) không được để trống")
    private String destinationTopic; // Ví dụ: "/topic/admin/notifications"
}