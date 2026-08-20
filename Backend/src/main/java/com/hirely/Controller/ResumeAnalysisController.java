package com.hirely.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.ResumeAnalysisDetailResponse;
import com.hirely.Dto.ResumeAnalysisHistoryResponse;
import com.hirely.Dto.ResumeAnalysisResponse;
import com.hirely.Service.ResumeAnalysisService;

import java.util.List;

@RestController
@RequestMapping("/api/resume-analysis")
// @CrossOrigin(origins = "http://localhost:5173")
public class ResumeAnalysisController {
        private final ResumeAnalysisService analysisService;

        public ResumeAnalysisController(ResumeAnalysisService analysisService) {
                this.analysisService = analysisService;
        }

        // ANALYZE RESUME AGAINST JOB
        @PostMapping("/job/{jobId}")
        public ResponseEntity<?> analyzeResume(
                @PathVariable Long jobId,
                Authentication authentication
        ) {
                try {
                        ResumeAnalysisResponse response = analysisService.analyzeResume(
                                jobId,
                                authentication.getName()
                        );
                        return ResponseEntity.ok(response);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // GET MY ANALYSIS HISTORY
        @GetMapping("/my")
        public ResponseEntity<?> getMyAnalysisHistory(Authentication authentication) {
                try {
                        List<ResumeAnalysisHistoryResponse> history = analysisService.getAnalysisHistory(
                                authentication.getName()
                        );
                        return ResponseEntity.ok(history);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // GET LATEST ANALYSIS
        @GetMapping("/latest")
        public ResponseEntity<?> getLatestAnalysis(Authentication authentication) {
                try {
                        ResumeAnalysisDetailResponse response = analysisService.getLatestAnalysis(
                                authentication.getName()
                        );
                        return ResponseEntity.ok(response);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // GET SPECIFIC ANALYSIS
        @GetMapping("/{id}")
        public ResponseEntity<?> getAnalysisById(@PathVariable Long id, Authentication authentication) {
                try {
                        ResumeAnalysisDetailResponse response = analysisService.getAnalysisById(
                                id,
                                authentication.getName()
                        );
                        return ResponseEntity.ok(response);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }
}