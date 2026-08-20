package com.hirely.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.NotificationResponse;
import com.hirely.Service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
// @CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {
        private final NotificationService notificationService;

        public NotificationController(NotificationService notificationService) {
                this.notificationService = notificationService;
        }

        // GET MY NOTIFICATIONS
        @GetMapping
        public ResponseEntity<?> getMyNotifications(Authentication authentication) {
                try {
                        List<NotificationResponse> notifications = notificationService.getMyNotifications(
                                authentication.getName()
                        );
                        return ResponseEntity.ok(notifications);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // GET UNREAD COUNT
        @GetMapping("/unread-count")
        public ResponseEntity<?> getUnreadCount(Authentication authentication) {
                try {
                        long count = notificationService.getUnreadCount(
                                authentication.getName()
                        );
                        return ResponseEntity.ok(count);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // MARK ONE AS READ
        @PutMapping("/{id}/read")
        public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
                try {
                        NotificationResponse response = notificationService.markAsRead(
                                id,
                                authentication.getName()
                        );
                        return ResponseEntity.ok(response);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // MARK ALL AS READ
        @PutMapping("/read-all")
        public ResponseEntity<?> markAllAsRead(Authentication authentication) {
                try {
                        notificationService.markAllAsRead(authentication.getName());
                        return ResponseEntity.ok("All notifications marked as read");
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }
}