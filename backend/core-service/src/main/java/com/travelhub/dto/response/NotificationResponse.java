package com.travelhub.dto.response;

import com.travelhub.entity.Notification;
import com.travelhub.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private NotificationType type;
    private String referenceId;
    private String referenceUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;

    // Hàm chuyển đổi chuẩn từ Entity sang DTO
    public static NotificationResponse fromEntity(Notification n) {
        if (n == null) return null;
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUser() != null ? n.getUser().getId() : null)
                .title(n.getTitle())
                .content(n.getContent())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .referenceUrl(n.getReferenceUrl())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}