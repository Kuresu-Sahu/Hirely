package com.hirely.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.hirely.Dto.AIResumeAnalysis;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class OpenAIService {


    // =========================================================
    // OPENAI CONFIGURATION
    // =========================================================

    private static final String OPENAI_API_URL =
            "https://api.openai.com/v1/responses";


    private static final String DEFAULT_MODEL =
            "gpt-5.6";


    private static final int MAX_RESUME_CHARACTERS =
            12000;


    private static final int MAX_JOB_CHARACTERS =
            8000;


    // =========================================================
    // HTTP CLIENT
    // =========================================================

    private final HttpClient httpClient;


    // =========================================================
    // JSON MAPPER
    // =========================================================

    private final ObjectMapper objectMapper;


    // =========================================================
    // OPENAI SETTINGS
    // =========================================================

    private final String openAiApiKey;


    private final String openAiModel;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public OpenAIService(
            ObjectMapper objectMapper) {


        this.objectMapper =
                objectMapper;


        this.httpClient =
                HttpClient.newBuilder()

                        .connectTimeout(
                                Duration.ofSeconds(20)
                        )

                        .build();


        this.openAiApiKey =
                getEnvironmentVariable(
                        "OPENAI_API_KEY"
                );


        String configuredModel =
                getEnvironmentVariable(
                        "OPENAI_MODEL"
                );


        if (
                configuredModel == null
                        ||
                configuredModel.isBlank()
        ) {

            this.openAiModel =
                    DEFAULT_MODEL;

        } else {

            this.openAiModel =
                    configuredModel.trim();
        }


        // -----------------------------------------------------
        // STARTUP MESSAGE
        // -----------------------------------------------------

        if (
                isOpenAIConfigured()
        ) {

            System.out.println(
                    "================================================="
            );

            System.out.println(
                    "OpenAI integration: CONFIGURED"
            );

            System.out.println(
                    "OpenAI model: "
                            +
                    openAiModel
            );

            System.out.println(
                    "================================================="
            );

        } else {

            System.out.println(
                    "================================================="
            );

            System.out.println(
                    "OpenAI integration: NOT CONFIGURED"
            );

            System.out.println(
                    "Using deterministic ATS analysis."
            );

            System.out.println(
                    "The application will continue working normally."
            );

            System.out.println(
                    "================================================="
            );
        }
    }


    // =========================================================
    // MAIN ANALYSIS METHOD
    // =========================================================

    public AIResumeAnalysis analyzeResume(
            String resumeText,
            String jobTitle,
            String jobDescription) {


        if (
                resumeText == null
        ) {

            resumeText = "";
        }


        if (
                jobTitle == null
        ) {

            jobTitle = "";
        }


        if (
                jobDescription == null
        ) {

            jobDescription = "";
        }


        // =====================================================
        // STEP 1
        // RUN LOCAL ATS
        // =====================================================

        AIResumeAnalysis atsResult =
                runDeterministicATS(
                        resumeText,
                        jobTitle,
                        jobDescription
                );


        // =====================================================
        // STEP 2
        // CHECK OPENAI
        // =====================================================

        if (
                !isOpenAIConfigured()
        ) {

            return atsResult;
        }


        // =====================================================
        // STEP 3
        // TRY OPENAI
        // =====================================================

        try {

            AIResumeAnalysis aiResult =
                    analyzeWithOpenAI(
                            resumeText,
                            jobTitle,
                            jobDescription,
                            atsResult
                    );


            mergeAIResult(
                    atsResult,
                    aiResult
            );


        } catch (
                Exception exception
        ) {


            /*
             * IMPORTANT:
             *
             * OpenAI failure must NEVER make the resume
             * analyzer unavailable.
             *
             * We keep the deterministic ATS result.
             */

            System.err.println(
                    "================================================="
            );


            System.err.println(
                    "OpenAI analysis unavailable."
            );


            System.err.println(
                    "Reason: "
                            +
                    getSafeErrorMessage(
                            exception
                    )
            );


            System.err.println(
                    "Using deterministic ATS result instead."
            );


            System.err.println(
                    "================================================="
            );
        }


        return atsResult;
    }


    // =========================================================
    // DETERMINISTIC ATS
    // =========================================================

    private AIResumeAnalysis runDeterministicATS(
            String resumeText,
            String jobTitle,
            String jobDescription) {


        String normalizedResume =
                normalizeText(
                        resumeText
                );


        String normalizedJob =
                normalizeText(
                        jobTitle
                                + " "
                                + jobDescription
                );


        // -----------------------------------------------------
        // FIND JOB SKILLS
        // -----------------------------------------------------

        List<String> requiredSkills =
                findSkills(
                        normalizedJob
                );


        // -----------------------------------------------------
        // FIND RESUME SKILLS
        // -----------------------------------------------------

        List<String> resumeSkills =
                findSkills(
                        normalizedResume
                );


        // -----------------------------------------------------
        // MATCHED SKILLS
        // -----------------------------------------------------

        List<String> matchedSkills =
                requiredSkills.stream()

                        .filter(
                                resumeSkills::contains
                        )

                        .collect(
                                Collectors.toList()
                        );


        // -----------------------------------------------------
        // MISSING SKILLS
        // -----------------------------------------------------

        List<String> missingSkills =
                requiredSkills.stream()

                        .filter(
                                skill ->
                                        !resumeSkills.contains(
                                                skill
                                        )
                        )

                        .collect(
                                Collectors.toList()
                        );


        // -----------------------------------------------------
        // SCORE
        // -----------------------------------------------------

        int skillScore =
                calculateSkillScore(
                        requiredSkills,
                        matchedSkills
                );


        int keywordScore =
                calculateKeywordScore(
                        normalizedResume,
                        jobTitle,
                        jobDescription
                );


        int structureScore =
                calculateStructureScore(
                        normalizedResume
                );


        int achievementScore =
                calculateAchievementScore(
                        normalizedResume
                );


        int contentDepthScore =
                calculateContentDepthScore(
                        resumeText
                );


        int atsScore =
                calculateWeightedScore(
                        skillScore,
                        keywordScore,
                        structureScore,
                        achievementScore,
                        contentDepthScore
                );


        // -----------------------------------------------------
        // CREATE RESULT
        // -----------------------------------------------------

        AIResumeAnalysis result =
                new AIResumeAnalysis();


        result.setAtsScore(
                atsScore
        );


        result.setOverallFeedback(
                generateOverallFeedback(
                        atsScore,
                        missingSkills.size()
                )
        );


        result.setStrengths(
                generateStrengths(
                        normalizedResume,
                        matchedSkills,
                        skillScore,
                        structureScore,
                        achievementScore
                )
        );


        result.setWeaknesses(
                generateWeaknesses(
                        normalizedResume,
                        missingSkills,
                        structureScore,
                        achievementScore,
                        contentDepthScore
                )
        );


        result.setMatchedSkills(
                matchedSkills
        );


        result.setMissingSkills(
                missingSkills
        );


        result.setSuggestions(
                generateSuggestions(
                        missingSkills,
                        atsScore,
                        structureScore,
                        achievementScore
                )
        );


        result.setResumeImprovements(
                generateResumeImprovements(
                        normalizedResume,
                        missingSkills,
                        achievementScore
                )
        );


        return result;
    }


    // =========================================================
    // OPENAI ANALYSIS
    // =========================================================

    private AIResumeAnalysis analyzeWithOpenAI(
            String resumeText,
            String jobTitle,
            String jobDescription,
            AIResumeAnalysis atsResult)
            throws IOException, InterruptedException {


        String safeResume =
                truncate(
                        resumeText,
                        MAX_RESUME_CHARACTERS
                );


        String safeJob =
                truncate(
                        jobTitle
                                +
                        "\n\n"
                                +
                        jobDescription,
                        MAX_JOB_CHARACTERS
                );


        String prompt =
                buildPrompt(
                        safeResume,
                        safeJob,
                        atsResult
                );


        // =====================================================
        // REQUEST BODY
        // =====================================================

        ObjectNode requestBody =
                objectMapper.createObjectNode();


        requestBody.put(
                "model",
                openAiModel
        );


        requestBody.put(
                "store",
                false
        );


        requestBody.put(
                "input",
                prompt
        );


        // =====================================================
        // STRUCTURED OUTPUT
        // =====================================================

        ObjectNode textNode =
                requestBody.putObject(
                        "text"
                );


        ObjectNode formatNode =
                textNode.putObject(
                        "format"
                );


        formatNode.put(
                "type",
                "json_schema"
        );


        formatNode.put(
                "name",
                "resume_analysis"
        );


        formatNode.put(
                "strict",
                true
        );


        formatNode.set(
                "schema",
                createResponseSchema()
        );


        // =====================================================
        // CONVERT TO JSON
        // =====================================================

        String requestJson =
                objectMapper.writeValueAsString(
                        requestBody
                );


        // =====================================================
        // HTTP REQUEST
        // =====================================================

        HttpRequest request =
                HttpRequest.newBuilder()

                        .uri(
                                URI.create(
                                        OPENAI_API_URL
                                )
                        )

                        .timeout(
                                Duration.ofSeconds(90)
                        )

                        .header(
                                "Authorization",
                                "Bearer "
                                        +
                                openAiApiKey
                        )

                        .header(
                                "Content-Type",
                                "application/json"
                        )

                        .POST(
                                HttpRequest.BodyPublishers
                                        .ofString(
                                                requestJson
                                        )
                        )

                        .build();


        // =====================================================
        // SEND REQUEST
        // =====================================================

        HttpResponse<String> response =
                httpClient.send(
                        request,
                        HttpResponse.BodyHandlers
                                .ofString()
                );


        // =====================================================
        // CHECK STATUS
        // =====================================================

        if (
                response.statusCode() < 200
                        ||
                response.statusCode() >= 300
        ) {

            throw new RuntimeException(
                    "OpenAI API returned HTTP "
                            +
                    response.statusCode()
                            +
                    ": "
                            +
                    sanitizeError(
                            response.body()
                    )
            );
        }


        // =====================================================
        // PARSE RESPONSE
        // =====================================================

        JsonNode responseJson =
                objectMapper.readTree(
                        response.body()
                );


        String outputText =
                extractOutputText(
                        responseJson
                );


        if (
                outputText == null
                        ||
                outputText.isBlank()
        ) {

            throw new RuntimeException(
                    "OpenAI returned an empty response"
            );
        }


        return parseAIResult(
                outputText
        );
    }


    // =========================================================
    // OPENAI PROMPT
    // =========================================================

    private String buildPrompt(
            String resumeText,
            String jobInformation,
            AIResumeAnalysis atsResult) {


        String matchedSkills =
                joinList(
                        atsResult.getMatchedSkills()
                );


        String missingSkills =
                joinList(
                        atsResult.getMissingSkills()
                );


        return """
                You are an expert technical recruiter and resume
                reviewer.

                Analyze the candidate resume against the target job.

                IMPORTANT RULES:

                1. Use only information present in the resume.
                2. Never invent experience.
                3. Never claim the candidate has a skill that is not
                   supported by the resume.
                4. Do not recommend falsely adding skills.
                5. Give specific and practical recommendations.
                6. Focus on the target job.
                7. Do not change the ATS score.
                8. Keep responses concise.
                9. Return only the requested JSON structure.

                TARGET JOB:

                %s


                CANDIDATE RESUME:

                %s


                EXISTING ATS SCORE:

                %d


                MATCHED SKILLS:

                %s


                DETECTED MISSING SKILLS:

                %s


                Provide:

                - overall feedback
                - strongest aspects of the resume
                - weaknesses
                - missing or weak skills
                - useful suggestions
                - specific resume improvements

                A missing skill should only be recommended for addition
                when the candidate actually has relevant experience.
                Otherwise, recommend learning or gaining experience
                with that skill instead.

                """.formatted(

                jobInformation,

                resumeText,

                atsResult.getAtsScore(),

                matchedSkills,

                missingSkills
        );
    }


    // =========================================================
    // RESPONSE JSON SCHEMA
    // =========================================================

    private ObjectNode createResponseSchema() {


        ObjectNode schema =
                objectMapper.createObjectNode();


        schema.put(
                "type",
                "object"
        );


        ObjectNode properties =
                schema.putObject(
                        "properties"
                );


        // -----------------------------------------------------
        // OVERALL FEEDBACK
        // -----------------------------------------------------

        ObjectNode overallFeedback =
                properties.putObject(
                        "overallFeedback"
                );


        overallFeedback.put(
                "type",
                "string"
        );


        // -----------------------------------------------------
        // STRENGTHS
        // -----------------------------------------------------

        properties.set(
                "strengths",
                createStringArraySchema()
        );


        // -----------------------------------------------------
        // WEAKNESSES
        // -----------------------------------------------------

        properties.set(
                "weaknesses",
                createStringArraySchema()
        );


        // -----------------------------------------------------
        // MISSING SKILLS
        // -----------------------------------------------------

        properties.set(
                "missingSkills",
                createStringArraySchema()
        );


        // -----------------------------------------------------
        // SUGGESTIONS
        // -----------------------------------------------------

        properties.set(
                "suggestions",
                createStringArraySchema()
        );


        // -----------------------------------------------------
        // RESUME IMPROVEMENTS
        // -----------------------------------------------------

        properties.set(
                "resumeImprovements",
                createStringArraySchema()
        );


        // -----------------------------------------------------
        // REQUIRED
        // -----------------------------------------------------

        ArrayNode required =
                schema.putArray(
                        "required"
                );


        required.add(
                "overallFeedback"
        );


        required.add(
                "strengths"
        );


        required.add(
                "weaknesses"
        );


        required.add(
                "missingSkills"
        );


        required.add(
                "suggestions"
        );


        required.add(
                "resumeImprovements"
        );


        schema.put(
                "additionalProperties",
                false
        );


        return schema;
    }


    // =========================================================
    // STRING ARRAY SCHEMA
    // =========================================================

    private ObjectNode createStringArraySchema() {


        ObjectNode node =
                objectMapper.createObjectNode();


        node.put(
                "type",
                "array"
        );


        ObjectNode items =
                node.putObject(
                        "items"
                );


        items.put(
                "type",
                "string"
        );


        return node;
    }


    // =========================================================
    // EXTRACT OPENAI OUTPUT
    // =========================================================

    private String extractOutputText(
            JsonNode responseJson) {


        JsonNode output =
                responseJson.get(
                        "output"
                );


        if (
                output == null
                        ||
                !output.isArray()
        ) {

            return null;
        }


        for (
                JsonNode outputItem :
                output
        ) {


            JsonNode content =
                    outputItem.get(
                            "content"
                    );


            if (
                    content == null
                            ||
                    !content.isArray()
            ) {

                continue;
            }


            for (
                    JsonNode contentItem :
                    content
            ) {


                String type =
                        contentItem
                                .path(
                                        "type"
                                )
                                .asText();


                if (
                        "output_text".equals(
                                type
                        )
                ) {


                    String text =
                            contentItem
                                    .path(
                                            "text"
                                    )
                                    .asText();


                    if (
                            text != null
                                    &&
                            !text.isBlank()
                    ) {

                        return text;
                    }
                }
            }
        }


        return null;
    }


    // =========================================================
    // PARSE AI RESULT
    // =========================================================

    private AIResumeAnalysis parseAIResult(
            String json)
            throws IOException {


        JsonNode root =
                objectMapper.readTree(
                        json
                );


        AIResumeAnalysis result =
                new AIResumeAnalysis();


        result.setOverallFeedback(
                root.path(
                        "overallFeedback"
                ).asText(
                        "AI analysis completed."
                )
        );


        result.setStrengths(
                readStringArray(
                        root,
                        "strengths"
                )
        );


        result.setWeaknesses(
                readStringArray(
                        root,
                        "weaknesses"
                )
        );


        result.setMissingSkills(
                readStringArray(
                        root,
                        "missingSkills"
                )
        );


        result.setSuggestions(
                readStringArray(
                        root,
                        "suggestions"
                )
        );


        result.setResumeImprovements(
                readStringArray(
                        root,
                        "resumeImprovements"
                )
        );


        return result;
    }


    // =========================================================
    // READ JSON ARRAY
    // =========================================================

    private List<String> readStringArray(
            JsonNode root,
            String fieldName) {


        JsonNode node =
                root.get(
                        fieldName
                );


        if (
                node == null
                        ||
                !node.isArray()
        ) {

            return new ArrayList<>();
        }


        List<String> result =
                new ArrayList<>();


        for (
                JsonNode item :
                node
        ) {


            if (
                    item == null
                            ||
                    !item.isTextual()
            ) {

                continue;
            }


            String value =
                    item.asText()
                            .trim();


            if (
                    !value.isBlank()
            ) {

                result.add(
                        value
                );
            }
        }


        return limitList(
                result,
                8
        );
    }


    // =========================================================
    // MERGE AI RESULT
    // =========================================================

    private void mergeAIResult(
            AIResumeAnalysis atsResult,
            AIResumeAnalysis aiResult) {


        if (
                aiResult == null
        ) {

            return;
        }


        // -----------------------------------------------------
        // KEEP ATS SCORE
        // -----------------------------------------------------

        /*
         * The numerical ATS score ALWAYS comes from the local
         * deterministic engine.
         *
         * OpenAI does not modify it.
         */


        // -----------------------------------------------------
        // OVERALL FEEDBACK
        // -----------------------------------------------------

        if (
                aiResult.getOverallFeedback() != null
                        &&
                !aiResult.getOverallFeedback()
                        .isBlank()
        ) {

            atsResult.setOverallFeedback(
                    aiResult.getOverallFeedback()
            );
        }


        // -----------------------------------------------------
        // STRENGTHS
        // -----------------------------------------------------

        if (
                aiResult.getStrengths() != null
                        &&
                !aiResult.getStrengths().isEmpty()
        ) {

            atsResult.setStrengths(
                    aiResult.getStrengths()
            );
        }


        // -----------------------------------------------------
        // WEAKNESSES
        // -----------------------------------------------------

        if (
                aiResult.getWeaknesses() != null
                        &&
                !aiResult.getWeaknesses().isEmpty()
        ) {

            atsResult.setWeaknesses(
                    aiResult.getWeaknesses()
            );
        }


        // -----------------------------------------------------
        // MISSING SKILLS
        // -----------------------------------------------------

        List<String> combinedMissingSkills =
                new ArrayList<>();


        if (
                atsResult.getMissingSkills()
                        != null
        ) {

            combinedMissingSkills.addAll(
                    atsResult.getMissingSkills()
            );
        }


        if (
                aiResult.getMissingSkills()
                        != null
        ) {

            combinedMissingSkills.addAll(
                    aiResult.getMissingSkills()
            );
        }


        atsResult.setMissingSkills(
                uniqueList(
                        combinedMissingSkills
                )
        );


        // -----------------------------------------------------
        // SUGGESTIONS
        // -----------------------------------------------------

        if (
                aiResult.getSuggestions() != null
                        &&
                !aiResult.getSuggestions().isEmpty()
        ) {

            atsResult.setSuggestions(
                    aiResult.getSuggestions()
            );
        }


        // -----------------------------------------------------
        // RESUME IMPROVEMENTS
        // -----------------------------------------------------

        if (
                aiResult.getResumeImprovements() != null
                        &&
                !aiResult.getResumeImprovements().isEmpty()
        ) {

            atsResult.setResumeImprovements(
                    aiResult.getResumeImprovements()
            );
        }
    }


    // =========================================================
    // CHECK OPENAI CONFIGURATION
    // =========================================================

    private boolean isOpenAIConfigured() {


        if (
                openAiApiKey == null
                        ||
                openAiApiKey.isBlank()
        ) {

            return false;
        }


        if (
                "YOUR_OPENAI_API_KEY"
                        .equalsIgnoreCase(
                                openAiApiKey
                        )
        ) {

            return false;
        }


        return true;
    }


    // =========================================================
    // READ ENVIRONMENT VARIABLE
    // =========================================================

    private String getEnvironmentVariable(
            String name) {


        String value =
                System.getenv(
                        name
                );


        if (
                value == null
                        ||
                value.isBlank()
        ) {

            value =
                    System.getProperty(
                            name
                    );
        }


        return value;
    }


    // =========================================================
    // TRUNCATE TEXT
    // =========================================================

    private String truncate(
            String text,
            int maxLength) {


        if (
                text == null
        ) {

            return "";
        }


        if (
                text.length()
                        <=
                maxLength
        ) {

            return text;
        }


        return text.substring(
                0,
                maxLength
        )
                +
                "\n\n[Content truncated]";
    }


    // =========================================================
    // SAFE ERROR MESSAGE
    // =========================================================

    private String getSafeErrorMessage(
            Exception exception) {


        if (
                exception == null
        ) {

            return "Unknown error";
        }


        String message =
                exception.getMessage();


        if (
                message == null
                        ||
                message.isBlank()
        ) {

            return exception
                    .getClass()
                    .getSimpleName();
        }


        return sanitizeError(
                message
        );
    }


    // =========================================================
    // SANITIZE API ERROR
    // =========================================================

    private String sanitizeError(
            String error) {


        if (
                error == null
                        ||
                error.isBlank()
        ) {

            return "No error details available";
        }


        String cleaned =
                error
                        .replaceAll(
                                "\\s+",
                                " "
                        )
                        .trim();


        if (
                cleaned.length() > 1000
        ) {

            return cleaned.substring(
                    0,
                    1000
            );
        }


        return cleaned;
    }


    // =========================================================
    // JOIN LIST
    // =========================================================

    private String joinList(
            List<String> values) {


        if (
                values == null
                        ||
                values.isEmpty()
        ) {

            return "None detected";
        }


        return String.join(
                ", ",
                values
        );
    }


    // =========================================================
    // UNIQUE LIST
    // =========================================================

    private List<String> uniqueList(
            List<String> values) {


        if (
                values == null
        ) {

            return new ArrayList<>();
        }


        LinkedHashSet<String> unique =
                new LinkedHashSet<>();


        for (
                String value :
                values
        ) {


            if (
                    value == null
            ) {

                continue;
            }


            String cleaned =
                    value.trim();


            if (
                    !cleaned.isBlank()
            ) {

                unique.add(
                        cleaned
                );
            }
        }


        return limitList(
                new ArrayList<>(
                        unique
                ),
                8
        );
    }


    // =========================================================
    // FIND SKILLS
    // =========================================================

    private List<String> findSkills(
            String normalizedText) {


        LinkedHashSet<String> found =
                new LinkedHashSet<>();


        for (
                SkillDefinition skill :
                SKILLS
        ) {


            if (
                    containsSkill(
                            normalizedText,
                            skill
                    )
            ) {

                found.add(
                        skill.name()
                );
            }
        }


        if (
                found.contains(
                        "Spring Boot"
                )
        ) {

            found.remove(
                    "Spring"
            );
        }


        if (
                found.contains(
                        "DSA"
                )
        ) {

            found.remove(
                    "Data Structures"
            );


            found.remove(
                    "Algorithms"
            );
        }


        return new ArrayList<>(
                found
        );
    }


    // =========================================================
    // CHECK SKILL
    // =========================================================

    private boolean containsSkill(
            String text,
            SkillDefinition skill) {


        for (
                String alias :
                skill.aliases()
        ) {


            String normalizedAlias =
                    normalizeText(
                            alias
                    );


            if (
                    normalizedAlias.isBlank()
            ) {

                continue;
            }


            if (
                    normalizedAlias.length()
                            <=
                    3
            ) {


                Pattern pattern =
                        Pattern.compile(
                                "(?<![a-z0-9])"
                                        +
                                Pattern.quote(
                                        normalizedAlias
                                )
                                        +
                                "(?![a-z0-9])"
                        );


                if (
                        pattern
                                .matcher(
                                        text
                                )
                                .find()
                ) {

                    return true;
                }


            } else if (
                    text.contains(
                            normalizedAlias
                    )
            ) {

                return true;
            }
        }


        return false;
    }


    // =========================================================
    // SKILL SCORE
    // =========================================================

    private int calculateSkillScore(
            List<String> requiredSkills,
            List<String> matchedSkills) {


        if (
                requiredSkills.isEmpty()
        ) {

            return 70;
        }


        double score =
                (
                        (double)
                                matchedSkills.size()
                                /
                                requiredSkills.size()
                )
                        *
                        100;


        return clamp(
                (int)
                        Math.round(
                                score
                        ),
                0,
                100
        );
    }


    // =========================================================
    // KEYWORD SCORE
    // =========================================================

    private int calculateKeywordScore(
            String resumeText,
            String jobTitle,
            String jobDescription) {


        List<String> keywords =
                extractImportantKeywords(
                        jobTitle
                                +
                        " "
                                +
                        jobDescription
                );


        if (
                keywords.isEmpty()
        ) {

            return 70;
        }


        int matched =
                0;


        for (
                String keyword :
                keywords
        ) {


            if (
                    containsKeyword(
                            resumeText,
                            keyword
                    )
            ) {

                matched++;
            }
        }


        double score =
                (
                        (double)
                                matched
                                /
                                keywords.size()
                )
                        *
                        100;


        return clamp(
                (int)
                        Math.round(
                                score
                        ),
                0,
                100
        );
    }


    // =========================================================
    // IMPORTANT KEYWORDS
    // =========================================================

    private List<String> extractImportantKeywords(
            String text) {


        if (
                text == null
                        ||
                text.isBlank()
        ) {

            return Collections.emptyList();
        }


        String cleaned =
                normalizeText(
                        text
                );


        String[] words =
                cleaned.split(
                        "\\s+"
                );


        LinkedHashSet<String> keywords =
                new LinkedHashSet<>();


        for (
                String word :
                words
        ) {


            if (
                    word.length() < 3
            ) {

                continue;
            }


            if (
                    STOP_WORDS.contains(
                            word
                    )
            ) {

                continue;
            }


            if (
                    word.matches(
                            "\\d+"
                    )
            ) {

                continue;
            }


            keywords.add(
                    word
            );
        }


        return new ArrayList<>(
                keywords
        )
                .stream()
                .limit(60)
                .collect(
                        Collectors.toList()
                );
    }


    // =========================================================
    // STRUCTURE SCORE
    // =========================================================

    private int calculateStructureScore(
            String resumeText) {


        int score =
                0;


        if (
                containsSection(
                        resumeText,
                        "skills"
                )
        ) {

            score += 20;
        }


        if (
                containsSection(
                        resumeText,
                        "experience"
                )
        ) {

            score += 20;
        }


        if (
                containsSection(
                        resumeText,
                        "education"
                )
        ) {

            score += 20;
        }


        if (
                containsSection(
                        resumeText,
                        "projects"
                )
        ) {

            score += 15;
        }


        if (
                containsSection(
                        resumeText,
                        "summary"
                )
                        ||
                containsSection(
                        resumeText,
                        "objective"
                )
        ) {

            score += 10;
        }


        if (
                containsSection(
                        resumeText,
                        "certifications"
                )
        ) {

            score += 5;
        }


        if (
                containsSection(
                        resumeText,
                        "achievements"
                )
        ) {

            score += 5;
        }


        if (
                resumeText.contains(
                        "linkedin"
                )
        ) {

            score += 2;
        }


        if (
                resumeText.contains(
                        "github"
                )
        ) {

            score += 3;
        }


        return clamp(
                score,
                0,
                100
        );
    }


    // =========================================================
    // ACHIEVEMENT SCORE
    // =========================================================

    private int calculateAchievementScore(
            String resumeText) {


        int score =
                40;


        String[] indicators = {

                "increased",
                "improved",
                "reduced",
                "optimized",
                "achieved",
                "generated",
                "saved",
                "automated",
                "scaled",
                "accelerated",
                "delivered",
                "led",
                "managed",
                "built",
                "developed",
                "implemented"
        };


        int count =
                0;


        for (
                String indicator :
                indicators
        ) {


            if (
                    resumeText.contains(
                            indicator
                    )
            ) {

                count++;
            }
        }


        score +=
                Math.min(
                        30,
                        count * 3
                );


        int numberCount =
                countNumbers(
                        resumeText
                );


        score +=
                Math.min(
                        10,
                        numberCount
                )
                        *
                        2;


        if (
                resumeText.contains(
                        "%"
                )
                        ||
                resumeText.contains(
                        "₹"
                )
                        ||
                resumeText.contains(
                        "$"
                )
        ) {

            score += 10;
        }


        return clamp(
                score,
                0,
                100
        );
    }


    // =========================================================
    // COUNT NUMBERS
    // =========================================================

    private int countNumbers(
            String text) {


        java.util.regex.Matcher matcher =
                Pattern.compile(
                        "\\b\\d+(?:\\.\\d+)?%?\\b"
                )
                .matcher(
                        text
                );


        int count =
                0;


        while (
                matcher.find()
        ) {

            count++;
        }


        return count;
    }


    // =========================================================
    // CONTENT DEPTH
    // =========================================================

    private int calculateContentDepthScore(
            String resumeText) {


        String trimmed =
                resumeText.trim();


        int wordCount =
                trimmed.isEmpty()
                        ?
                        0
                        :
                        trimmed.split(
                                "\\s+"
                        ).length;


        if (
                wordCount < 100
        ) {

            return 25;
        }


        if (
                wordCount < 200
        ) {

            return 45;
        }


        if (
                wordCount < 300
        ) {

            return 60;
        }


        if (
                wordCount < 450
        ) {

            return 75;
        }


        if (
                wordCount <= 900
        ) {

            return 90;
        }


        return 80;
    }


    // =========================================================
    // WEIGHTED ATS SCORE
    // =========================================================

    private int calculateWeightedScore(
            int skillScore,
            int keywordScore,
            int structureScore,
            int achievementScore,
            int contentDepthScore) {


        double score =

                skillScore * 0.45

                        +

                keywordScore * 0.20

                        +

                structureScore * 0.15

                        +

                achievementScore * 0.10

                        +

                contentDepthScore * 0.10;


        return clamp(
                (int)
                        Math.round(
                                score
                        ),
                0,
                100
        );
    }


    // =========================================================
    // OVERALL FEEDBACK
    // =========================================================

    private String generateOverallFeedback(
            int atsScore,
            int missingSkillCount) {


        if (
                atsScore >= 85
        ) {

            return
                    "Your resume is a strong match for this job.";
        }


        if (
                atsScore >= 70
        ) {

            return
                    "Your resume is a good match for this job, but it can be improved"
                            +
                    (
                            missingSkillCount > 0
                                    ?
                                    " by addressing relevant missing skills."
                                    :
                                    "."
                    );
        }


        if (
                atsScore >= 50
        ) {

            return
                    "Your resume has a moderate match with this job. "
                            +
                    "Tailor the resume more closely to the job description.";
        }


        return
                "Your resume currently has a low match with this job. "
                        +
                "Create a more job-specific version of your resume.";
    }


    // =========================================================
    // STRENGTHS
    // =========================================================

    private List<String> generateStrengths(
            String resumeText,
            List<String> matchedSkills,
            int skillScore,
            int structureScore,
            int achievementScore) {


        List<String> strengths =
                new ArrayList<>();


        if (
                !matchedSkills.isEmpty()
        ) {

            strengths.add(
                    "Your resume matches "
                            +
                    matchedSkills.size()
                            +
                    " job-relevant technical skill(s)."
            );
        }


        if (
                skillScore >= 80
        ) {

            strengths.add(
                    "Strong technical skill alignment with the target job."
            );
        }


        if (
                structureScore >= 80
        ) {

            strengths.add(
                    "Good ATS-friendly resume structure."
            );
        }


        if (
                achievementScore >= 70
        ) {

            strengths.add(
                    "The resume contains action-oriented or measurable achievements."
            );
        }


        if (
                resumeText.contains(
                        "github"
                )
        ) {

            strengths.add(
                    "GitHub profile or project reference detected."
            );
        }


        if (
                resumeText.contains(
                        "linkedin"
                )
        ) {

            strengths.add(
                    "LinkedIn profile reference detected."
            );
        }


        if (
                strengths.isEmpty()
        ) {

            strengths.add(
                    "Relevant resume content was detected."
            );
        }


        return limitList(
                strengths,
                6
        );
    }


    // =========================================================
    // WEAKNESSES
    // =========================================================

    private List<String> generateWeaknesses(
            String resumeText,
            List<String> missingSkills,
            int structureScore,
            int achievementScore,
            int contentDepthScore) {


        List<String> weaknesses =
                new ArrayList<>();


        if (
                !missingSkills.isEmpty()
        ) {

            weaknesses.add(
                    "Some job-relevant skills are missing from the resume."
            );
        }


        if (
                structureScore < 70
        ) {

            weaknesses.add(
                    "Some standard resume sections are missing or difficult to detect."
            );
        }


        if (
                achievementScore < 60
        ) {

            weaknesses.add(
                    "There is limited evidence of measurable achievements."
            );
        }


        if (
                contentDepthScore < 60
        ) {

            weaknesses.add(
                    "The extracted resume content is relatively short."
            );
        }


        if (
                !resumeText.contains(
                        "github"
                )
                        &&
                !resumeText.contains(
                        "linkedin"
                )
        ) {

            weaknesses.add(
                    "No GitHub or LinkedIn profile reference was detected."
            );
        }


        if (
                weaknesses.isEmpty()
        ) {

            weaknesses.add(
                    "No major ATS weaknesses were detected."
            );
        }


        return limitList(
                weaknesses,
                6
        );
    }


    // =========================================================
    // SUGGESTIONS
    // =========================================================

    private List<String> generateSuggestions(
            List<String> missingSkills,
            int atsScore,
            int structureScore,
            int achievementScore) {


        List<String> suggestions =
                new ArrayList<>();


        if (
                !missingSkills.isEmpty()
        ) {

            suggestions.add(
                    "Add a missing skill only when you genuinely have experience with it."
            );
        }


        if (
                structureScore < 80
        ) {

            suggestions.add(
                    "Clearly separate Skills, Experience, Projects and Education."
            );
        }


        if (
                achievementScore < 70
        ) {

            suggestions.add(
                    "Add measurable outcomes to project and experience bullets."
            );
        }


        if (
                atsScore < 70
        ) {

            suggestions.add(
                    "Create a job-specific version of your resume."
            );
        }


        suggestions.add(
                "Use relevant job-description terminology naturally."
        );


        return limitList(
                suggestions,
                6
        );
    }


    // =========================================================
    // RESUME IMPROVEMENTS
    // =========================================================

    private List<String> generateResumeImprovements(
            String resumeText,
            List<String> missingSkills,
            int achievementScore) {


        List<String> improvements =
                new ArrayList<>();


        improvements.add(
                "Start important resume bullets with strong action verbs."
        );


        if (
                achievementScore < 70
        ) {

            improvements.add(
                    "Add measurable results to projects and experience."
            );
        }


        improvements.add(
                "Keep the most relevant technical skills near the top of the resume."
        );


        if (
                !resumeText.contains(
                        "github"
                )
        ) {

            improvements.add(
                    "Consider adding GitHub and strong project links."
            );
        }


        if (
                !resumeText.contains(
                        "linkedin"
                )
        ) {

            improvements.add(
                    "Consider adding your LinkedIn profile."
            );
        }


        improvements.add(
                "Avoid keyword stuffing; every listed skill should be supported by real experience."
        );


        return limitList(
                improvements,
                6
        );
    }


    // =========================================================
    // SECTION DETECTION
    // =========================================================

    private boolean containsSection(
            String text,
            String section) {


        Pattern pattern =
                Pattern.compile(
                        "(^|\\s)"
                                +
                        Pattern.quote(
                                normalizeText(
                                        section
                                )
                        )
                                +
                        "(\\s|:|$)"
                );


        return pattern
                .matcher(
                        text
                )
                .find();
    }


    // =========================================================
    // KEYWORD MATCH
    // =========================================================

    private boolean containsKeyword(
            String text,
            String keyword) {


        if (
                keyword.length() <= 3
        ) {


            Pattern pattern =
                    Pattern.compile(
                            "(?<![a-z0-9])"
                                    +
                            Pattern.quote(
                                    keyword
                            )
                                    +
                            "(?![a-z0-9])"
                    );


            return pattern
                    .matcher(
                            text
                    )
                    .find();
        }


        return text.contains(
                keyword
        );
    }


    // =========================================================
    // NORMALIZE TEXT
    // =========================================================

    private String normalizeText(
            String text) {


        if (
                text == null
        ) {

            return "";
        }


        return text
                .toLowerCase(
                        Locale.ROOT
                )
                .replace(
                        '\u2013',
                        '-'
                )
                .replace(
                        '\u2014',
                        '-'
                )
                .replace(
                        '\u2019',
                        '\''
                )
                .replaceAll(
                        "\\s+",
                        " "
                )
                .trim();
    }


    // =========================================================
    // LIMIT LIST
    // =========================================================

    private List<String> limitList(
            List<String> values,
            int max) {


        if (
                values == null
        ) {

            return new ArrayList<>();
        }


        return values.stream()

                .filter(
                        Objects::nonNull
                )

                .map(
                        String::trim
                )

                .filter(
                        value ->
                                !value.isBlank()
                )

                .limit(max)

                .collect(
                        Collectors.toList()
                );
    }


    // =========================================================
    // CLAMP
    // =========================================================

    private int clamp(
            int value,
            int min,
            int max) {


        return Math.max(
                min,
                Math.min(
                        max,
                        value
                )
        );
    }


    // =========================================================
    // SKILL DEFINITION
    // =========================================================

    private record SkillDefinition(
            String name,
            String... aliases
    ) {
    }


    // =========================================================
    // SKILLS
    // =========================================================

    private static final List<SkillDefinition> SKILLS =
            List.of(

                    new SkillDefinition(
                            "Java",
                            "java"
                    ),

                    new SkillDefinition(
                            "Python",
                            "python"
                    ),

                    new SkillDefinition(
                            "JavaScript",
                            "javascript",
                            "js"
                    ),

                    new SkillDefinition(
                            "TypeScript",
                            "typescript",
                            "ts"
                    ),

                    new SkillDefinition(
                            "C",
                            "c"
                    ),

                    new SkillDefinition(
                            "C++",
                            "c++",
                            "cpp"
                    ),

                    new SkillDefinition(
                            "C#",
                            "c#",
                            "csharp"
                    ),

                    new SkillDefinition(
                            "PHP",
                            "php"
                    ),

                    new SkillDefinition(
                            "Go",
                            "golang",
                            "go"
                    ),

                    new SkillDefinition(
                            "Kotlin",
                            "kotlin"
                    ),

                    new SkillDefinition(
                            "Spring Boot",
                            "spring boot",
                            "springboot"
                    ),

                    new SkillDefinition(
                            "Spring Security",
                            "spring security"
                    ),

                    new SkillDefinition(
                            "Spring",
                            "spring"
                    ),

                    new SkillDefinition(
                            "Hibernate",
                            "hibernate"
                    ),

                    new SkillDefinition(
                            "JPA",
                            "jpa"
                    ),

                    new SkillDefinition(
                            "JDBC",
                            "jdbc"
                    ),

                    new SkillDefinition(
                            "Node.js",
                            "node.js",
                            "nodejs",
                            "node js"
                    ),

                    new SkillDefinition(
                            "Express.js",
                            "express.js",
                            "expressjs",
                            "express js"
                    ),

                    new SkillDefinition(
                            "REST API",
                            "rest api",
                            "rest apis",
                            "restful api",
                            "restful apis"
                    ),

                    new SkillDefinition(
                            "Microservices",
                            "microservices",
                            "microservice"
                    ),

                    new SkillDefinition(
                            "HTML",
                            "html",
                            "html5"
                    ),

                    new SkillDefinition(
                            "CSS",
                            "css",
                            "css3"
                    ),

                    new SkillDefinition(
                            "React",
                            "react",
                            "react.js",
                            "reactjs"
                    ),

                    new SkillDefinition(
                            "Angular",
                            "angular"
                    ),

                    new SkillDefinition(
                            "Vue",
                            "vue",
                            "vue.js"
                    ),

                    new SkillDefinition(
                            "Tailwind CSS",
                            "tailwind css",
                            "tailwind"
                    ),

                    new SkillDefinition(
                            "Bootstrap",
                            "bootstrap"
                    ),

                    new SkillDefinition(
                            "MySQL",
                            "mysql"
                    ),

                    new SkillDefinition(
                            "PostgreSQL",
                            "postgresql",
                            "postgres"
                    ),

                    new SkillDefinition(
                            "MongoDB",
                            "mongodb",
                            "mongo db"
                    ),

                    new SkillDefinition(
                            "Oracle",
                            "oracle"
                    ),

                    new SkillDefinition(
                            "SQL",
                            "sql"
                    ),

                    new SkillDefinition(
                            "Redis",
                            "redis"
                    ),

                    new SkillDefinition(
                            "Docker",
                            "docker"
                    ),

                    new SkillDefinition(
                            "Kubernetes",
                            "kubernetes",
                            "k8s"
                    ),

                    new SkillDefinition(
                            "AWS",
                            "aws",
                            "amazon web services"
                    ),

                    new SkillDefinition(
                            "Azure",
                            "azure"
                    ),

                    new SkillDefinition(
                            "GCP",
                            "gcp",
                            "google cloud"
                    ),

                    new SkillDefinition(
                            "Git",
                            "git"
                    ),

                    new SkillDefinition(
                            "GitHub",
                            "github"
                    ),

                    new SkillDefinition(
                            "Jenkins",
                            "jenkins"
                    ),

                    new SkillDefinition(
                            "CI/CD",
                            "ci/cd",
                            "cicd",
                            "continuous integration",
                            "continuous deployment"
                    ),

                    new SkillDefinition(
                            "Maven",
                            "maven"
                    ),

                    new SkillDefinition(
                            "Gradle",
                            "gradle"
                    ),

                    new SkillDefinition(
                            "Postman",
                            "postman"
                    ),

                    new SkillDefinition(
                            "Data Structures",
                            "data structures",
                            "data structure"
                    ),

                    new SkillDefinition(
                            "Algorithms",
                            "algorithms",
                            "algorithm"
                    ),

                    new SkillDefinition(
                            "DSA",
                            "dsa"
                    ),

                    new SkillDefinition(
                            "OOP",
                            "oop",
                            "oops",
                            "object oriented programming",
                            "object-oriented programming"
                    ),

                    new SkillDefinition(
                            "System Design",
                            "system design"
                    ),

                    new SkillDefinition(
                            "Operating Systems",
                            "operating systems",
                            "operating system"
                    ),

                    new SkillDefinition(
                            "DBMS",
                            "dbms",
                            "database management system"
                    ),

                    new SkillDefinition(
                            "Computer Networks",
                            "computer networks",
                            "computer network"
                    ),

                    new SkillDefinition(
                            "Machine Learning",
                            "machine learning"
                    ),

                    new SkillDefinition(
                            "Deep Learning",
                            "deep learning"
                    ),

                    new SkillDefinition(
                            "Artificial Intelligence",
                            "artificial intelligence"
                    ),

                    new SkillDefinition(
                            "AI",
                            "ai"
                    ),

                    new SkillDefinition(
                            "TensorFlow",
                            "tensorflow"
                    ),

                    new SkillDefinition(
                            "PyTorch",
                            "pytorch"
                    ),

                    new SkillDefinition(
                            "JUnit",
                            "junit"
                    ),

                    new SkillDefinition(
                            "Mockito",
                            "mockito"
                    ),

                    new SkillDefinition(
                            "Selenium",
                            "selenium"
                    )
            );


    // =========================================================
    // STOP WORDS
    // =========================================================

    private static final Set<String> STOP_WORDS =
            Set.of(

                    "the",
                    "and",
                    "for",
                    "with",
                    "that",
                    "this",
                    "from",
                    "your",
                    "you",
                    "our",
                    "are",
                    "will",
                    "have",
                    "has",
                    "been",
                    "being",
                    "into",
                    "about",
                    "their",
                    "they",
                    "them",
                    "job",
                    "work",
                    "working",
                    "role",
                    "candidate",
                    "experience",
                    "years",
                    "year",
                    "required",
                    "preferred",
                    "looking",
                    "using",
                    "ability",
                    "skills",
                    "skill",
                    "team",
                    "teams",
                    "responsibilities",
                    "responsibility",
                    "include",
                    "strong",
                    "good",
                    "excellent",
                    "knowledge",
                    "understanding"
            );
}