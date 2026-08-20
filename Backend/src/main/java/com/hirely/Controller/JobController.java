package com.hirely.Controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.JobRequest;
import com.hirely.Entity.Job;
import com.hirely.Service.JobService;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
// @CrossOrigin(origins = "http://localhost:5173")
public class JobController {
        private final JobService jobService;
        public JobController(JobService jobService) {
                this.jobService = jobService;
        }

        // CREATE JOB
        @PostMapping
        public ResponseEntity<?> createJob(
                @Valid @RequestBody JobRequest request,
                Authentication authentication
        ) {
                try {
                        Job job = jobService.createJob(
                                request,
                                authentication.getName()
                        );
                        return ResponseEntity.status(HttpStatus.CREATED).body(job);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // GET ALL / BASIC SEARCH
        @GetMapping
        public ResponseEntity<List<Job>> getJobs(
                @RequestParam(required = false) String keyword,
                @RequestParam(required = false) String location
        ) {
                return ResponseEntity.ok(jobService.searchJobs(keyword, location));
        }

        // RECRUITER → GET MY JOBS
        @GetMapping("/my")
        public ResponseEntity<?> getMyJobs(Authentication authentication) {
                try {
                        return ResponseEntity.ok(jobService.getMyJobs(authentication.getName()));
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // ADVANCED SEARCH
        @GetMapping("/search")
        public ResponseEntity<List<Job>> advancedSearch(
                @RequestParam(required = false) String keyword,
                @RequestParam(required = false) String location,
                @RequestParam(required = false) String jobType,
                @RequestParam(required = false) String experience,
                @RequestParam(required = false) Double minSalary,
                @RequestParam(required = false) Double maxSalary
        ) {
                return ResponseEntity.ok(
                        jobService.advancedSearch(keyword,location,jobType,experience,minSalary,maxSalary)
                );
        }

        // GET JOB BY ID
        @GetMapping("/{id}")
        public ResponseEntity<?> getJob(@PathVariable Long id) {
                try {
                        return ResponseEntity.ok(jobService.getJobById(id));
                } catch (RuntimeException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
                }
        }

        // UPDATE JOB
        @PutMapping("/{id}")
        public ResponseEntity<?> updateJob(
                @PathVariable Long id,
                @Valid @RequestBody JobRequest request,
                Authentication authentication
        ) {
                try {
                        Job job = jobService.updateJob(id,request,authentication.getName());
                        return ResponseEntity.ok(job);
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        // DELETE JOB
        @DeleteMapping("/{id}")
        public ResponseEntity<?> deleteJob(
                        @PathVariable Long id,
                        Authentication authentication) {
                try {
                        jobService.deleteJob(id, authentication.getName());
                        return ResponseEntity.ok("Job deleted successfully");
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }
}