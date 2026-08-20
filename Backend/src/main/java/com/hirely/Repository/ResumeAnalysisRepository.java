package com.hirely.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hirely.Entity.ResumeAnalysis;

import java.util.List;
import java.util.Optional;

public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {
        // ALL ANALYSES FOR A RESUME
        List<ResumeAnalysis> findByResumeIdOrderByAnalyzedAtDesc(Long resumeId);

        // ALL ANALYSES FOR A JOB
        List<ResumeAnalysis> findByJobIdOrderByAnalyzedAtDesc(Long jobId);

        // FIND ANALYSIS BY ID FOR CANDIDATE
        Optional<ResumeAnalysis> findByIdAndResumeCandidateId(Long id, Long candidateId);

        // LATEST ANALYSIS FOR RESUME
        Optional<ResumeAnalysis> findFirstByResumeIdOrderByAnalyzedAtDesc(Long resumeId);

        // LATEST ANALYSIS FOR RESUME + JOB
        Optional<ResumeAnalysis> findFirstByResumeIdAndJobIdOrderByAnalyzedAtDesc(Long resumeId, Long jobId);
}