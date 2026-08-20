package com.hirely.Dto;

import java.util.List;

public class RecruiterDashboardResponse {
    private long totalJobs;
    private long activeJobs;
    private long totalApplications;
    private long totalCandidates;
    private long totalInterviews;
    private long selectedCandidates;
    private long rejectedCandidates;
    private long pendingApplications;
    private List<RecentRecruiterApplicationResponse> recentApplications;

    public RecruiterDashboardResponse() {
    }

    // GETTERS AND SETTERS
    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getActiveJobs() {
        return activeJobs;
    }

    public void setActiveJobs(long activeJobs) {
        this.activeJobs = activeJobs;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getTotalCandidates() {
        return totalCandidates;
    }

    public void setTotalCandidates(long totalCandidates) {
        this.totalCandidates = totalCandidates;
    }

    public long getTotalInterviews() {
        return totalInterviews;
    }

    public void setTotalInterviews(long totalInterviews) {
        this.totalInterviews = totalInterviews;
    }

    public long getSelectedCandidates() {
        return selectedCandidates;
    }

    public void setSelectedCandidates(long selectedCandidates) {
        this.selectedCandidates = selectedCandidates;
    }

    public long getRejectedCandidates() {
        return rejectedCandidates;
    }

    public void setRejectedCandidates(long rejectedCandidates) {
        this.rejectedCandidates = rejectedCandidates;
    }

    public long getPendingApplications() {
        return pendingApplications;
    }

    public void setPendingApplications(long pendingApplications) {
        this.pendingApplications = pendingApplications;
    }

    public List<RecentRecruiterApplicationResponse> getRecentApplications() {
        return recentApplications;
    }

    public void setRecentApplications(List<RecentRecruiterApplicationResponse> recentApplications) {
        this.recentApplications = recentApplications;
    }
}