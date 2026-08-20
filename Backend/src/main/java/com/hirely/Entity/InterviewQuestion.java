package com.hirely.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions")
public class InterviewQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Question belongs to a particular job.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    // TECHNICAL or HR
    @Column(nullable = false)
    private String category;

    // The actual interview question.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    /*
     * Expected answer / guidance.
     * This is used by our simple answer
     * evaluation system later.
     */
    @Column(columnDefinition = "TEXT")
    private String expectedAnswer;

    /*
     * Difficulty:
     * EASY
     * MEDIUM
     * HARD
     */
    @Column(nullable = false)
    private String difficulty;

    /*
     * Technology related to the question.
     *
     * Examples:
     * Java
     * Spring Boot
     * MySQL
     * React
     * HR
     */
    private String technology;

    private LocalDateTime createdAt;

    public InterviewQuestion() {
    }

    // CREATED DATE
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // GETTERS AND SETTERS
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getExpectedAnswer() {
        return expectedAnswer;
    }

    public void setExpectedAnswer(String expectedAnswer) {
        this.expectedAnswer = expectedAnswer;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getTechnology() {
        return technology;
    }

    public void setTechnology(String technology) {
        this.technology = technology;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}