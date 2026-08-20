package com.hirely.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.RecruiterCandidateEvaluationResponse;
import com.hirely.Service.RecruiterCandidateEvaluationService;

@RestController
@RequestMapping("/api/recruiter/evaluations")
// @CrossOrigin(origins = "http://localhost:5173")
public class RecruiterCandidateEvaluationController {
        private final RecruiterCandidateEvaluationService evaluationService;

        public RecruiterCandidateEvaluationController(RecruiterCandidateEvaluationService evaluationService) {
                this.evaluationService = evaluationService;
        }

        // GET COMPLETE CANDIDATE EVALUATION
        @GetMapping("/application/{applicationId}")
        public ResponseEntity<?> getCandidateEvaluation(@PathVariable Long applicationId,Authentication authentication) {
                try {
                        RecruiterCandidateEvaluationResponse response = evaluationService.getCandidateEvaluation(
                                applicationId,
                                authentication.getName()
                        );
                        return ResponseEntity.ok(response);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }
}