package com.hirely.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InterviewAnswerRequest {
    @NotNull
    private Long questionId;
    @NotBlank
    private String answer;

    public InterviewAnswerRequest() {
    }

    // GETTERS AND SETTERS
    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}