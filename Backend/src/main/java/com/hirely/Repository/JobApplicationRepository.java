package com.hirely.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hirely.Entity.JobApplication;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
        // CHECK DUPLICATE APPLICATION
        boolean existsByJobIdAndCandidateId(Long jobId, Long candidateId);

        // CANDIDATE APPLICATIONS
        List<JobApplication> findByCandidateIdOrderByAppliedAtDesc(Long candidateId);

        // JOB APPLICATIONS
        List<JobApplication> findByJobIdOrderByAppliedAtDesc(Long jobId);

        // APPLICATIONS FOR MULTIPLE JOBS
        // USED BY RECRUITER DASHBOARD
        List<JobApplication> findByJobIdInOrderByAppliedAtDesc(List<Long> jobIds);

        // FIND CANDIDATE APPLICATION BY ID
        Optional<JobApplication> findByIdAndCandidateId(Long id, Long candidateId);

        // FIND APPLICATION BY JOB
        Optional<JobApplication> findByIdAndJobId(Long applicationId, Long jobId);

        // ==========================================
        // FIND APPLICATION BY JOB + CANDIDATE
        //
        // USED TO VERIFY THAT A CANDIDATE HAS
        // ACTUALLY APPLIED FOR A JOB BEFORE
        // SUBMITTING AN AI INTERVIEW.
        // ==========================================
        Optional<JobApplication> findByJobIdAndCandidateId(Long jobId, Long candidateId);
}