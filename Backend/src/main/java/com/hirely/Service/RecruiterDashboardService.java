package com.hirely.Service;

import org.springframework.stereotype.Service;

import com.hirely.Dto.RecentRecruiterApplicationResponse;
import com.hirely.Dto.RecruiterDashboardResponse;
import com.hirely.Entity.ApplicationStatus;
import com.hirely.Entity.InterviewAttempt;
import com.hirely.Entity.Job;
import com.hirely.Entity.JobApplication;
import com.hirely.Entity.User;
import com.hirely.Repository.InterviewAttemptRepository;
import com.hirely.Repository.JobApplicationRepository;
import com.hirely.Repository.JobRepository;
import com.hirely.Repository.UserRepository;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RecruiterDashboardService {

        private final UserRepository userRepository;

        private final JobRepository jobRepository;

        private final JobApplicationRepository applicationRepository;

        private final InterviewAttemptRepository interviewAttemptRepository;

        public RecruiterDashboardService(
                        UserRepository userRepository,
                        JobRepository jobRepository,
                        JobApplicationRepository applicationRepository,
                        InterviewAttemptRepository interviewAttemptRepository) {

                this.userRepository = userRepository;

                this.jobRepository = jobRepository;

                this.applicationRepository = applicationRepository;

                this.interviewAttemptRepository = interviewAttemptRepository;
        }

        // GET RECRUITER DASHBOARD
        public RecruiterDashboardResponse getDashboard(String recruiterEmail) {
                // FIND RECRUITER
                User recruiter = userRepository
                                .findByEmail(recruiterEmail)
                                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

                // CHECK ROLE
                if (!"RECRUITER".equals(recruiter.getRole())) {
                        throw new RuntimeException("Only recruiters can view recruiter dashboard");
                }

                // CHECK COMPANY
                if (recruiter.getCompany() == null) {
                        throw new RuntimeException("Please create your company first");
                }

                Long companyId = recruiter
                                .getCompany()
                                .getId();

                // GET COMPANY JOBS
                List<Job> jobs = jobRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);

                // BASIC JOB COUNT
                long totalJobs = jobs.size();

                /*
                 * The current Job entity does not contain an
                 * active/inactive field.
                 *
                 * Therefore, every existing job is considered
                 * active for now.
                 */
                long activeJobs = totalJobs;

                // IF NO JOBS
                if (jobs.isEmpty()) {

                        RecruiterDashboardResponse response = new RecruiterDashboardResponse();

                        response.setTotalJobs(0);

                        response.setActiveJobs(0);

                        response.setTotalApplications(0);

                        response.setTotalCandidates(0);

                        response.setTotalInterviews(0);

                        response.setSelectedCandidates(0);

                        response.setRejectedCandidates(0);

                        response.setPendingApplications(0);

                        response.setRecentApplications(Collections.emptyList());

                        return response;
                }

                // COLLECT JOB IDS
                List<Long> jobIds = jobs.stream()
                                .map(Job::getId)
                                .toList();

                // GET ALL APPLICATIONS
                List<JobApplication> applications = applicationRepository
                                .findByJobIdInOrderByAppliedAtDesc(jobIds);

                // APPLICATION COUNT
                long totalApplications = applications.size();

                // UNIQUE CANDIDATES
                Set<Long> candidateIds = new HashSet<>();

                for (JobApplication application : applications) {
                        if (application.getCandidate() != null) {
                                candidateIds.add(application.getCandidate().getId());
                        }
                }

                long totalCandidates = candidateIds.size();

                // SELECTED
                long selectedCandidates = applications.stream()
                                .filter(application -> application.getStatus() == ApplicationStatus.SELECTED)
                                .count();

                // REJECTED
                long rejectedCandidates = applications.stream()
                                .filter(application -> application.getStatus() == ApplicationStatus.REJECTED)
                                .count();

                // PENDING
                long pendingApplications = applications.stream()
                                .filter(application -> {
                                        ApplicationStatus status = application.getStatus();
                                        return status == ApplicationStatus.APPLIED || status == ApplicationStatus.SHORTLISTED || status == ApplicationStatus.INTERVIEW;
                                })
                                .count();

                // GET INTERVIEWS
                List<InterviewAttempt> interviews = interviewAttemptRepository.findByJobIdIn(jobIds);

                long totalInterviews = interviews.size();

                // RECENT APPLICATIONS
                List<RecentRecruiterApplicationResponse> recentApplications = applications.stream()
                                .limit(5)
                                .map(this::convertRecentApplication)
                                .toList();

                // CREATE RESPONSE
                RecruiterDashboardResponse response = new RecruiterDashboardResponse();

                response.setTotalJobs(totalJobs);

                response.setActiveJobs(activeJobs);

                response.setTotalApplications(totalApplications);

                response.setTotalCandidates(totalCandidates);

                response.setTotalInterviews(totalInterviews);

                response.setSelectedCandidates(selectedCandidates);

                response.setRejectedCandidates(rejectedCandidates);

                response.setPendingApplications(pendingApplications);

                response.setRecentApplications(recentApplications);

                return response;
        }

        // CONVERT APPLICATION
        private RecentRecruiterApplicationResponse convertRecentApplication(JobApplication application) {

                RecentRecruiterApplicationResponse response = new RecentRecruiterApplicationResponse();

                response.setApplicationId(application.getId());

                response.setStatus(application.getStatus());

                response.setAppliedAt(application.getAppliedAt());

                // JOB
                Job job = application.getJob();
                if (job != null) {
                        response.setJobId(job.getId());

                        response.setJobTitle(job.getTitle());
                }

                // CANDIDATE
                User candidate = application.getCandidate();
                if (candidate != null) {
                        response.setCandidateId(candidate.getId());

                        response.setCandidateName(candidate.getName());

                        response.setCandidateEmail(candidate.getEmail());
                }
                return response;
        }
}