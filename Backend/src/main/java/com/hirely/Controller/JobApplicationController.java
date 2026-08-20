package com.hirely.Controller;

import jakarta.validation.Valid;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hirely.Dto.ApplicationRequest;
import com.hirely.Dto.ApplicationResponse;
import com.hirely.Dto.ApplicationStatusRequest;
import com.hirely.Entity.Resume;
import com.hirely.Service.JobApplicationService;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {
        private final JobApplicationService applicationService;

        public JobApplicationController(JobApplicationService applicationService) {
                this.applicationService = applicationService;
        }

        // APPLY FOR JOB
        @PostMapping
        public ResponseEntity<?> applyForJob(
                @Valid @RequestBody ApplicationRequest request,
                Authentication authentication
        ) {
                try {
                        ApplicationResponse response = applicationService.applyForJob(
                                request,
                                authentication.getName()
                        );
                        return ResponseEntity.status(HttpStatus.CREATED).body(response);
                } catch (RuntimeException e) {
                        if ("You have already applied for this job".equals(e.getMessage())) {
                                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
                        }
                        throw e;
                }
        }

        // MY APPLICATIONS
        @GetMapping("/my")
        public ResponseEntity<?> getMyApplications(Authentication authentication) {
                List<ApplicationResponse> applications = applicationService.getMyApplications(authentication.getName());
                return ResponseEntity.ok(applications);
        }

        // GET MY APPLICATION BY ID
        @GetMapping("/{id}")
        public ResponseEntity<?> getMyApplication(@PathVariable Long id,Authentication authentication) {
                ApplicationResponse response = applicationService.getMyApplication(
                        id,
                        authentication.getName()
                );
                return ResponseEntity.ok(response);
        }

        // RECRUITER → VIEW APPLICANTS
        @GetMapping("/job/{jobId}")
        public ResponseEntity<?> getJobApplications(
                @PathVariable Long jobId,
                Authentication authentication
        ) {
                List<ApplicationResponse> applications = applicationService.getJobApplications(
                        jobId,
                        authentication.getName()
                );
                return ResponseEntity.ok(applications);
        }

        // RECRUITER → UPDATE STATUS
        @PutMapping("/{id}/status")
        public ResponseEntity<?> updateStatus(
                @PathVariable Long id,
                @Valid @RequestBody ApplicationStatusRequest request,
                Authentication authentication
        ) {
                ApplicationResponse response = applicationService.updateStatus(
                        id,
                        request.getStatus(),
                        authentication.getName()
                );

                return ResponseEntity.ok(response);
        }

        // RECRUITER → VIEW CANDIDATE RESUME
        @GetMapping("/{id}/resume")
        public ResponseEntity<?> viewCandidateResume(
                @PathVariable Long id,
                Authentication authentication
        ) {
                Resume resume = applicationService.getCandidateResume(
                        id,
                        authentication.getName()
                );
                if (resume.getFileData() == null || resume.getFileData().length == 0) {
                        throw new RuntimeException("Resume file is not available");
                }
                MediaType mediaType;
                try {
                        mediaType = MediaType.parseMediaType(resume.getFileType());
                } catch (Exception e) {
                        mediaType = MediaType.APPLICATION_PDF;
                }
                ContentDisposition contentDisposition = ContentDisposition.inline().filename(
                        resume.getFileName(),
                        StandardCharsets.UTF_8
                ).build();

                return ResponseEntity.ok().contentType(mediaType).header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        contentDisposition.toString()
                ).body(resume.getFileData());
        }

        // RECRUITER → DOWNLOAD CANDIDATE RESUME
        @GetMapping("/{id}/resume/download")
        public ResponseEntity<?> downloadCandidateResume(
                @PathVariable Long id,
                Authentication authentication
        ) {
                Resume resume = applicationService.getCandidateResume(
                        id,
                        authentication.getName()
                );
                if (resume.getFileData() == null || resume.getFileData().length == 0) {
                        throw new RuntimeException("Resume file is not available");
                }
                MediaType mediaType;
                try {
                        mediaType = MediaType.parseMediaType(resume.getFileType());
                } catch (Exception e) {
                        mediaType = MediaType.APPLICATION_PDF;
                }
                ContentDisposition contentDisposition = ContentDisposition.attachment().filename(
                        resume.getFileName(),
                        StandardCharsets.UTF_8
                ).build();
                return ResponseEntity.ok().contentType(mediaType).header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        contentDisposition.toString()
                ).body(resume.getFileData());
        }
}