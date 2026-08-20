package com.hirely.Service;

import org.springframework.stereotype.Service;

import com.hirely.Dto.ApplicationRequest;
import com.hirely.Dto.ApplicationResponse;
import com.hirely.Entity.ApplicationStatus;
import com.hirely.Entity.Job;
import com.hirely.Entity.JobApplication;
import com.hirely.Entity.Resume;
import com.hirely.Entity.User;
import com.hirely.Repository.JobApplicationRepository;
import com.hirely.Repository.JobRepository;
import com.hirely.Repository.ResumeRepository;
import com.hirely.Repository.UserRepository;

import java.util.List;

@Service
public class JobApplicationService {

        private final JobApplicationRepository applicationRepository;

        private final JobRepository jobRepository;

        private final UserRepository userRepository;

        private final ResumeRepository resumeRepository;

        private final NotificationService notificationService;

        public JobApplicationService(
                JobApplicationRepository applicationRepository,
                JobRepository jobRepository,
                UserRepository userRepository,
                ResumeRepository resumeRepository,
                NotificationService notificationService
        ) {
                this.applicationRepository = applicationRepository;

                this.jobRepository = jobRepository;

                this.userRepository = userRepository;

                this.resumeRepository = resumeRepository;

                this.notificationService = notificationService;
        }

        // APPLY FOR JOB
        public ApplicationResponse applyForJob(ApplicationRequest request, String candidateEmail
        ) {
                // FIND CANDIDATE
                User candidate = userRepository
                        .findByEmail(candidateEmail)
                        .orElseThrow(() -> new RuntimeException("Candidate not found"));

                // CHECK ROLE
                if (!"CANDIDATE".equals(candidate.getRole())) {
                        throw new RuntimeException("Only candidates can apply for jobs");
                }

                // CHECK RESUME
                resumeRepository.findByCandidateId(candidate.getId())
                                .orElseThrow(() -> new RuntimeException("Please upload your resume before applying for a job"));

                // FIND JOB
                Job job = jobRepository.findById(request.getJobId())
                                .orElseThrow(() -> new RuntimeException("Job not found"));

                // CHECK DUPLICATE APPLICATION
                if (applicationRepository.existsByJobIdAndCandidateId(job.getId(),candidate.getId())) {
                        throw new RuntimeException("You have already applied for this job");
                }

                // CREATE APPLICATION
                JobApplication application = new JobApplication();

                application.setJob(job);

                application.setCandidate(candidate);

                application.setCoverLetter(request.getCoverLetter());

                application.setStatus(ApplicationStatus.APPLIED);

                // SAVE APPLICATION
                JobApplication saved = applicationRepository.save(application);

                // CANDIDATE NOTIFICATION
                notificationService.createNotification(
                                candidate,

                                "Application Submitted",

                                "Your application for "
                                                + job.getTitle()
                                                + " has been submitted successfully.",

                                "APPLICATION",

                                "/my-applications");

                // RECRUITER NOTIFICATION
                if (job.getCompany() != null) {
                        userRepository.findByCompany_Id(job.getCompany().getId())
                                        .ifPresent(recruiter -> {

                                                notificationService.createNotification(

                                                                recruiter,

                                                                "New Job Application",

                                                                candidate.getName()
                                                                                + " has applied for "
                                                                                + job.getTitle()
                                                                                + ".",

                                                                "NEW_APPLICATION",

                                                                "/recruiter/jobs/"
                                                                                + job.getId()
                                                                                + "/applicants");

                                        });
                }

                return convertToResponse(saved,true);
        }

        // GET MY APPLICATIONS
        public List<ApplicationResponse> getMyApplications(String candidateEmail) {
                User candidate = userRepository
                                .findByEmail(candidateEmail)
                                .orElseThrow(() -> new RuntimeException("Candidate not found"));

                if (!"CANDIDATE".equals(candidate.getRole())) {
                        throw new RuntimeException("Only candidates can view their applications");
                }

                List<JobApplication> applications = applicationRepository
                                .findByCandidateIdOrderByAppliedAtDesc(candidate.getId());

                return applications
                                .stream()
                                .map(application -> convertToResponse(application,true))
                                .toList();
        }

