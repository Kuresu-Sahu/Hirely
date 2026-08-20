package com.hirely.Dto;

import java.util.List;

public class AIResumeAnalysis {
    private Integer atsScore;
    private String overallFeedback;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> suggestions;
    private List<String> resumeImprovements;

    public AIResumeAnalysis() {
    }

    public Integer getAtsScore() {
        return atsScore;
    }

    public void setAtsScore(Integer atsScore) {
        this.atsScore = atsScore;
    }

    public String getOverallFeedback() {
        return overallFeedback;
    }

    public void setOverallFeedback(String overallFeedback) {
        this.overallFeedback = overallFeedback;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public List<String> getResumeImprovements() {
        return resumeImprovements;
    }

    public void setResumeImprovements(List<String> resumeImprovements) {
        this.resumeImprovements = resumeImprovements;
    }
}