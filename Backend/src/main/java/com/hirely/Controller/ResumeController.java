package com.hirely.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.hirely.Entity.Resume;
import com.hirely.Service.ResumeService;

@RestController
@RequestMapping("/api/resumes")
// @CrossOrigin(origins = "http://localhost:5173")
public class ResumeController {
    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
        @RequestParam("file") MultipartFile file,
        Authentication authentication
    ) {
        try {
            Resume resume = resumeService.uploadResume(
                file,
                authentication.getName()
            );
            return ResponseEntity.ok(resume);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyResume(
            Authentication authentication) {
        try {
            return ResponseEntity.ok(resumeService.getMyResume(authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}