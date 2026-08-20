package com.hirely.Service;

import org.springframework.stereotype.Service;

import com.hirely.Dto.InterviewAttemptResponse;
import com.hirely.Dto.InterviewAttemptSaveRequest;
import com.hirely.Dto.RecruiterInterviewResponse;
import com.hirely.Entity.InterviewAttempt;
import com.hirely.Entity.Job;
import com.hirely.Entity.JobApplication;
import com.hirely.Entity.User;
import com.hirely.Repository.InterviewAttemptRepository;
import com.hirely.Repository.JobApplicationRepository;
import com.hirely.Repository.JobRepository;
import com.hirely.Repository.UserRepository;

import java.util.List;

@Service
public class InterviewAttemptService {
        private final InterviewAttemptRepository attemptRepository;

        private final UserRepository userRepository;

        private final JobRepository jobRepository;

        private final JobApplicationRepository applicationRepository;

        public InterviewAttemptService(
                InterviewAttemptRepository attemptRepository,
                UserRepository userRepository,
                JobRepository jobRepository,
                JobApplicationRepository applicationRepository
        ) {
                this.attemptRepository = attemptRepository;

                this.userRepository = userRepository;

                this.jobRepository = jobRepository;

                this.applicationRepository = applicationRepository;
        }

        // SAVE COMPLETED INTERVIEW
        public InterviewAttemptResponse saveAttempt(
                InterviewAttemptSaveRequest request,
                String candidateEmail
        ) {
                // VALIDATE REQUEST
                if (request == null) {
                        throw new RuntimeException("Interview data is required");
                }

                if (request.getJobId() == null) {
                        throw new RuntimeException("Job ID is required");
                }

                if (request.getResultJson() == null || request.getResultJson().isBlank()) {
                        throw new RuntimeException("Interview result is empty");
                }

                // FIND CANDIDATE
                User candidate = userRepository
                        .findByEmail(candidateEmail)
                        .orElseThrow(() -> new RuntimeException("Candidate not found")
                );

                // ROLE CHECK
                if (!"CANDIDATE".equals(candidate.getRole())) {
                        throw new RuntimeException("Only candidates can save interview attempts");
                }

                // FIND JOB
                Job job = jobRepository
                        .findById(request.getJobId())
                        .orElseThrow(() -> new RuntimeException("Job not found"));

                // FIND CANDIDATE APPLICATION
                //
                // SECURITY CHECK:
                //
                // Candidate must actually have an application
                // for this specific job.
                JobApplication application = applicationRepository
                        .findByJobIdAndCandidateId(job.getId(),candidate.getId())
                        .orElseThrow(() -> new RuntimeException("You must apply for this job before submitting an interview"));

                // VERIFY CANDIDATE OWNERSHIP
                if (application.getCandidate() == null || !application
                        .getCandidate()
                        .getId()
                        .equals(candidate.getId())
                ) {
                        throw new RuntimeException("You are not allowed to submit this interview");
                }

                // VERIFY JOB MATCH
                if (application.getJob() == null || !application
                        .getJob()
                        .getId()
                        .equals(job.getId())
                ) {
                        throw new RuntimeException("Interview job does not match the application");
                }

                /*
                 * IMPORTANT:
                 *
                 * We intentionally DO NOT require:
                 *
                 * application.status == INTERVIEW
                 *
                 * because the current frontend allows a candidate
                 * to start the AI interview immediately after
                 * applying for a job.
                 *
                 * The important security rule is that the candidate
                 * must own a real application for this job.
                 */

                // VALIDATE QUESTION COUNT
                if (request.getTotalQuestions() == null || request.getTotalQuestions() <= 0) {
                        throw new RuntimeException("Invalid total question count");
                }

                // VALIDATE AVERAGE SCORE
                if (request.getAverageScore() != null && (request.getAverageScore() < 0 || request.getAverageScore() > 10)) {
                        throw new RuntimeException("Average score must be between 0 and 10");
                }

                // VALIDATE PERCENTAGE
                if (request.getPercentage() != null && (request.getPercentage() < 0 || request.getPercentage() > 100)) {
                        throw new RuntimeException("Percentage must be between 0 and 100");
                }

                // CREATE INTERVIEW ATTEMPT
                InterviewAttempt attempt = new InterviewAttempt();

                attempt.setCandidate(candidate);

                attempt.setJob(job);

                attempt.setTotalQuestions(request.getTotalQuestions());

                attempt.setAverageScore(request.getAverageScore());

                attempt.setPercentage(request.getPercentage());

                attempt.setOverallRating(request.getOverallRating());

                attempt.setResultJson(request.getResultJson());

                // SAVE
                InterviewAttempt saved = attemptRepository.save(attempt);

                return convertToResponse(saved);
        }

