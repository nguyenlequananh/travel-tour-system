package com.travelhub.repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.travelhub.entity.Notification;
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findAllByUserId(Long userId, Pageable pageable);
    Long countByUserIdAndIsReadFalse(Long userId);
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") Long userId);
}
