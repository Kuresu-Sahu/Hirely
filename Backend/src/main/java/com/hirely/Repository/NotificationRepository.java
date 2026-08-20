package com.hirely.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hirely.Entity.Notification;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

        // GET USER NOTIFICATIONS
        List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

        // COUNT UNREAD
        long countByUserIdAndReadFalse(Long userId);

        // FIND USER'S NOTIFICATION
        Optional<Notification> findByIdAndUserId(Long notificationId, Long userId);
}