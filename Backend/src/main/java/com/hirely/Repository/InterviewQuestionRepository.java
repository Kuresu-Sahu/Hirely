package com.hirely.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hirely.Entity.InterviewQuestion;

import java.util.List;

public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, Long> {
    // GET QUESTIONS FOR A JOB
    List<InterviewQuestion> findByJobId(Long jobId);

    // GET QUESTIONS BY JOB + CATEGORY
    List<InterviewQuestion> findByJobIdAndCategory(Long jobId, String category);

    // GET QUESTIONS BY JOB + TECHNOLOGY
    List<InterviewQuestion> findByJobIdAndTechnology(Long jobId, String technology);
}