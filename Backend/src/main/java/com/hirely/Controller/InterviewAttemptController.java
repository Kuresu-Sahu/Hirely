package com.hirely.Controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.InterviewAttemptResponse;
import com.hirely.Dto.InterviewAttemptSaveRequest;
import com.hirely.Dto.RecruiterInterviewResponse;
import com.hirely.Service.InterviewAttemptService;

import java.util.List;

@RestController
@RequestMapping("/api/interview-attempts")
// @CrossOrigin(origins = "http://localhost:5173")
public class InterviewAttemptController {
        private final InterviewAttemptService attemptService;

        public InterviewAttemptController(InterviewAttemptService attemptService) {
                this.attemptService = attemptService;
        }

        // SAVE COMPLETED INTERVIEW
        @PostMapping
        public ResponseEntity<?> saveAttempt(
                        @Valid @RequestBody InterviewAttemptSaveRequest request,
                        Authentication authentication) {

                try {
                        InterviewAttemptResponse response = attemptService.saveAttempt(
                                request,
                                authentication.getName()
                        );
                        return ResponseEntity.ok(response);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // GET MY INTERVIEW HISTORY
        @GetMapping("/my")
        public ResponseEntity<?> getMyHistory(Authentication authentication) {
                try {
                        List<InterviewAttemptResponse> history = attemptService.getMyHistory(
                                authentication.getName()
                        );

                        return ResponseEntity.ok(history);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // RECRUITER
        // VIEW CANDIDATE INTERVIEW
        @GetMapping("/application/{applicationId}")
        public ResponseEntity<?> getRecruiterInterview(
                @PathVariable Long applicationId,
                Authentication authentication
        ) {
                try {
                        RecruiterInterviewResponse response = attemptService.getRecruiterInterview(
                                applicationId,
                                authentication.getName()
                        );
                        return ResponseEntity.ok(response);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // GET SPECIFIC INTERVIEW ATTEMPT
        @GetMapping("/{id}")
        public ResponseEntity<?> getAttempt(
                @PathVariable Long id,
                Authentication authentication
        ) {
                try {
                        InterviewAttemptResponse response = attemptService.getAttempt(
                                id,
                                authentication.getName()
                        );
                        return ResponseEntity.ok(response);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }
}