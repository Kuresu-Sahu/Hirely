package com.hirely.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hirely.Entity.InterviewAttempt;

import java.util.List;
import java.util.Optional;

public interface InterviewAttemptRepository extends JpaRepository<InterviewAttempt, Long> {
        // CANDIDATE HISTORY
        List<InterviewAttempt> findByCandidateIdOrderByCompletedAtDesc(Long candidateId);

        // FIND SPECIFIC CANDIDATE ATTEMPT
        Optional<InterviewAttempt> findByIdAndCandidateId(Long id, Long candidateId);

        // RECRUITER
        // GET LATEST INTERVIEW FOR CANDIDATE + JOB
        Optional<InterviewAttempt> findTopByCandidateIdAndJobIdOrderByCompletedAtDesc(Long candidateId, Long jobId);

        // RECRUITER DASHBOARD
        // GET INTERVIEWS FOR MULTIPLE JOBS
        List<InterviewAttempt> findByJobIdIn(List<Long> jobIds);
}