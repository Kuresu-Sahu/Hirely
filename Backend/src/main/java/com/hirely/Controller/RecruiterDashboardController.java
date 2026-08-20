package com.hirely.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.RecruiterDashboardResponse;
import com.hirely.Service.RecruiterDashboardService;

@RestController
@RequestMapping("/api/recruiter/dashboard")
// @CrossOrigin(origins = "http://localhost:5173")
public class RecruiterDashboardController {
        private final RecruiterDashboardService dashboardService;

        public RecruiterDashboardController(RecruiterDashboardService dashboardService) {
                this.dashboardService = dashboardService;
        }

        // RECRUITER DASHBOARD STATISTICS
        @GetMapping("/stats")
        public ResponseEntity<?> getDashboardStats(Authentication authentication) {
                try {
                        RecruiterDashboardResponse response = dashboardService.getDashboard(
                                authentication.getName()
                        );
                        return ResponseEntity.ok(response);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }
}