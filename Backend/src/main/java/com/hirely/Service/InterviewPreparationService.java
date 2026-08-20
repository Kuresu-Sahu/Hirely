package com.hirely.Service;

import org.springframework.stereotype.Service;

import com.hirely.Dto.InterviewQuestionResponse;
import com.hirely.Entity.InterviewQuestion;
import com.hirely.Entity.Job;
import com.hirely.Entity.Resume;
import com.hirely.Entity.User;
import com.hirely.Repository.InterviewQuestionRepository;
import com.hirely.Repository.JobRepository;
import com.hirely.Repository.ResumeRepository;
import com.hirely.Repository.UserRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class InterviewPreparationService {

    private final InterviewQuestionRepository questionRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    public InterviewPreparationService(
            InterviewQuestionRepository questionRepository,
            JobRepository jobRepository,
            ResumeRepository resumeRepository,
            UserRepository userRepository) {

        this.questionRepository = questionRepository;
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // GET INTERVIEW QUESTIONS FOR JOB
    // =====================================================

    public List<InterviewQuestionResponse> getQuestionsForJob(
            Long jobId,
            String candidateEmail) {

        // -------------------------------------------------
        // FIND CANDIDATE
        // -------------------------------------------------

        User candidate = userRepository
                .findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException(
                        "Candidate not found"));

        // -------------------------------------------------
        // CHECK ROLE
        // -------------------------------------------------

        if (!"CANDIDATE".equals(candidate.getRole())) {

            throw new RuntimeException(
                    "Only candidates can access interview preparation");
        }

        // -------------------------------------------------
        // CHECK RESUME
        // -------------------------------------------------

        Resume resume = resumeRepository
                .findByCandidateId(candidate.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Please upload your resume first"));

        if (resume.getExtractedText() == null ||
                resume.getExtractedText().isBlank()) {

            throw new RuntimeException(
                    "Resume text could not be extracted");
        }

        // -------------------------------------------------
        // FIND JOB
        // -------------------------------------------------

        Job job = jobRepository
                .findById(jobId)
                .orElseThrow(() -> new RuntimeException(
                        "Job not found"));

        // -------------------------------------------------
        // GET EXISTING QUESTIONS
        // -------------------------------------------------

        List<InterviewQuestion> questions = questionRepository
                .findByJobId(jobId);

        // -------------------------------------------------
        // IF QUESTIONS DO NOT EXIST
        // GENERATE THEM
        // -------------------------------------------------

        if (questions.isEmpty()) {

            questions = generateQuestions(job);
        }

        // -------------------------------------------------
        // CONVERT TO RESPONSE
        // -------------------------------------------------

        List<InterviewQuestionResponse> response = new ArrayList<>();

        for (InterviewQuestion question : questions) {

            response.add(
                    convertToResponse(question));
        }

        return response;
    }

    // =====================================================
    // GENERATE QUESTIONS
    // =====================================================

    private List<InterviewQuestion> generateQuestions(
            Job job) {

        List<InterviewQuestion> questions = new ArrayList<>();

        String jobText = (safe(job.getTitle())
                + " "
                + safe(job.getDescription())
                + " "
                + safe(job.getExperience())).toLowerCase();

        // =================================================
        // JAVA
        // =================================================

        if (jobText.contains("java")) {

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What are the main principles of Object-Oriented Programming in Java?",
                            "The four main principles are Encapsulation, Inheritance, Polymorphism and Abstraction.",
                            "EASY",
                            "Java"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is the difference between == and equals() in Java?",
                            "== compares primitive values or object references, while equals() is used to compare object content when properly overridden.",
                            "EASY",
                            "Java"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is the difference between ArrayList and LinkedList?",
                            "ArrayList is backed by a dynamic array and provides fast random access, while LinkedList uses linked nodes and is generally better for frequent insertions or removals at known positions.",
                            "MEDIUM",
                            "Java"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "Explain HashMap in Java.",
                            "HashMap stores key-value pairs using hashing. It allows fast average-time lookup, insertion and deletion and permits one null key and multiple null values.",
                            "MEDIUM",
                            "Java"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is exception handling in Java?",
                            "Exception handling manages runtime errors using mechanisms such as try, catch, finally, throw and throws.",
                            "EASY",
                            "Java"));
        }

        // =================================================
        // SPRING BOOT
        // =================================================

        if (jobText.contains("spring boot") ||
                jobText.contains("spring")) {

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is Spring Boot and why is it used?",
                            "Spring Boot simplifies Spring application development by providing auto-configuration, starter dependencies and embedded servers.",
                            "EASY",
                            "Spring Boot"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is Dependency Injection in Spring?",
                            "Dependency Injection is a design principle where Spring provides required dependencies to a class instead of the class creating those dependencies itself.",
                            "EASY",
                            "Spring Boot"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is the difference between @Controller and @RestController?",
                            "@RestController is effectively a combination of @Controller and @ResponseBody and is commonly used for REST APIs returning data directly.",
                            "MEDIUM",
                            "Spring Boot"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is Spring Data JPA?",
                            "Spring Data JPA provides repository abstractions for working with JPA-based databases and reduces boilerplate database-access code.",
                            "MEDIUM",
                            "Spring Boot"));
        }

        // =================================================
        // SQL / MYSQL
        // =================================================

        if (jobText.contains("mysql") ||
                jobText.contains("sql") ||
                jobText.contains("database") ||
                jobText.contains("oracle") ||
                jobText.contains("postgresql")) {

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is the difference between WHERE and HAVING in SQL?",
                            "WHERE filters rows before grouping, while HAVING filters groups after GROUP BY.",
                            "EASY",
                            "SQL"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is normalization in DBMS?",
                            "Normalization organizes database tables to reduce redundancy and improve data integrity. Common normal forms include 1NF, 2NF and 3NF.",
                            "MEDIUM",
                            "SQL"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is the difference between INNER JOIN and LEFT JOIN?",
                            "INNER JOIN returns matching rows from both tables, while LEFT JOIN returns all rows from the left table and matching rows from the right table.",
                            "EASY",
                            "SQL"));
        }

        // =================================================
        // REACT
        // =================================================

        if (jobText.contains("react")) {

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is React?",
                            "React is a JavaScript library for building component-based user interfaces.",
                            "EASY",
                            "React"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is the purpose of useState in React?",
                            "useState is a React Hook used to add and manage state in functional components.",
                            "EASY",
                            "React"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is useEffect used for?",
                            "useEffect is used to perform side effects such as API calls, subscriptions and synchronization with external systems.",
                            "EASY",
                            "React"));
        }

        // =================================================
        // REST API
        // =================================================

        if (jobText.contains("rest") ||
                jobText.contains("api")) {

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is a REST API?",
                            "A REST API is an HTTP-based interface that allows clients and servers to communicate using resources and standard HTTP methods such as GET, POST, PUT and DELETE.",
                            "EASY",
                            "REST API"));

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is the difference between GET and POST?",
                            "GET is generally used to retrieve resources, while POST is generally used to submit data and create resources.",
                            "EASY",
                            "REST API"));
        }

        // =================================================
        // GIT
        // =================================================

        if (jobText.contains("git") ||
                jobText.contains("github")) {

            questions.add(
                    createQuestion(
                            job,
                            "TECHNICAL",
                            "What is Git and why is it used?",
                            "Git is a distributed version-control system used to track code changes and collaborate with other developers.",
                            "EASY",
                            "Git"));
        }

        // =================================================
        // GENERAL TECHNICAL QUESTIONS
        // =================================================

        questions.add(
                createQuestion(
                        job,
                        "TECHNICAL",
                        "Explain one project you have worked on and the challenges you faced.",
                        "The candidate should explain the project's purpose, architecture, technologies used, personal contribution and important technical challenges.",
                        "MEDIUM",
                        "Projects"));

        questions.add(
                createQuestion(
                        job,
                        "TECHNICAL",
                        "How would you debug a backend API that is returning an error?",
                        "A good approach includes checking logs, request parameters, authentication, controller/service logic, database operations and the actual HTTP response.",
                        "MEDIUM",
                        "Backend"));

        // =================================================
        // HR QUESTIONS
        // =================================================

        questions.add(
                createQuestion(
                        job,
                        "HR",
                        "Tell me about yourself.",
                        "Give a concise professional introduction covering education, technical skills, projects, experience and career goals.",
                        "EASY",
                        "HR"));

        questions.add(
                createQuestion(
                        job,
                        "HR",
                        "Why should we hire you?",
                        "Connect your technical skills, projects, problem-solving ability and willingness to learn with the requirements of the job.",
                        "MEDIUM",
                        "HR"));

        questions.add(
                createQuestion(
                        job,
                        "HR",
                        "What are your strengths?",
                        "Mention genuine strengths relevant to the role and support them with examples.",
                        "EASY",
                        "HR"));

        questions.add(
                createQuestion(
                        job,
                        "HR",
                        "What is one weakness you are currently working on?",
                        "Mention a genuine but manageable weakness and explain the concrete steps you are taking to improve it.",
                        "MEDIUM",
                        "HR"));

        questions.add(
                createQuestion(
                        job,
                        "HR",
                        "Where do you see yourself in five years?",
                        "Describe a realistic career direction that shows growth, learning and increasing responsibility.",
                        "EASY",
                        "HR"));

        // =================================================
        // SAVE ALL QUESTIONS
        // =================================================

        return questionRepository.saveAll(
                questions);
    }

    // =====================================================
    // CREATE QUESTION
    // =====================================================

    private InterviewQuestion createQuestion(
            Job job,
            String category,
            String question,
            String expectedAnswer,
            String difficulty,
            String technology) {

        InterviewQuestion interviewQuestion = new InterviewQuestion();

        interviewQuestion.setJob(job);

        interviewQuestion.setCategory(category);

        interviewQuestion.setQuestion(question);

        interviewQuestion.setExpectedAnswer(
                expectedAnswer);

        interviewQuestion.setDifficulty(
                difficulty);

        interviewQuestion.setTechnology(
                technology);

        return interviewQuestion;
    }

    // =====================================================
    // CONVERT ENTITY → RESPONSE
    // =====================================================

    private InterviewQuestionResponse convertToResponse(
            InterviewQuestion question) {

        InterviewQuestionResponse response = new InterviewQuestionResponse();

        response.setId(
                question.getId());

        if (question.getJob() != null) {

            response.setJobId(
                    question.getJob().getId());

            response.setJobTitle(
                    question.getJob().getTitle());
        }

        response.setCategory(
                question.getCategory());

        response.setQuestion(
                question.getQuestion());

        response.setDifficulty(
                question.getDifficulty());

        response.setTechnology(
                question.getTechnology());

        return response;
    }

    // =====================================================
    // SAFE STRING
    // =====================================================

    private String safe(String value) {

        return value == null
                ? ""
                : value;
    }

    // =====================================================
    // EVALUATE INTERVIEW ANSWER
    // =====================================================

    public com.hirely.Dto.InterviewEvaluationResponse evaluateAnswer(
            Long questionId,
            String answer,
            String candidateEmail) {

        // -------------------------------------------------
        // FIND CANDIDATE
        // -------------------------------------------------

        User candidate = userRepository
                .findByEmail(candidateEmail)
                .orElseThrow(() -> new RuntimeException(
                        "Candidate not found"));

        // -------------------------------------------------
        // CHECK ROLE
        // -------------------------------------------------

        if (!"CANDIDATE".equals(candidate.getRole())) {

            throw new RuntimeException(
                    "Only candidates can evaluate interview answers");
        }

        // -------------------------------------------------
        // CHECK RESUME
        // -------------------------------------------------

        Resume resume = resumeRepository
                .findByCandidateId(candidate.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Please upload your resume first"));

        if (resume.getExtractedText() == null ||
                resume.getExtractedText().isBlank()) {

            throw new RuntimeException(
                    "Resume text could not be extracted");
        }

        // -------------------------------------------------
        // CHECK ANSWER
        // -------------------------------------------------

        if (answer == null ||
                answer.isBlank()) {

            throw new RuntimeException(
                    "Please provide an answer");
        }

        // -------------------------------------------------
        // FIND QUESTION
        // -------------------------------------------------

        InterviewQuestion question = questionRepository
                .findById(questionId)
                .orElseThrow(() -> new RuntimeException(
                        "Interview question not found"));

        // -------------------------------------------------
        // EVALUATE ANSWER
        // -------------------------------------------------

        String submittedAnswer = answer.trim();

        String expectedAnswer = question.getExpectedAnswer();

        if (expectedAnswer == null ||
                expectedAnswer.isBlank()) {

            expectedAnswer = "No reference answer is available for this question.";
        }

        // -------------------------------------------------
        // EXTRACT IMPORTANT WORDS
        // -------------------------------------------------

        List<String> expectedKeywords = extractAnswerKeywords(
                expectedAnswer);

        List<String> answerKeywords = extractAnswerKeywords(
                submittedAnswer);

        // -------------------------------------------------
        // FIND MATCHED KEYWORDS
        // -------------------------------------------------

        List<String> matchedKeywords = new ArrayList<>();

        List<String> missingKeywords = new ArrayList<>();

        for (String keyword : expectedKeywords) {

            if (answerKeywords.contains(keyword)) {

                matchedKeywords.add(keyword);

            } else {

                missingKeywords.add(keyword);
            }
        }

        // -------------------------------------------------
        // CALCULATE CONTENT SCORE
        // -------------------------------------------------

        int contentScore = 0;

        if (!expectedKeywords.isEmpty()) {

            contentScore = (matchedKeywords.size() * 100)
                    / expectedKeywords.size();
        }

        // -------------------------------------------------
        // LENGTH SCORE
        // -------------------------------------------------

        int lengthScore = calculateAnswerLengthScore(
                submittedAnswer);

        // -------------------------------------------------
        // STRUCTURE SCORE
        // -------------------------------------------------

        int structureScore = calculateAnswerStructureScore(
                submittedAnswer);

        // -------------------------------------------------
        // FINAL SCORE
        // -------------------------------------------------

        int finalScore = (int) (contentScore * 0.60
                +
                lengthScore * 0.20
                +
                structureScore * 0.20);

        // Keep score between 0 and 100

        finalScore = Math.max(
                0,
                Math.min(
                        100,
                        finalScore));

        // -------------------------------------------------
        // CONVERT TO SCORE OUT OF 10
        // -------------------------------------------------

        int scoreOutOfTen = Math.round(
                finalScore / 10.0f);

        scoreOutOfTen = Math.max(
                0,
                Math.min(
                        10,
                        scoreOutOfTen));

        // -------------------------------------------------
        // RATING
        // -------------------------------------------------

        String rating = generateRating(
                scoreOutOfTen);

        // -------------------------------------------------
        // STRENGTHS
        // -------------------------------------------------

        List<String> strengths = new ArrayList<>();

        if (!matchedKeywords.isEmpty()) {

            strengths.add(
                    "Your answer contains "
                            + matchedKeywords.size()
                            + " important concept(s) from the reference answer.");
        }

        if (submittedAnswer.length() >= 100) {

            strengths.add(
                    "Your answer provides a reasonable amount of explanation.");
        }

        if (structureScore >= 70) {

            strengths.add(
                    "Your answer has a reasonably clear structure.");
        }

        if (question.getCategory() != null &&
                "HR".equalsIgnoreCase(
                        question.getCategory())) {

            if (containsAny(
                    submittedAnswer,
                    "because",
                    "experience",
                    "project",
                    "example")) {

                strengths.add(
                        "Your HR answer includes supporting context or examples.");
            }
        }

        if (strengths.isEmpty()) {

            strengths.add(
                    "You attempted the interview question.");
        }

        // -------------------------------------------------
        // WEAKNESSES
        // -------------------------------------------------

        List<String> weaknesses = new ArrayList<>();

        if (!missingKeywords.isEmpty()) {

            weaknesses.add(
                    "Your answer does not clearly cover these important concepts: "
                            + String.join(
                                    ", ",
                                    missingKeywords));
        }

        if (submittedAnswer.length() < 50) {

            weaknesses.add(
                    "Your answer is too short and needs more explanation.");
        }

        if (structureScore < 50) {

            weaknesses.add(
                    "Your answer could be organized more clearly.");
        }

        if (weaknesses.isEmpty()) {

            weaknesses.add(
                    "No major weaknesses were detected by the current evaluation.");
        }

        // -------------------------------------------------
        // SUGGESTIONS
        // -------------------------------------------------

        List<String> suggestions = new ArrayList<>();

        if (!missingKeywords.isEmpty()) {

            suggestions.add(
                    "Review the following concepts and include them when they are relevant: "
                            + String.join(
                                    ", ",
                                    missingKeywords));
        }

        suggestions.add(
                "Explain the concept instead of giving only a one-line definition.");

        suggestions.add(
                "Use a practical example when answering technical questions.");

        if (question.getCategory() != null &&
                "HR".equalsIgnoreCase(
                        question.getCategory())) {

            suggestions.add(
                    "For HR questions, support your answer with a real example from your projects, education or experience.");
        }

        // -------------------------------------------------
        // CREATE RESPONSE
        // -------------------------------------------------

        com.hirely.Dto.InterviewEvaluationResponse response = new com.hirely.Dto.InterviewEvaluationResponse();

        response.setQuestionId(
                question.getId());

        response.setQuestion(
                question.getQuestion());

        response.setCategory(
                question.getCategory());

        response.setTechnology(
                question.getTechnology());

        response.setDifficulty(
                question.getDifficulty());

        response.setScore(
                scoreOutOfTen);

        response.setRating(
                rating);

        response.setStrengths(
                strengths);

        response.setWeaknesses(
                weaknesses);

        response.setSuggestions(
                suggestions);

        response.setExpectedAnswer(
                expectedAnswer);

        response.setSubmittedAnswer(
                submittedAnswer);

        return response;
    }

    // =====================================================
    // EXTRACT ANSWER KEYWORDS
    // =====================================================

    private List<String> extractAnswerKeywords(
            String text) {

        if (text == null ||
                text.isBlank()) {

            return new ArrayList<>();
        }

        String cleaned = text.toLowerCase()
                .replaceAll(
                        "[^a-z0-9+#.]",
                        " ");

        String[] words = cleaned.split("\\s+");

        List<String> stopWords = List.of(
                "the",
                "and",
                "for",
                "with",
                "that",
                "this",
                "from",
                "are",
                "was",
                "were",
                "been",
                "being",
                "into",
                "have",
                "has",
                "had",
                "will",
                "would",
                "could",
                "should",
                "their",
                "there",
                "they",
                "them",
                "then",
                "than",
                "when",
                "where",
                "which",
                "what",
                "while",
                "also",
                "using",
                "used",
                "use",
                "can",
                "may",
                "more",
                "some",
                "such",
                "like",
                "very",
                "about",
                "through",
                "between",
                "from",
                "this",
                "these",
                "those");

        List<String> keywords = new ArrayList<>();

        for (String word : words) {

            word = word.trim();

            if (word.length() < 3) {

                continue;
            }

            if (stopWords.contains(word)) {

                continue;
            }

            if (word.matches("\\d+")) {

                continue;
            }

            if (!keywords.contains(word)) {

                keywords.add(word);
            }
        }

        return keywords;
    }

    // =====================================================
    // ANSWER LENGTH SCORE
    // =====================================================

    private int calculateAnswerLengthScore(
            String answer) {

        int length = answer == null
                ? 0
                : answer.trim().length();

        if (length >= 300) {

            return 100;
        }

        if (length >= 200) {

            return 90;
        }

        if (length >= 120) {

            return 80;
        }

        if (length >= 80) {

            return 65;
        }

        if (length >= 50) {

            return 50;
        }

        if (length >= 25) {

            return 30;
        }

        return 10;
    }

    // =====================================================
    // ANSWER STRUCTURE SCORE
    // =====================================================

    private int calculateAnswerStructureScore(
            String answer) {

        if (answer == null ||
                answer.isBlank()) {

            return 0;
        }

        int score = 30;

        String lower = answer.toLowerCase();

        if (lower.contains(".")) {

            score += 20;
        }

        if (lower.contains(",")) {

            score += 10;
        }

        if (containsAny(
                lower,
                "because",
                "therefore",
                "for example",
                "for instance",
                "such as")) {

            score += 20;
        }

        if (answer.length() >= 100) {

            score += 20;
        }

        return Math.min(
                100,
                score);
    }

    // =====================================================
    // GENERATE RATING
    // =====================================================

    private String generateRating(
            int score) {

        if (score >= 9) {

            return "Excellent";
        }

        if (score >= 8) {

            return "Very Good";
        }

        if (score >= 7) {

            return "Good";
        }

        if (score >= 5) {

            return "Needs Improvement";
        }

        if (score >= 3) {

            return "Weak";
        }

        return "Poor";
    }

    // =====================================================
    // CHECK MULTIPLE TERMS
    // =====================================================

    private boolean containsAny(
            String text,
            String... values) {

        if (text == null) {

            return false;
        }

        String lower = text.toLowerCase();

        for (String value : values) {

            if (lower.contains(
                    value.toLowerCase())) {

                return true;
            }
        }

        return false;
    }
}