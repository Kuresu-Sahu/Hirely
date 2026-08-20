package com.hirely.Service;

import org.springframework.stereotype.Service;

import com.hirely.Dto.AIResumeAnalysis;
import com.hirely.Entity.Job;
import com.hirely.Entity.Resume;
import com.hirely.Entity.ResumeAnalysis;
import com.hirely.Entity.User;
import com.hirely.Repository.JobRepository;
import com.hirely.Repository.ResumeAnalysisRepository;
import com.hirely.Repository.ResumeRepository;
import com.hirely.Repository.UserRepository;

import java.util.stream.Collectors;

@Service
public class AIResumeAnalysisService {

        private final ResumeRepository resumeRepository;

        private final JobRepository jobRepository;

        private final UserRepository userRepository;

        private final ResumeAnalysisRepository resumeAnalysisRepository;

        private final OpenAIService openAIService;

        public AIResumeAnalysisService(
                ResumeRepository resumeRepository,
                JobRepository jobRepository,
                UserRepository userRepository,
                ResumeAnalysisRepository resumeAnalysisRepository,
                OpenAIService openAIService
        ) {
                this.resumeRepository = resumeRepository;
                this.jobRepository = jobRepository;
                this.userRepository = userRepository;
                this.resumeAnalysisRepository = resumeAnalysisRepository;
                this.openAIService = openAIService;
        }

        // ANALYZE RESUME
        public AIResumeAnalysis analyze(
                Long jobId,
                String candidateEmail
        ) {
                // FIND CANDIDATE
                User candidate = userRepository
                        .findByEmail(candidateEmail)
                        .orElseThrow(() -> new RuntimeException("Candidate not found"));

                // CHECK ROLE
                if (!"CANDIDATE".equals(candidate.getRole())) {
                        throw new RuntimeException("Only candidates can analyze resumes");
                }

                // FIND RESUME
                Resume resume = resumeRepository.findByCandidateId(candidate.getId())
                        .orElseThrow(() -> new RuntimeException("Please upload your resume first"));

                // FIND JOB
                Job job = jobRepository
                        .findById(jobId)
                        .orElseThrow(() -> new RuntimeException("Job not found"));

                // CHECK RESUME TEXT
                if (resume.getExtractedText() == null || resume.getExtractedText().isBlank()) {
                        throw new RuntimeException("Resume text is empty");
                }

                // RUN ATS ANALYSIS
                AIResumeAnalysis result = openAIService.analyzeResume(
                        resume.getExtractedText(),
                        job.getTitle(),
                        job.getDescription()
                );

                // SAVE ANALYSIS TO DATABASE
                ResumeAnalysis analysis = new ResumeAnalysis();
                analysis.setAtsScore(result.getAtsScore());

                // Convert List<String> into a single String
                // because ResumeAnalysis stores these fields
                // as TEXT in MySQL.
                analysis.setMatchedKeywords(convertListToText(result.getMatchedSkills()));

                analysis.setMissingKeywords(convertListToText(result.getMissingSkills()));

                analysis.setStrengths(convertListToText(result.getStrengths()));

                /*
                 * We store both suggestions and resume
                 * improvements in the suggestions field.
                 */
                String suggestions = combineSuggestions(result);
                analysis.setSuggestions(suggestions);

                // Connect analysis to resume
                analysis.setResume(resume);

                // Connect analysis to job
                analysis.setJob(job);

                // Save into resume_analyses table
                resumeAnalysisRepository.save(analysis);

                // RETURN RESULT TO CONTROLLER
                return result;
        }

        // CONVERT LIST TO TEXT
        private String convertListToText(java.util.List<String> list) {
                if (list == null || list.isEmpty()) {
                        return "";
                }

                return list.stream()
                        .map(String::trim)
                        .filter(value -> !value.isBlank())
                        .collect(Collectors.joining(", "));
        }

        // COMBINE SUGGESTIONS
        private String combineSuggestions(AIResumeAnalysis result) {
                StringBuilder builder = new StringBuilder();

                // Suggestions
                if (result.getSuggestions() != null && !result.getSuggestions().isEmpty()) {
                        builder.append("Suggestions:\n");
                        for (String suggestion : result.getSuggestions()) {
                                builder.append("- ").append(suggestion).append("\n");
                        }
                }

                // Resume Improvements
                if (result.getResumeImprovements() != null && !result.getResumeImprovements().isEmpty()) {
                        builder.append("\nResume Improvements:\n");
                        for (String improvement : result.getResumeImprovements()) {
                                builder.append("- ").append(improvement).append("\n");
                        }
                }
                return builder.toString().trim();
        }
}