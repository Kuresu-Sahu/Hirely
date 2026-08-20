package com.hirely.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hirely.Entity.Job;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {
        // Search by job title
        List<Job> findByTitleContainingIgnoreCase(String title);

        // Search by location
        List<Job> findByLocationContainingIgnoreCase(String location);

        // Search by title + location
        List<Job> findByTitleContainingIgnoreCaseAndLocationContainingIgnoreCase(String title, String location);

        // Search by job type
        List<Job> findByJobTypeContainingIgnoreCase(String jobType);

        // Search by experience
        List<Job> findByExperienceContainingIgnoreCase(String experience);

        // Sort jobs by newest first
        List<Job> findAllByOrderByCreatedAtDesc();

        // Salary filters
        List<Job> findBySalaryMinGreaterThanEqual(Double salaryMin);

        List<Job> findBySalaryMaxLessThanEqual(Double salaryMax);

        // RECRUITER → MY JOBS
        List<Job> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
}