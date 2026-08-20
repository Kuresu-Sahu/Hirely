package com.hirely.Controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.InterviewAnswerRequest;
import com.hirely.Dto.InterviewEvaluationResponse;
import com.hirely.Dto.InterviewQuestionResponse;
import com.hirely.Service.InterviewPreparationService;

import java.util.List;

@RestController
@RequestMapping("/api/interview")
// @CrossOrigin(origins = "http://localhost:5173")
public class InterviewPreparationController {
        private final InterviewPreparationService interviewService;

        public InterviewPreparationController(InterviewPreparationService interviewService) {
                this.interviewService = interviewService;
        }

        // GET INTERVIEW QUESTIONS FOR A JOB
        @GetMapping("/job/{jobId}")
        public ResponseEntity<?> getInterviewQuestions(
                @PathVariable Long jobId,
                Authentication authentication
        ) {
                try {
                        List<InterviewQuestionResponse> questions = interviewService.getQuestionsForJob(
                                jobId,
                                authentication.getName()
                        );
                        return ResponseEntity.ok(questions);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // EVALUATE INTERVIEW ANSWER
        @PostMapping("/evaluate")
        public ResponseEntity<?> evaluateAnswer(
                @Valid @RequestBody InterviewAnswerRequest request,
                Authentication authentication
        ) {
                try {
                        InterviewEvaluationResponse response = interviewService.evaluateAnswer(
                                request.getQuestionId(),
                                request.getAnswer(),
                                authentication.getName());
                        return ResponseEntity.ok(response);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }
}