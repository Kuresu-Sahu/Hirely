package com.hirely.Service;

import org.springframework.stereotype.Service;

import com.hirely.Dto.AIResumeAnalysis;
import com.hirely.Dto.ResumeAnalysisDetailResponse;
import com.hirely.Dto.ResumeAnalysisHistoryResponse;
import com.hirely.Dto.ResumeAnalysisResponse;
import com.hirely.Entity.Job;
import com.hirely.Entity.Resume;
import com.hirely.Entity.ResumeAnalysis;
import com.hirely.Entity.User;
import com.hirely.Repository.JobRepository;
import com.hirely.Repository.ResumeAnalysisRepository;
import com.hirely.Repository.ResumeRepository;
import com.hirely.Repository.UserRepository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class ResumeAnalysisService {


    private final ResumeRepository resumeRepository;

    private final ResumeAnalysisRepository analysisRepository;

    private final JobRepository jobRepository;

    private final UserRepository userRepository;

    private final OpenAIService openAIService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ResumeAnalysisService(
            ResumeRepository resumeRepository,
            ResumeAnalysisRepository analysisRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            OpenAIService openAIService) {

        this.resumeRepository =
                resumeRepository;

        this.analysisRepository =
                analysisRepository;

        this.jobRepository =
                jobRepository;

        this.userRepository =
                userRepository;

        this.openAIService =
                openAIService;
    }


    // =========================================================
    // ANALYZE RESUME AGAINST JOB
    // =========================================================

    public ResumeAnalysisResponse analyzeResume(
            Long jobId,
            String candidateEmail) {


        // -----------------------------------------------------
        // FIND CANDIDATE
        // -----------------------------------------------------

        User candidate =
                userRepository
                        .findByEmail(
                                candidateEmail
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );


        // -----------------------------------------------------
        // CHECK ROLE
        // -----------------------------------------------------

        if (
                !"CANDIDATE".equals(
                        candidate.getRole()
                )
        ) {

            throw new RuntimeException(
                    "Only candidates can analyze resumes"
            );
        }


        // -----------------------------------------------------
        // FIND RESUME
        // -----------------------------------------------------

        Resume resume =
                resumeRepository
                        .findByCandidateId(
                                candidate.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Please upload your resume first"
                                )
                        );


        // -----------------------------------------------------
        // CHECK RESUME TEXT
        // -----------------------------------------------------

        if (
                resume.getExtractedText() == null
                        ||
                resume.getExtractedText()
                        .isBlank()
        ) {

            throw new RuntimeException(
                    "Resume text could not be extracted"
            );
        }


        // -----------------------------------------------------
        // FIND JOB
        // -----------------------------------------------------

        Job job =
                jobRepository
                        .findById(
                                jobId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );


        // -----------------------------------------------------
        // RUN THE SAME ATS ENGINE
        // -----------------------------------------------------

        AIResumeAnalysis result =
                openAIService.analyzeResume(

                        resume.getExtractedText(),

                        job.getTitle(),

                        job.getDescription()
                );


        // -----------------------------------------------------
        // CREATE DATABASE RECORD
        // -----------------------------------------------------

        ResumeAnalysis analysis =
                new ResumeAnalysis();


        analysis.setAtsScore(
                result.getAtsScore()
        );


        analysis.setMatchedKeywords(
                convertListToText(
                        result.getMatchedSkills()
                )
        );


        analysis.setMissingKeywords(
                convertListToText(
                        result.getMissingSkills()
                )
        );


        analysis.setStrengths(
                convertListToText(
                        result.getStrengths()
                )
        );


        analysis.setSuggestions(
                combineSuggestions(
                        result
                )
        );


        analysis.setResume(
                resume
        );


        analysis.setJob(
                job
        );


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        analysisRepository.save(
                analysis
        );


        // -----------------------------------------------------
        // CREATE RESPONSE
        // -----------------------------------------------------

        ResumeAnalysisResponse response =
                new ResumeAnalysisResponse();


        response.setAnalysisId(
                analysis.getId()
        );


        response.setAtsScore(
                result.getAtsScore()
        );


        response.setJobTitle(
                job.getTitle()
        );


        response.setMatchedKeywords(
                safeList(
                        result.getMatchedSkills()
                )
        );


        response.setMissingKeywords(
                safeList(
                        result.getMissingSkills()
                )
        );


        response.setStrengths(
                safeList(
                        result.getStrengths()
                )
        );


        response.setSuggestions(
                combineSuggestionList(
                        result
                )
        );


        return response;
    }


    // =========================================================
    // GET ANALYSIS HISTORY
    // =========================================================

    public List<ResumeAnalysisHistoryResponse>
    getAnalysisHistory(
            String candidateEmail) {


        // -----------------------------------------------------
        // FIND CANDIDATE
        // -----------------------------------------------------

        User candidate =
                userRepository
                        .findByEmail(
                                candidateEmail
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );


        // -----------------------------------------------------
        // CHECK ROLE
        // -----------------------------------------------------

        if (
                !"CANDIDATE".equals(
                        candidate.getRole()
                )
        ) {

            throw new RuntimeException(
                    "Only candidates can view analysis history"
            );
        }


        // -----------------------------------------------------
        // FIND RESUME
        // -----------------------------------------------------

        Resume resume =
                resumeRepository
                        .findByCandidateId(
                                candidate.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Please upload your resume first"
                                )
                        );


        // -----------------------------------------------------
        // GET ANALYSES
        // -----------------------------------------------------

        List<ResumeAnalysis> analyses =
                analysisRepository
                        .findByResumeIdOrderByAnalyzedAtDesc(
                                resume.getId()
                        );


        // -----------------------------------------------------
        // CONVERT
        // -----------------------------------------------------

        return analyses.stream()
                .map(
                        this::convertToHistoryResponse
                )
                .collect(
                        Collectors.toList()
                );
    }


    // =========================================================
    // GET LATEST ANALYSIS
    // =========================================================

    public ResumeAnalysisDetailResponse
    getLatestAnalysis(
            String candidateEmail) {


        // -----------------------------------------------------
        // FIND CANDIDATE
        // -----------------------------------------------------

        User candidate =
                userRepository
                        .findByEmail(
                                candidateEmail
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );


        // -----------------------------------------------------
        // CHECK ROLE
        // -----------------------------------------------------

        if (
                !"CANDIDATE".equals(
                        candidate.getRole()
                )
        ) {

            throw new RuntimeException(
                    "Only candidates can view analysis"
            );
        }


        // -----------------------------------------------------
        // FIND RESUME
        // -----------------------------------------------------

        Resume resume =
                resumeRepository
                        .findByCandidateId(
                                candidate.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Please upload your resume first"
                                )
                        );


        // -----------------------------------------------------
        // FIND LATEST ANALYSIS
        // -----------------------------------------------------

        ResumeAnalysis analysis =
                analysisRepository
                        .findFirstByResumeIdOrderByAnalyzedAtDesc(
                                resume.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No resume analysis found"
                                )
                        );


        return convertToDetailResponse(
                analysis
        );
    }


    // =========================================================
    // GET ANALYSIS BY ID
    // =========================================================

    public ResumeAnalysisDetailResponse
    getAnalysisById(
            Long analysisId,
            String candidateEmail) {


        // -----------------------------------------------------
        // FIND CANDIDATE
        // -----------------------------------------------------

        User candidate =
                userRepository
                        .findByEmail(
                                candidateEmail
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );


        // -----------------------------------------------------
        // CHECK ROLE
        // -----------------------------------------------------

        if (
                !"CANDIDATE".equals(
                        candidate.getRole()
                )
        ) {

            throw new RuntimeException(
                    "Only candidates can view analysis"
            );
        }


        // -----------------------------------------------------
        // FIND ANALYSIS
        // -----------------------------------------------------

        ResumeAnalysis analysis =
                analysisRepository
                        .findByIdAndResumeCandidateId(
                                analysisId,
                                candidate.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Analysis not found"
                                )
                        );


        return convertToDetailResponse(
                analysis
        );
    }


    // =========================================================
    // CONVERT LIST TO DATABASE TEXT
    // =========================================================

    private String convertListToText(
            List<String> values) {


        if (
                values == null
                        ||
                values.isEmpty()
        ) {

            return "";
        }


        StringBuilder result =
                new StringBuilder();


        for (
                String item :
                values
        ) {


            if (
                    item == null
            ) {

                continue;
            }


            String cleaned =
                    item.trim();


            if (
                    cleaned.isBlank()
            ) {

                continue;
            }


            if (
                    result.length() > 0
            ) {

                result.append(
                        ", "
                );
            }


            result.append(
                    cleaned
            );
        }


        return result.toString();
    }


    // =========================================================
    // COMBINE SUGGESTIONS FOR DATABASE
    // =========================================================

    private String combineSuggestions(
            AIResumeAnalysis result) {


        List<String> values =
                new ArrayList<>();


        if (
                result.getSuggestions() != null
        ) {

            values.addAll(
                    result.getSuggestions()
            );
        }


        if (
                result.getResumeImprovements() != null
        ) {

            values.addAll(
                    result.getResumeImprovements()
            );
        }


        StringBuilder combined =
                new StringBuilder();


        for (
                String item :
                values
        ) {


            if (
                    item == null
            ) {

                continue;
            }


            String cleaned =
                    item.trim();


            if (
                    cleaned.isBlank()
            ) {

                continue;
            }


            if (
                    combined.length() > 0
            ) {

                combined.append(
                        " ||| "
                );
            }


            combined.append(
                    cleaned
            );
        }


        return combined.toString();
    }


    // =========================================================
    // COMBINE SUGGESTIONS FOR API RESPONSE
    // =========================================================

    private List<String> combineSuggestionList(
            AIResumeAnalysis result) {


        List<String> values =
                new ArrayList<>();


        if (
                result.getSuggestions() != null
        ) {

            values.addAll(
                    result.getSuggestions()
            );
        }


        if (
                result.getResumeImprovements() != null
        ) {

            values.addAll(
                    result.getResumeImprovements()
            );
        }


        List<String> cleanedValues =
                new ArrayList<>();


        for (
                String item :
                values
        ) {


            if (
                    item == null
            ) {

                continue;
            }


            String cleaned =
                    item.trim();


            if (
                    cleaned.isBlank()
            ) {

                continue;
            }


            if (
                    !cleanedValues.contains(
                            cleaned
                    )
            ) {

                cleanedValues.add(
                        cleaned
                );
            }
        }


        return cleanedValues;
    }


    // =========================================================
    // SAFE LIST
    // =========================================================

    private List<String> safeList(
            List<String> values) {


        if (
                values == null
        ) {

            return new ArrayList<>();
        }


        List<String> result =
                new ArrayList<>();


        for (
                String item :
                values
        ) {


            if (
                    item == null
            ) {

                continue;
            }


            String cleaned =
                    item.trim();


            if (
                    cleaned.isBlank()
            ) {

                continue;
            }


            if (
                    !result.contains(
                            cleaned
                    )
            ) {

                result.add(
                        cleaned
                );
            }
        }


        return result;
    }


    // =========================================================
    // HISTORY RESPONSE
    // =========================================================

    private ResumeAnalysisHistoryResponse
    convertToHistoryResponse(
            ResumeAnalysis analysis) {


        ResumeAnalysisHistoryResponse response =
                new ResumeAnalysisHistoryResponse();


        response.setAnalysisId(
                analysis.getId()
        );


        if (
                analysis.getJob() != null
        ) {

            response.setJobId(
                    analysis.getJob().getId()
            );


            response.setJobTitle(
                    analysis.getJob().getTitle()
            );
        }


        response.setAtsScore(
                analysis.getAtsScore()
        );


        response.setAnalyzedAt(
                analysis.getAnalyzedAt()
        );


        return response;
    }


    // =========================================================
    // DETAIL RESPONSE
    // =========================================================

    private ResumeAnalysisDetailResponse
    convertToDetailResponse(
            ResumeAnalysis analysis) {


        ResumeAnalysisDetailResponse response =
                new ResumeAnalysisDetailResponse();


        response.setAnalysisId(
                analysis.getId()
        );


        if (
                analysis.getJob() != null
        ) {

            response.setJobId(
                    analysis.getJob().getId()
            );


            response.setJobTitle(
                    analysis.getJob().getTitle()
            );
        }


        response.setAtsScore(
                analysis.getAtsScore()
        );


        response.setMatchedKeywords(
                splitCommaSeparated(
                        analysis.getMatchedKeywords()
                )
        );


        response.setMissingKeywords(
                splitCommaSeparated(
                        analysis.getMissingKeywords()
                )
        );


        response.setStrengths(
                splitCommaSeparated(
                        analysis.getStrengths()
                )
        );


        response.setSuggestions(
                splitPipeSeparated(
                        analysis.getSuggestions()
                )
        );


        response.setAnalyzedAt(
                analysis.getAnalyzedAt()
        );


        return response;
    }


    // =========================================================
    // SPLIT COMMA SEPARATED VALUES
    // =========================================================

    private List<String> splitCommaSeparated(
            String value) {


        if (
                value == null
                        ||
                value.isBlank()
        ) {

            return new ArrayList<>();
        }


        String[] parts =
                value.split(
                        ","
                );


        List<String> result =
                new ArrayList<>();


        for (
                String part :
                parts
        ) {


            if (
                    part == null
            ) {

                continue;
            }


            String cleaned =
                    part.trim();


            if (
                    cleaned.isBlank()
            ) {

                continue;
            }


            result.add(
                    cleaned
            );
        }


        return result;
    }


    // =========================================================
    // SPLIT ||| SEPARATED VALUES
    // =========================================================

    private List<String> splitPipeSeparated(
            String value) {


        if (
                value == null
                        ||
                value.isBlank()
        ) {

            return new ArrayList<>();
        }


        String[] parts =
                value.split(
                        "\\|\\|\\|"
                );


        List<String> result =
                new ArrayList<>();


        for (
                String part :
                parts
        ) {


            if (
                    part == null
            ) {

                continue;
            }


            String cleaned =
                    part.trim();


            if (
                    cleaned.isBlank()
            ) {

                continue;
            }


            result.add(
                    cleaned
            );
        }


        return result;
    }
}