        // GET MY INTERVIEW HISTORY
        public List<InterviewAttemptResponse> getMyHistory(String candidateEmail) {
                User candidate = userRepository
                        .findByEmail(candidateEmail)
                        .orElseThrow(() -> new RuntimeException("Candidate not found"));

                if (!"CANDIDATE".equals(candidate.getRole())) {
                        throw new RuntimeException("Only candidates can view interview history");
                }

                return attemptRepository.findByCandidateIdOrderByCompletedAtDesc(candidate.getId())
                        .stream()
                        .map(this::convertToResponse)
                        .toList();
        }

        // GET SPECIFIC CANDIDATE ATTEMPT
        public InterviewAttemptResponse getAttempt(
                Long attemptId,
                String candidateEmail
        ) {
                User candidate = userRepository
                        .findByEmail(candidateEmail)
                        .orElseThrow(() -> new RuntimeException("Candidate not found"));

                if (!"CANDIDATE".equals(candidate.getRole())) {
                        throw new RuntimeException("Only candidates can view interview attempts");
                }

                InterviewAttempt attempt = attemptRepository.findByIdAndCandidateId(attemptId,candidate.getId())
                        .orElseThrow(() -> new RuntimeException("Interview attempt not found"));

                return convertToResponse(attempt);
        }

        // RECRUITER VIEW INTERVIEW
        public RecruiterInterviewResponse getRecruiterInterview(Long applicationId,String recruiterEmail) {
                // FIND RECRUITER
                User recruiter = userRepository
                                .findByEmail(recruiterEmail)
                                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

                // ROLE CHECK
                if (!"RECRUITER".equals(recruiter.getRole())) {
                        throw new RuntimeException("Only recruiters can view candidate interviews");
                }

                // COMPANY CHECK
                if (recruiter.getCompany() == null) {
                        throw new RuntimeException("Recruiter does not have a company");
                }

                // FIND APPLICATION
                JobApplication application = applicationRepository
                                .findById(applicationId)
                                .orElseThrow(() -> new RuntimeException("Application not found"));

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
                        throw new RuntimeException("You are not allowed to view this interview");
                }

                // FIND CANDIDATE
                User candidate = application.getCandidate();

                if (candidate == null) {
                        throw new RuntimeException("Candidate not found");
                }

                // FIND LATEST INTERVIEW
                InterviewAttempt attempt = attemptRepository
                                .findTopByCandidateIdAndJobIdOrderByCompletedAtDesc(candidate.getId(),job.getId())
                                .orElseThrow(() -> new RuntimeException("Candidate has not completed an AI interview for this job yet"));

                // RESPONSE
                RecruiterInterviewResponse response = new RecruiterInterviewResponse();

                response.setAttemptId(attempt.getId());

                response.setApplicationId(application.getId());

                response.setCandidateId(candidate.getId());

                response.setCandidateName(candidate.getName());

                response.setCandidateEmail(candidate.getEmail());

                response.setJobId(job.getId());

                response.setJobTitle(job.getTitle());

                response.setTotalQuestions(attempt.getTotalQuestions());

                response.setAverageScore(attempt.getAverageScore());

                response.setPercentage(attempt.getPercentage());

                response.setOverallRating(attempt.getOverallRating());

                response.setCompletedAt(attempt.getCompletedAt());

                response.setResultJson(attempt.getResultJson());

                return response;
        }

        // ENTITY → RESPONSE
        private InterviewAttemptResponse convertToResponse(InterviewAttempt attempt) {

                InterviewAttemptResponse response = new InterviewAttemptResponse();

                response.setId(attempt.getId());

                if (attempt.getJob() != null) {
                        response.setJobId(attempt.getJob().getId());

                        response.setJobTitle(attempt.getJob().getTitle());
                }

                response.setTotalQuestions(attempt.getTotalQuestions());

                response.setAverageScore(attempt.getAverageScore());

                response.setPercentage(attempt.getPercentage());

                response.setOverallRating(attempt.getOverallRating());

                response.setCompletedAt(attempt.getCompletedAt());

                response.setResultJson(attempt.getResultJson());

                return response;
        }
}