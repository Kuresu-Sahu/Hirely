package com.hirely.Dto;

import com.hirely.Entity.ApplicationStatus;

import jakarta.validation.constraints.NotNull;

public class ApplicationStatusRequest {
    @NotNull(message = "Status is required")
    private ApplicationStatus status;
    
    public ApplicationStatusRequest() {
    }

    public ApplicationStatusRequest(ApplicationStatus status) {
        this.status = status;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }
}