        // GET MY APPLICATION BY ID
        public ApplicationResponse getMyApplication(
                        Long applicationId,
                        String candidateEmail) {

                User candidate = userRepository
                                .findByEmail(candidateEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Candidate not found"));

                JobApplication application = applicationRepository
                                .findByIdAndCandidateId(
                                                applicationId,
                                                candidate.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Application not found"));

                return convertToResponse(
                                application,
                                true);
        }

        // GET APPLICATIONS FOR RECRUITER'S JOB
        public List<ApplicationResponse> getJobApplications(
                        Long jobId,
                        String recruiterEmail) {

                User recruiter = userRepository
                                .findByEmail(recruiterEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Recruiter not found"));

                if (!"RECRUITER".equals(
                                recruiter.getRole())) {

                        throw new RuntimeException(
                                        "Only recruiters can view applicants");
                }

                Job job = jobRepository
                                .findById(jobId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Job not found"));

                if (job.getCompany() == null ||
                                recruiter.getCompany() == null ||
                                !job.getCompany()
                                                .getId()
                                                .equals(
                                                                recruiter.getCompany().getId())) {

                        throw new RuntimeException(
                                        "You are not allowed to view applicants for this job");
                }

                List<JobApplication> applications = applicationRepository
                                .findByJobIdOrderByAppliedAtDesc(
                                                jobId);

                return applications
                                .stream()
                                .map(application -> convertToResponse(
                                                application,
                                                true))
                                .toList();
        }

        // UPDATE APPLICATION STATUS
        public ApplicationResponse updateStatus(
                        Long applicationId,
                        ApplicationStatus status,
                        String recruiterEmail) {

                User recruiter = userRepository
                                .findByEmail(recruiterEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Recruiter not found"));

                if (!"RECRUITER".equals(recruiter.getRole())) {
                        throw new RuntimeException(
                                        "Only recruiters can update application status");
                }

                JobApplication application = applicationRepository
                                .findById(applicationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Application not found"));

                Job job = application.getJob();

                if (job == null || job.getCompany() == null ||
                                recruiter.getCompany() == null ||
                                !job.getCompany()
                                        .getId()
                                        .equals(recruiter.getCompany().getId())) {

                        throw new RuntimeException("You are not allowed to update this application");
                }

                ApplicationStatus oldStatus = application.getStatus();

                application.setStatus(status);

                JobApplication saved = applicationRepository.save(
                                application);

                // CANDIDATE STATUS NOTIFICATION
                User candidate = application.getCandidate();

                if (candidate != null &&
                                status != null &&
                                status != oldStatus) {

                        String title;

                        String message;

                        String type;

                        switch (status) {

                                case SHORTLISTED:

                                        title = "Application Shortlisted";

                                        message = "Your application for "
                                                        + job.getTitle()
                                                        + " has been shortlisted.";

                                        type = "SHORTLISTED";

                                        break;

                                case INTERVIEW:

                                        title = "Interview Stage";

                                        message = "Your application for "
                                                        + job.getTitle()
                                                        + " has moved to the interview stage.";

                                        type = "INTERVIEW";

                                        break;

                                case SELECTED:

                                        title = "Congratulations!";

                                        message = "You have been selected for "
                                                        + job.getTitle()
                                                        + ".";

                                        type = "SELECTED";

                                        break;

                                case REJECTED:

                                        title = "Application Update";

                                        message = "Your application for "
                                                        + job.getTitle()
                                                        + " has been rejected.";

                                        type = "REJECTED";

                                        break;

                                default:

                                        title = "Application Status Updated";

                                        message = "Your application for "
                                                        + job.getTitle()
                                                        + " is now "
                                                        + status
                                                        + ".";

                                        type = "APPLICATION";
                        }

                        notificationService.createNotification(

                                        candidate,

                                        title,

                                        message,

                                        type,

                                        "/my-applications");
                }

                return convertToResponse(
                                saved,
                                true);
        }

        // RECRUITER → VIEW CANDIDATE RESUME
        public Resume getCandidateResume(
                        Long applicationId,
                        String recruiterEmail) {

                User recruiter = userRepository
                                .findByEmail(recruiterEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Recruiter not found"));

                if (!"RECRUITER".equals(
                                recruiter.getRole())) {

                        throw new RuntimeException(
                                        "Only recruiters can view candidate resumes");
                }

                if (recruiter.getCompany() == null) {

                        throw new RuntimeException(
                                        "Recruiter does not have a company");
                }

                JobApplication application = applicationRepository
                                .findById(applicationId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Application not found"));

                Job job = application.getJob();

                if (job == null) {

                        throw new RuntimeException(
                                        "Job not found for this application");
                }

                if (job.getCompany() == null ||
                                !job.getCompany()
                                                .getId()
                                                .equals(
                                                                recruiter.getCompany().getId())) {

                        throw new RuntimeException(
                                        "You are not allowed to view this resume");
                }

                User candidate = application.getCandidate();

                if (candidate == null) {

                        throw new RuntimeException(
                                        "Candidate not found");
                }

                return resumeRepository
                                .findByCandidateId(
                                                candidate.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Candidate has not uploaded a resume"));
        }

        // CONVERT ENTITY → DTO
        private ApplicationResponse convertToResponse(
                        JobApplication application,
                        boolean includeCandidate) {

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

                if (includeCandidate &&candidate != null) {

                        response.setCandidateId(candidate.getId());

                        response.setCandidateName(candidate.getName());

                        response.setCandidateEmail(candidate.getEmail());

                        response.setResumeAvailable(resumeRepository.findByCandidateId(candidate.getId()).isPresent());
                }

                return response;
        }
}