package com.hirely.Service;

import org.springframework.stereotype.Service;

import com.hirely.Dto.JobRequest;
import com.hirely.Entity.Job;
import com.hirely.Entity.User;
import com.hirely.Repository.JobRepository;
import com.hirely.Repository.UserRepository;

import java.util.Comparator;
import java.util.List;

@Service
public class JobService {
        private final JobRepository jobRepository;
        private final UserRepository userRepository;

        public JobService(
                JobRepository jobRepository,
                UserRepository userRepository
        ) {
                this.jobRepository = jobRepository;
                this.userRepository = userRepository;
        }

        // CREATE JOB
        public Job createJob(
                JobRequest request,
                String recruiterEmail
        ) {
                User recruiter = userRepository
                                .findByEmail(recruiterEmail)
                                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

                // Check recruiter role
                if (!"RECRUITER".equals(recruiter.getRole())) {
                        throw new RuntimeException("Only recruiters can create jobs");
                }

                // Check company
                if (recruiter.getCompany() == null) {
                        throw new RuntimeException("Please create a company before posting a job");
                }

                Job job = new Job();

                job.setTitle(request.getTitle());
                job.setDescription(request.getDescription());
                job.setLocation(request.getLocation());
                job.setJobType(request.getJobType());
                job.setExperience(request.getExperience());
                job.setSalaryMin(request.getSalaryMin());
                job.setSalaryMax(request.getSalaryMax());

                // Automatically connect job to recruiter's company
                job.setCompany(recruiter.getCompany());

                return jobRepository.save(job);
        }

        // GET ALL JOBS
        public List<Job> getAllJobs() {
                return jobRepository.findAllByOrderByCreatedAtDesc();
        }

        // GET RECRUITER'S JOBS
        public List<Job> getMyJobs(String recruiterEmail) {
                // FIND RECRUITER
                User recruiter = userRepository
                                .findByEmail(recruiterEmail)
                                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

                // CHECK ROLE
                if (!"RECRUITER".equals(recruiter.getRole())) {
                        throw new RuntimeException("Only recruiters can view their jobs");
                }

                // CHECK COMPANY
                if (recruiter.getCompany() == null) {
                        throw new RuntimeException("You have not created a company yet");
                }

                // GET COMPANY JOBS
                return jobRepository.findByCompanyIdOrderByCreatedAtDesc(recruiter.getCompany().getId());
        }

        // GET JOB BY ID
        public Job getJobById(Long id) {
                return jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
        }

        // UPDATE JOB
        public Job updateJob(
                        Long id,
                        JobRequest request,
                        String recruiterEmail
                ) {

                Job job = getJobById(id);

                User recruiter = userRepository
                                .findByEmail(recruiterEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Recruiter not found"));

                // Check whether recruiter owns this job
                if (job.getCompany() == null ||
                                recruiter.getCompany() == null ||
                                !job.getCompany().getId()
                                                .equals(recruiter.getCompany().getId())) {

                        throw new RuntimeException(
                                        "You are not allowed to update this job");
                }

                job.setTitle(request.getTitle());
                job.setDescription(request.getDescription());
                job.setLocation(request.getLocation());
                job.setJobType(request.getJobType());
                job.setExperience(request.getExperience());
                job.setSalaryMin(request.getSalaryMin());
                job.setSalaryMax(request.getSalaryMax());

                return jobRepository.save(job);
        }

        // DELETE JOB
        public void deleteJob(
                        Long id,
                        String recruiterEmail) {

                Job job = getJobById(id);

                User recruiter = userRepository
                                .findByEmail(recruiterEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Recruiter not found"));

                // Check ownership
                if (job.getCompany() == null ||
                                recruiter.getCompany() == null ||
                                !job.getCompany().getId()
                                                .equals(recruiter.getCompany().getId())) {

                        throw new RuntimeException(
                                        "You are not allowed to delete this job");
                }

                jobRepository.delete(job);
        }

        // SEARCH JOBS
        public List<Job> searchJobs(
                        String keyword,
                        String location) {

                boolean hasKeyword = keyword != null &&!keyword.isBlank();

                boolean hasLocation = location != null &&!location.isBlank();

                // Keyword + Location
                if (hasKeyword && hasLocation) {

                        return jobRepository.findByTitleContainingIgnoreCaseAndLocationContainingIgnoreCase(keyword,location);
                }

                // Keyword only
                if (hasKeyword) {
                        return jobRepository.findByTitleContainingIgnoreCase(keyword);
                }

                // Location only
                if (hasLocation) {
                        return jobRepository.findByLocationContainingIgnoreCase(location);
                }

                // No filters
                return jobRepository.findAllByOrderByCreatedAtDesc();
        }

        // ADVANCED JOB SEARCH
        public List<Job> advancedSearch(
                        String keyword,
                        String location,
                        String jobType,
                        String experience,
                        Double minSalary,
                        Double maxSalary) {

                // Start with all jobs
                List<Job> jobs = jobRepository.findAll();

                // KEYWORD FILTER
                if (keyword != null && !keyword.isBlank()) {
                        String searchKeyword = keyword.toLowerCase().trim();
                        jobs = jobs.stream()
                                        .filter(job -> job.getTitle()
                                                        .toLowerCase()
                                                        .contains(searchKeyword)
                                                        ||
                                                        job.getDescription()
                                                                        .toLowerCase()
                                                                        .contains(searchKeyword))
                                        .toList();
                }

                // LOCATION FILTER
                if (location != null && !location.isBlank()) {

                        String searchLocation = location.toLowerCase().trim();

                        jobs = jobs.stream().filter(job -> job.getLocation()
                                        .toLowerCase()
                                        .contains(searchLocation))
                                        .toList();
                }

                // JOB TYPE FILTER
                if (jobType != null && !jobType.isBlank()) {

                        String searchJobType = jobType.toLowerCase().trim();

                        jobs = jobs.stream()
                                        .filter(job -> job.getJobType() != null &&job.getJobType()
                                        .toLowerCase()
                                        .contains(searchJobType))
                                        .toList();
                }

                // EXPERIENCE FILTER
                if (experience != null && !experience.isBlank()) {

                        String searchExperience = experience.toLowerCase().trim();

                        jobs = jobs.stream()
                                        .filter(job -> job.getExperience() != null && job.getExperience()
                                        .toLowerCase()
                                        .contains(searchExperience))
                                        .toList();
                }

                // MINIMUM SALARY FILTER
                if (minSalary != null) {
                        jobs = jobs.stream()
                                .filter(job -> job.getSalaryMax() != null &&job.getSalaryMax() >= minSalary)
                                .toList();
                }

                // MAXIMUM SALARY FILTER
                if (maxSalary != null) {
                        jobs = jobs.stream()
                                        .filter(job -> job.getSalaryMin() != null &&
                                        job.getSalaryMin() <= maxSalary)
                                        .toList();
                }

                // NEWEST JOBS FIRST
                jobs = jobs.stream()
                                .sorted(Comparator.comparing(
                                        Job::getCreatedAt,
                                        Comparator.nullsLast(
                                        Comparator.reverseOrder())))
                                .toList();

                return jobs;
        }
}