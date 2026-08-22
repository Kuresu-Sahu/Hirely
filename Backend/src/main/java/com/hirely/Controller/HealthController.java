package com.hirely.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/db")
    public ResponseEntity<String> databaseHealth() {
        try {
            Integer result = jdbcTemplate.queryForObject(
                    "SELECT 1",
                    Integer.class
            );

            if (Integer.valueOf(1).equals(result)) {
                return ResponseEntity.ok("Database is healthy");
            }

            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Database check failed");

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Database unavailable");
        }
    }
}