package com.hirely.Service;

import org.springframework.stereotype.Service;

import com.hirely.Dto.NotificationResponse;
import com.hirely.Entity.Notification;
import com.hirely.Entity.User;
import com.hirely.Repository.NotificationRepository;
import com.hirely.Repository.UserRepository;

import java.util.List;

@Service
public class NotificationService {
        private final NotificationRepository notificationRepository;
        private final UserRepository userRepository;

        public NotificationService(
                NotificationRepository notificationRepository,
                UserRepository userRepository
        ) {

                this.notificationRepository = notificationRepository;
                this.userRepository = userRepository;
        }

        // CREATE NOTIFICATION
        public Notification createNotification(
                User user,
                String title,
                String message,
                String type
        ) {
                return createNotification(user,title,message,type,null);
        }

        // CREATE NOTIFICATION WITH ACTION URL
        public Notification createNotification(
                User user,
                String title,
                String message,
                String type,
                String actionUrl
        ) {
                if (user == null) {
                        throw new RuntimeException("Notification user cannot be null");
                }

                Notification notification = new Notification();

                notification.setUser(user);

                notification.setTitle(title);

                notification.setMessage(message);

                notification.setType(type);

                notification.setActionUrl(actionUrl);

                notification.setRead(false);

                return notificationRepository.save(notification);
        }

        // GET MY NOTIFICATIONS
        public List<NotificationResponse> getMyNotifications(String email) {
                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException( "User not found"));

                return notificationRepository
                                .findByUserIdOrderByCreatedAtDesc(user.getId())
                                .stream()
                                .map(NotificationResponse::new)
                                .toList();
        }

        // GET UNREAD COUNT
        public long getUnreadCount(String email) {
                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return notificationRepository.countByUserIdAndReadFalse(user.getId());
        }

        // MARK ONE AS READ
        public NotificationResponse markAsRead(Long notificationId, String email) {

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Notification notification = notificationRepository
                                .findByIdAndUserId(notificationId, user.getId())
                                .orElseThrow(() -> new RuntimeException("Notification not found"));
                notification.setRead(true);

                Notification saved = notificationRepository.save(notification);

                return new NotificationResponse(saved);
        }

        // MARK ALL AS READ
        public void markAllAsRead(String email) {

                User user = userRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<Notification> notifications = notificationRepository
                                .findByUserIdOrderByCreatedAtDesc(user.getId());

                for (Notification notification : notifications) {
                        notification.setRead(true);
                }

                notificationRepository.saveAll(notifications);
        }
}