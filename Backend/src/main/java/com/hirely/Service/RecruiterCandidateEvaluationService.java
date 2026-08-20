package com.hirely.Service;

import org.springframework.stereotype.Service;

import com.hirely.Dto.ApplicationResponse;
import com.hirely.Dto.RecruiterCandidateEvaluationResponse;
import com.hirely.Dto.RecruiterInterviewResponse;
import com.hirely.Dto.ResumeAnalysisDetailResponse;
import com.hirely.Entity.Job;
import com.hirely.Entity.JobApplication;
import com.hirely.Entity.Resume;
import com.hirely.Entity.ResumeAnalysis;
import com.hirely.Entity.User;
import com.hirely.Repository.JobApplicationRepository;
import com.hirely.Repository.ResumeAnalysisRepository;
import com.hirely.Repository.ResumeRepository;
import com.hirely.Repository.UserRepository;

@Service
public class RecruiterCandidateEvaluationService {

        private final JobApplicationRepository applicationRepository;

        private final ResumeRepository resumeRepository;

        private final ResumeAnalysisRepository resumeAnalysisRepository;

        private final UserRepository userRepository;

        private final InterviewAttemptService interviewAttemptService;

        public RecruiterCandidateEvaluationService(
                        JobApplicationRepository applicationRepository,
                        ResumeRepository resumeRepository,
                        ResumeAnalysisRepository resumeAnalysisRepository,
                        UserRepository userRepository,
                        InterviewAttemptService interviewAttemptService
        ) {

                this.applicationRepository = applicationRepository;

                this.resumeRepository = resumeRepository;

                this.resumeAnalysisRepository = resumeAnalysisRepository;

                this.userRepository = userRepository;

                this.interviewAttemptService = interviewAttemptService;
        }

        // GET COMPLETE CANDIDATE EVALUATION
        public RecruiterCandidateEvaluationResponse getCandidateEvaluation(
                        Long applicationId,
                        String recruiterEmail
        ) {

                // FIND RECRUITER
                User recruiter = userRepository
                                .findByEmail(recruiterEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Recruiter not found"));

                // CHECK ROLE
                if (!"RECRUITER".equals(recruiter.getRole())) {
                        throw new RuntimeException("Only recruiters can view candidate evaluations");
                }

                // CHECK COMPANY
                if (recruiter.getCompany() == null) {
                        throw new RuntimeException("Recruiter does not have a company");
                }

                // FIND APPLICATION
                JobApplication application = applicationRepository
                                .findById(applicationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Application not found"));

                // FIND JOB
                Job job = application.getJob();

                if (job == null) {
                        throw new RuntimeException("Job not found for this application");
                }

                // CHECK JOB COMPANY
                if (job.getCompany() == null) {
                        throw new RuntimeException("Job does not belong to a company");
                }

                if (!job.getCompany().getId().equals(recruiter.getCompany().getId())) {
                        throw new RuntimeException("You are not allowed to view this candidate");
                }

                // FIND CANDIDATE
                User candidate = application.getCandidate();

                if (candidate == null) {
                        throw new RuntimeException("Candidate not found");
                }

                // CREATE APPLICATION RESPONSE
                ApplicationResponse applicationResponse = createApplicationResponse(application);

                // CREATE FINAL RESPONSE
                RecruiterCandidateEvaluationResponse response = new RecruiterCandidateEvaluationResponse();

                response.setApplication(applicationResponse);

                // RESUME ANALYSIS
                Resume resume = resumeRepository
                                .findByCandidateId(candidate.getId())
                                .orElse(null);

                if (resume != null) {
                        ResumeAnalysis analysis = resumeAnalysisRepository
                                        .findFirstByResumeIdAndJobIdOrderByAnalyzedAtDesc(resume.getId(),job.getId())
                                        .orElse(null);
                        if (analysis != null) {
                                response.setResumeAnalysis(convertAnalysisToResponse(analysis));
                        }
                }

                // AI INTERVIEW
                try {
                        RecruiterInterviewResponse interview = interviewAttemptService
                                .getRecruiterInterview(applicationId, recruiterEmail);

                        response.setInterview(interview);
                } catch (RuntimeException e) {

                        /*
                         * No completed interview is not considered
                         * an error for the evaluation page.
                         *
                         * Therefore interview remains null.
                         */
                        response.setInterview(null);
                }
                return response;
        }

        // APPLICATION → DTO
        private ApplicationResponse createApplicationResponse(JobApplication application) {

                ApplicationResponse response = new ApplicationResponse();

                // APPLICATION
                response.setApplicationId(application.getId());

                response.setCoverLetter(application.getCoverLetter());

                response.setStatus(application.getStatus());

                response.setAppliedAt(application.getAppliedAt());

                // JOB
                Job job = application.getJob();

                if (job != null) {
                        response.setJobId(job.getId());
                        response.setJobTitle(job.getTitle());

                        if (job.getCompany() != null) {
                                response.setCompanyName(job.getCompany().getName());
                                response.setCompanyLocation(job.getCompany().getLocation());
                        }
                }

                // CANDIDATE
                User candidate = application.getCandidate();
                if (candidate != null) {
                        response.setCandidateId(candidate.getId());

                        response.setCandidateName(candidate.getName());

                        response.setCandidateEmail(candidate.getEmail());

                        response.setResumeAvailable(resumeRepository
                                .findByCandidateId(candidate.getId())
                                .isPresent()
                        );
                }
                return response;
        }

        // RESUME ANALYSIS → DTO
        private ResumeAnalysisDetailResponse convertAnalysisToResponse(ResumeAnalysis analysis) {

                ResumeAnalysisDetailResponse response = new ResumeAnalysisDetailResponse();

                response.setAnalysisId(analysis.getId());

                if (analysis.getJob() != null) {
                        response.setJobId(analysis.getJob().getId());
                        response.setJobTitle(analysis.getJob().getTitle());
                }

                response.setAtsScore(analysis.getAtsScore());

                response.setMatchedKeywords(splitText(analysis.getMatchedKeywords()));

                response.setMissingKeywords(splitText(analysis.getMissingKeywords()));

                response.setStrengths(splitText(analysis.getStrengths()));

                response.setSuggestions(splitText(analysis.getSuggestions()));

                response.setAnalyzedAt(analysis.getAnalyzedAt());
                return response;
        }

        // TEXT → LIST
        private java.util.List<String> splitText(String text) {
                if (text == null || text.isBlank()) {
                        return java.util.List.of();
                }
                return java.util.Arrays.stream(text.split("\\s*,\\s*"))
                                .map(String::trim)
                                .filter(value -> !value.isBlank())
                                .toList();
        }
}