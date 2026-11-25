package com.travelhub.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.travelhub.dto.filter.NotificationFilterRequest;
import com.travelhub.dto.message.NotificationSendRequest;
import com.travelhub.dto.response.NotificationResponse;
import com.travelhub.dto.common.PageResponse;
import com.travelhub.entity.Notification;
import com.travelhub.entity.User;
import com.travelhub.repository.NotificationRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(NotificationFilterRequest request) {
        if (request.getUserId() == null) {
            throw new RuntimeException("User ID ko duoc trong");
        }
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + request.getUserId()));
        Pageable pageable = request.toPageable();
        Page<Notification> pageNotification = notificationRepository.findAllByUserId(request.getUserId(), pageable);

        return PageResponse.fromPage(pageNotification, NotificationResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countUnreadNotifications(Long userId) {
        if (userId == null) {
            throw new RuntimeException("User ID ko duoc trong");
        }
        Long count = notificationRepository.countByUserIdAndIsReadFalse(userId);

        return count;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAsRead(Long notificationId) {
        Notification notification = findNotificationEntityById(notificationId);
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public Notification findNotificationEntityById(Long notificationId) {
        if (notificationId == null) {
            throw new RuntimeException("Notification ID ko duoc trong");
        }
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification khong ton tai"));
        return notification;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public NotificationResponse sendAndSaveNotification(NotificationSendRequest request) {
        if (request.getDestinationTopic() == null || request.getDestinationTopic().trim().isEmpty()) {
            throw new RuntimeException("Destination topic không được để trống");
        }

        NotificationResponse response = null;
        if (request.getDestinationTopic().startsWith("/topic/admin")) {
            List<User> adminUsers = userRepository.findAllActiveAdmins();

            for (User admin : adminUsers) {
                Notification notification = Notification.builder()
                        .user(admin)
                        .title(request.getTitle())
                        .content(request.getContent())
                        .type(request.getType())
                        .referenceId(request.getReferenceId())
                        .referenceUrl(request.getReferenceUrl())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                Notification savedNotification = notificationRepository.save(notification);
                if (response == null) {
                    response = NotificationResponse.fromEntity(savedNotification);
                }
            }
             // 👉 THÊM ĐOẠN NÀY: Phòng vệ nếu DB chưa có Admin nào, tránh gửi payload null
            if (response == null) {
                response = NotificationResponse.builder()
                        .title(request.getTitle())
                        .content(request.getContent())
                        .type(request.getType())
                        .referenceId(request.getReferenceId())
                        .referenceUrl(request.getReferenceUrl())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
            }
            messagingTemplate.convertAndSend(request.getDestinationTopic(), response);

        } else {
            if (request.getRecipientUserId() == null) {
                throw new RuntimeException("Recipient user ID không được để trống");
            }
            User user = userRepository.findById(request.getRecipientUserId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy người dùng với ID: " + request.getRecipientUserId()));
            Notification notification = Notification.builder()
                    .user(user)
                    .title(request.getTitle().trim())
                    .content(request.getContent().trim())
                    .type(request.getType())
                    .referenceId(request.getReferenceId())
                    .referenceUrl(request.getReferenceUrl())
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            Notification saved = notificationRepository.save(notification);
            response = NotificationResponse.fromEntity(saved);
            messagingTemplate.convertAndSend("/queue/notifications/" + request.getRecipientUserId(), response);
        }
        return response;
    }
}
