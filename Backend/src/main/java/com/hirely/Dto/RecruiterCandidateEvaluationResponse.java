package com.hirely.Dto;

public class RecruiterCandidateEvaluationResponse {
    private ApplicationResponse application;
    private ResumeAnalysisDetailResponse resumeAnalysis;
    private RecruiterInterviewResponse interview;

    public RecruiterCandidateEvaluationResponse() {
    }

    // APPLICATION
    public ApplicationResponse getApplication() {
        return application;
    }

    public void setApplication(ApplicationResponse application) {
        this.application = application;
    }

    // RESUME ANALYSIS
    public ResumeAnalysisDetailResponse getResumeAnalysis() {
        return resumeAnalysis;
    }

    public void setResumeAnalysis(ResumeAnalysisDetailResponse resumeAnalysis) {
        this.resumeAnalysis = resumeAnalysis;
    }

    // INTERVIEW
    public RecruiterInterviewResponse getInterview() {
        return interview;
    }

    public void setInterview(RecruiterInterviewResponse interview) {
        this.interview = interview;
    }
}