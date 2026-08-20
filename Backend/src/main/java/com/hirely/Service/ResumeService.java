package com.hirely.Service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.hirely.Entity.Resume;
import com.hirely.Entity.User;
import com.hirely.Repository.ResumeRepository;
import com.hirely.Repository.UserRepository;

@Service
public class ResumeService {

        private final ResumeRepository resumeRepository;
        private final UserRepository userRepository;

        public ResumeService(
                        ResumeRepository resumeRepository,
                        UserRepository userRepository) {

                this.resumeRepository = resumeRepository;
                this.userRepository = userRepository;
        }

        // UPLOAD RESUME
        public Resume uploadResume(
                        MultipartFile file,
                        String candidateEmail) {

                // CHECK FILE
                if (file == null || file.isEmpty()) {
                        throw new RuntimeException("Please select a resume PDF file");
                }

                // CHECK FILE NAME
                String fileName = file.getOriginalFilename();
                if (fileName == null || fileName.isBlank()) {
                        throw new RuntimeException("Invalid file name");
                }

                // CHECK PDF EXTENSION
                if (!fileName.toLowerCase().endsWith(".pdf")) {
                        throw new RuntimeException("Only PDF files are allowed");
                }

                // FIND CANDIDATE
                User candidate = userRepository
                                .findByEmail(candidateEmail)
                                .orElseThrow(() -> new RuntimeException("Candidate not found"));

                // CHECK ROLE
                if (!"CANDIDATE".equals(candidate.getRole())) {
                        throw new RuntimeException("Only candidates can upload resumes");
                }

                // READ PDF
                try {
                        byte[] fileBytes = file.getBytes();

                        // LOAD PDF
                        PDDocument document = Loader.loadPDF(fileBytes);

                        // EXTRACT TEXT
                        PDFTextStripper pdfTextStripper = new PDFTextStripper();
                        String extractedText = pdfTextStripper.getText(document);
                        document.close();

                        // CHECK TEXT
                        if (extractedText == null || extractedText.isBlank()) {
                                throw new RuntimeException(
                                                "Could not extract text from this PDF. " +
                                                                "Please upload a text-based PDF.");
                        }

                        // FIND EXISTING RESUME
                        Resume resume = resumeRepository
                                        .findByCandidateId(candidate.getId())
                                        .orElse(new Resume());

                        // SAVE FILE INFORMATION
                        resume.setFileName(fileName);
                        resume.setFileType(file.getContentType() != null ? file.getContentType() : "application/pdf");

                        // SAVE ORIGINAL PDF
                        resume.setFileData(fileBytes);

                        // SAVE EXTRACTED TEXT
                        resume.setExtractedText(extractedText);

                        // CONNECT CANDIDATE
                        resume.setCandidate(candidate);

                        // SAVE DATABASE
                        return resumeRepository.save(resume);
                } catch (RuntimeException e) {
                        throw e;
                } catch (Exception e) {
                        throw new RuntimeException("Failed to process resume: " + e.getMessage());
                }
        }

        // GET MY RESUME
        public Resume getMyResume(String candidateEmail) {
                User candidate = userRepository
                                .findByEmail(candidateEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Candidate not found"));

                return resumeRepository
                                .findByCandidateId(candidate.getId())
                                .orElseThrow(() -> new RuntimeException("Resume not found"));
        }
}