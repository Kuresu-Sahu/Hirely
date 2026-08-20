package com.hirely.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.AIResumeAnalysis;
import com.hirely.Service.AIResumeAnalysisService;

@RestController
@RequestMapping("/api/ai")
// @CrossOrigin(origins = "http://localhost:5173")
public class AIResumeAnalysisController {
    private final AIResumeAnalysisService aiService;

    public AIResumeAnalysisController(AIResumeAnalysisService aiService) {
        this.aiService = aiService;
    }

    // AI RESUME ANALYSIS
    @PostMapping("/analyze/{jobId}")
    public ResponseEntity<?> analyzeResume(@PathVariable Long jobId, Authentication authentication) {
        try {
            AIResumeAnalysis result = aiService.analyze(jobId,authentication.getName());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}