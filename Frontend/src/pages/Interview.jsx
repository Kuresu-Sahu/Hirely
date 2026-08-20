import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";

function Interview() {

    const { jobId } = useParams();

    const navigate = useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    const [currentQuestion, setCurrentQuestion] = useState(0);

    const [answers, setAnswers] = useState({});

    const [interviewStarted, setInterviewStarted] = useState(false);

    const [evaluationProgress, setEvaluationProgress] = useState(0);


    // =====================================================
    // LOAD QUESTIONS
    // =====================================================

    useEffect(() => {

        const loadInterview = async () => {

            try {

                setLoading(true);

                setError("");


                const response = await api.get(
                    `/api/interview/job/${jobId}`
                );


                console.log(
                    "Interview questions:",
                    response.data
                );


                if (Array.isArray(response.data)) {

                    setQuestions(
                        response.data
                    );

                } else if (
                    response.data &&
                    Array.isArray(
                        response.data.questions
                    )
                ) {

                    setQuestions(
                        response.data.questions
                    );

                } else {

                    setQuestions([]);
                }


            } catch (error) {

                console.error(
                    "Interview loading error:",
                    error
                );


                let message =
                    "Unable to load interview questions.";


                if (
                    typeof error.response?.data ===
                    "string"
                ) {

                    message =
                        error.response.data;

                } else if (
                    error.response?.data?.message
                ) {

                    message =
                        error.response.data.message;
                }


                setError(message);


            } finally {

                setLoading(false);
            }
        };


        if (jobId) {

            loadInterview();
        }

    }, [jobId]);


    // =====================================================
    // HANDLE ANSWER
    // =====================================================

    const handleAnswerChange = (value) => {

        setAnswers(
            (previousAnswers) => ({

                ...previousAnswers,

                [currentQuestion]: value

            })
        );


        setError("");
    };


    // =====================================================
    // START INTERVIEW
    // =====================================================

    const handleStartInterview = () => {

        setInterviewStarted(true);

        setCurrentQuestion(0);

        setError("");


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // =====================================================
    // NEXT QUESTION
    // =====================================================

    const handleNext = () => {

        const currentAnswer =
            answers[currentQuestion] || "";


        if (!currentAnswer.trim()) {

            setError(
                "Please answer this question before continuing."
            );

            return;
        }


        if (currentAnswer.trim().length < 10) {

            setError(
                "Please provide a little more detail in your answer."
            );

            return;
        }


        setError("");


        if (
            currentQuestion <
            questions.length - 1
        ) {

            setCurrentQuestion(
                currentQuestion + 1
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    };


    // =====================================================
    // PREVIOUS QUESTION
    // =====================================================

    const handlePrevious = () => {

        setError("");


        if (currentQuestion > 0) {

            setCurrentQuestion(
                currentQuestion - 1
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    };


    // =====================================================
    // GO TO QUESTION
    // =====================================================

    const handleQuestionNavigation = (index) => {

        if (submitting) {

            return;
        }


        setError("");

        setCurrentQuestion(index);


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // =====================================================
    // CHECK ALL ANSWERS
    // =====================================================

    const validateAllAnswers = () => {

        const unansweredQuestions =
            questions.filter(
                (_, index) =>
                    !answers[index] ||
                    !answers[index].trim()
            );


        if (
            unansweredQuestions.length > 0
        ) {

            const firstUnanswered =
                questions.findIndex(
                    (_, index) =>
                        !answers[index] ||
                        !answers[index].trim()
                );


            setCurrentQuestion(
                firstUnanswered
            );


            setError(
                `Please answer all questions. ${unansweredQuestions.length} question(s) are still unanswered.`
            );


            return false;
        }


        return true;
    };


    // =====================================================
    // FINISH INTERVIEW
    // =====================================================

    const handleFinish = async () => {

        setError("");


        if (!validateAllAnswers()) {

            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to finish the interview? Your answers will be evaluated and your result will be saved."
            );


        if (!confirmed) {

            return;
        }


        try {

            setSubmitting(true);

            setEvaluationProgress(0);

            setError("");


            const evaluationResults = [];


            // =================================================
            // EVALUATE EACH ANSWER
            // =================================================

            for (
                let index = 0;
                index < questions.length;
                index++
            ) {

                const question =
                    questions[index];


                const answer =
                    answers[index];


                console.log(
                    `Evaluating question ${index + 1}/${questions.length}`,
                    question.id
                );


                const response =
                    await api.post(
                        "/api/interview/evaluate",
                        {
                            questionId:
                                question.id,

                            answer:
                                answer.trim()
                        }
                    );


                evaluationResults.push(
                    response.data
                );


                setEvaluationProgress(
                    Math.round(
                        ((index + 1) /
                            questions.length) *
                        100
                    )
                );
            }


            // =================================================
            // CALCULATE SCORE
            // =================================================

            const totalScore =
                evaluationResults.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.score || 0
                        ),
                    0
                );


            const averageScore =
                evaluationResults.length > 0
                    ? totalScore /
                    evaluationResults.length
                    : 0;


            const percentage =
                Math.round(
                    averageScore * 10
                );


            // =================================================
            // OVERALL RATING
            // =================================================

            let overallRating =
                "Poor";


            if (averageScore >= 9) {

                overallRating =
                    "Excellent";

            } else if (averageScore >= 8) {

                overallRating =
                    "Very Good";

            } else if (averageScore >= 7) {

                overallRating =
                    "Good";

            } else if (averageScore >= 5) {

                overallRating =
                    "Needs Improvement";

            } else if (averageScore >= 3) {

                overallRating =
                    "Weak";
            }


            // =================================================
            // RESULT OBJECT
            // =================================================

            const interviewResult = {

                jobId:
                    Number(jobId),

                completedAt:
                    new Date().toISOString(),

                results:
                    evaluationResults
            };


            // =================================================
            // SAVE ATTEMPT
            // =================================================

            const saveResponse =
                await api.post(
                    "/api/interview-attempts",
                    {
                        jobId:
                            Number(jobId),

                        totalQuestions:
                            evaluationResults.length,

                        averageScore:
                            Number(
                                averageScore.toFixed(2)
                            ),

                        percentage:
                            percentage,

                        overallRating:
                            overallRating,

                        resultJson:
                            JSON.stringify(
                                interviewResult
                            )
                    }
                );


            console.log(
                "Interview attempt saved:",
                saveResponse.data
            );


            // =================================================
            // STORE LATEST RESULT
            // =================================================

            const latestResult = {

                ...interviewResult,

                attemptId:
                    saveResponse.data?.id,

                averageScore:
                    Number(
                        averageScore.toFixed(2)
                    ),

                percentage:
                    percentage,

                overallRating:
                    overallRating
            };


            sessionStorage.setItem(
                "latestInterviewResult",
                JSON.stringify(
                    latestResult
                )
            );


            // =================================================
            // NAVIGATE RESULT
            // =================================================

            navigate(
                `/candidate/interview/result/${jobId}`
            );


        } catch (error) {

            console.error(
                "Interview submission error:",
                error
            );


            let message =
                "Unable to complete the interview.";


            if (
                typeof error.response?.data ===
                "string"
            ) {

                message =
                    error.response.data;

            } else if (
                error.response?.data?.message
            ) {

                message =
                    error.response.data.message;

            } else if (
                error.message
            ) {

                message =
                    error.message;
            }


            setError(message);

        } finally {

            setSubmitting(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="page-center">

                <h2>
                    <Icon name="bot" /> Preparing your AI interview...
                </h2>

                <p>
                    Loading questions for this job.
                </p>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (
        error &&
        questions.length === 0
    ) {

        return (

            <div>

                <nav className="navbar">

                    {/* <h2>
                    JobPortal
                </h2> */}
                    <div className="brand">
                        <img
                            src="/logo.png"
                            alt="Hirely"
                            className="brand-logo"
                        />
                    </div>


                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/candidate/dashboard"
                            )
                        }
                    >
                        <Icon name="left" /> Dashboard
                    </button>

                </nav>


                <main className="dashboard">

                    <div className="dashboard-card">

                        <h1>
                            AI Interview
                        </h1>


                        <div className="error-message">

                            {error}

                        </div>


                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate("/jobs")
                            }
                        >
                            Find Jobs
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // =====================================================
    // NO QUESTIONS
    // =====================================================

    if (questions.length === 0) {

        return (

            <div>

                <nav className="navbar">

                    {/* <h2>
                    JobPortal
                </h2> */}
                    <div className="brand">
                        <img
                            src="/logo.png"
                            alt="Hirely"
                            className="brand-logo"
                        />
                    </div>


                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/candidate/dashboard"
                            )
                        }
                    >
                        <Icon name="left" /> Dashboard
                    </button>

                </nav>


                <main className="dashboard">

                    <div className="dashboard-card">

                        <h1>
                            AI Interview
                        </h1>


                        <p>
                            No interview questions
                            are available for this job.
                        </p>


                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate("/jobs")
                            }
                        >
                            Back to Jobs
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // =====================================================
    // INTERVIEW INTRODUCTION
    // =====================================================

    if (!interviewStarted) {

        return (

            <div>

                <nav className="navbar">

                    {/* <h2>
                    JobPortal
                </h2> */}
                    <div className="brand">
                        <img
                            src="/logo.png"
                            alt="Hirely"
                            className="brand-logo"
                        />
                    </div>


                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                `/jobs/${jobId}`
                            )
                        }
                    >
                        <Icon name="left" /> Back to Job
                    </button>

                </nav>


                <main className="dashboard">

                    <div
                        className="dashboard-card"
                        style={{
                            maxWidth:
                                "800px",
                            margin:
                                "0 auto"
                        }}
                    >

                        <div
                            style={{
                                textAlign:
                                    "center"
                            }}
                        >

                            <div
                                style={{
                                    fontSize:
                                        "60px",
                                    marginBottom:
                                        "15px"
                                }}
                            >
                                <Icon name="bot" />
                            </div>


                            <h1>
                                AI Mock Interview
                            </h1>


                            <p>
                                Prepare yourself for
                                the actual interview by
                                answering job-specific
                                questions.
                            </p>

                        </div>


                        {/* =================================================
                            INSTRUCTIONS
                        ================================================= */}

                        <div
                            style={{
                                marginTop:
                                    "30px",
                                padding:
                                    "25px",
                                border:
                                    "1px solid #ddd",
                                borderRadius:
                                    "15px"
                            }}
                        >

                            <h2>
                                <Icon name="clipboard" /> Interview Instructions
                            </h2>


                            <ul
                                style={{
                                    lineHeight:
                                        "2"
                                }}
                            >

                                <li>
                                    Answer every question
                                    honestly.
                                </li>

                                <li>
                                    Explain your reasoning
                                    wherever possible.
                                </li>

                                <li>
                                    Use examples from your
                                    projects or experience.
                                </li>

                                <li>
                                    Keep technical answers
                                    clear and structured.
                                </li>

                                <li>
                                    You must answer all
                                    questions before
                                    finishing.
                                </li>

                                <li>
                                    Your answers will be
                                    automatically evaluated.
                                </li>

                            </ul>

                        </div>


                        {/* =================================================
                            INTERVIEW INFORMATION
                        ================================================= */}

                        <div
                            style={{
                                display:
                                    "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(180px, 1fr))",
                                gap:
                                    "15px",
                                marginTop:
                                    "25px"
                            }}
                        >

                            <div
                                style={{
                                    padding:
                                        "20px",
                                    border:
                                        "1px solid #ddd",
                                    borderRadius:
                                        "12px",
                                    textAlign:
                                        "center"
                                }}
                            >

                                <h3>
                                    <Icon name="file" /> Questions
                                </h3>

                                <p>
                                    {questions.length}
                                </p>

                            </div>


                            <div
                                style={{
                                    padding:
                                        "20px",
                                    border:
                                        "1px solid #ddd",
                                    borderRadius:
                                        "12px",
                                    textAlign:
                                        "center"
                                }}
                            >

                                <h3>
                                    <Icon name="target" /> Evaluation
                                </h3>

                                <p>
                                    0 - 10 Score
                                </p>

                            </div>


                            <div
                                style={{
                                    padding:
                                        "20px",
                                    border:
                                        "1px solid #ddd",
                                    borderRadius:
                                        "12px",
                                    textAlign:
                                        "center"
                                }}
                            >

                                <h3>
                                    <Icon name="brainTopic" /> Topics
                                </h3>

                                <p>
                                    Technical + HR
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            START
                        ================================================= */}

                        <div
                            style={{
                                textAlign:
                                    "center",
                                marginTop:
                                    "30px"
                            }}
                        >

                            <button
                                className="primary-button"
                                onClick={
                                    handleStartInterview
                                }
                                style={{
                                    fontSize:
                                        "17px",
                                    padding:
                                        "14px 30px"
                                }}
                            >
                                <Icon name="interview" /> Start Interview
                            </button>

                        </div>

                    </div>

                </main>

            </div>
        );
    }


    // =====================================================
    // CURRENT QUESTION
    // =====================================================

    const question =
        questions[currentQuestion];


    const currentAnswer =
        answers[currentQuestion] || "";


    const progress =
        Math.round(
            ((currentQuestion + 1) /
                questions.length) *
            100
        );


    const isLastQuestion =
        currentQuestion ===
        questions.length - 1;


    // =====================================================
    // ANSWERED COUNT
    // =====================================================

    const answeredCount =
        questions.filter(
            (_, index) =>
                answers[index] &&
                answers[index].trim()
        ).length;


    // =====================================================
    // MAIN INTERVIEW UI
    // =====================================================

    return (

        <div>

            {/* =================================================
                NAVBAR
            ================================================= */}

            <nav className="navbar">

                {/* <h2>
                    JobPortal
                </h2> */}
                <div className="brand">
                    <img
                        src="/logo.png"
                        alt="Hirely"
                        className="brand-logo"
                    />
                </div>


                <button
                    className="secondary-button"
                    disabled={
                        submitting
                    }
                    onClick={() => {

                        const confirmed =
                            window.confirm(
                                "If you leave now, your current answers will be lost. Are you sure?"
                            );


                        if (confirmed) {

                            navigate(
                                `/jobs/${jobId}`
                            );
                        }

                    }}
                >
                    Exit Interview
                </button>

            </nav>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="dashboard">

                <div
                    className="dashboard-card"
                    style={{
                        maxWidth:
                            "1000px",
                        margin:
                            "0 auto"
                    }}
                >

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                            gap:
                                "15px",
                            flexWrap:
                                "wrap",
                            marginBottom:
                                "20px"
                        }}
                    >

                        <div>

                            <h1>
                                <Icon name="bot" /> AI Interview
                            </h1>

                            <p>
                                Answer the question
                                as if you were in a
                                real interview.
                            </p>

                        </div>


                        <div
                            style={{
                                fontWeight:
                                    "bold"
                            }}
                        >
                            {answeredCount}
                            {" / "}
                            {questions.length}
                            {" answered"}
                        </div>

                    </div>


                    {/* =================================================
                        PROGRESS BAR
                    ================================================= */}

                    <div
                        style={{
                            width:
                                "100%",
                            height:
                                "10px",
                            background:
                                "#e5e7eb",
                            borderRadius:
                                "10px",
                            overflow:
                                "hidden",
                            marginBottom:
                                "25px"
                        }}
                    >

                        <div
                            style={{
                                width:
                                    `${progress}%`,
                                height:
                                    "100%",
                                background:
                                    "#2563eb",
                                transition:
                                    "width 0.3s ease"
                            }}
                        />

                    </div>


                    {/* =================================================
                        QUESTION NAVIGATION
                    ================================================= */}

                    <div
                        style={{
                            display:
                                "flex",
                            gap:
                                "8px",
                            flexWrap:
                                "wrap",
                            marginBottom:
                                "25px"
                        }}
                    >

                        {questions.map(
                            (_, index) => (

                                <button
                                    key={
                                        questions[index].id ||
                                        index
                                    }
                                    type="button"
                                    disabled={
                                        submitting
                                    }
                                    onClick={() =>
                                        handleQuestionNavigation(
                                            index
                                        )
                                    }
                                    style={{
                                        width:
                                            "40px",
                                        height:
                                            "40px",
                                        borderRadius:
                                            "50%",
                                        border:
                                            "1px solid #ccc",
                                        cursor:
                                            submitting
                                                ? "not-allowed"
                                                : "pointer",
                                        fontWeight:
                                            "bold",
                                        background:
                                            index ===
                                                currentQuestion
                                                ? "#2563eb"
                                                : answers[index]
                                                    ? "#dcfce7"
                                                    : "#fff",
                                        color:
                                            index ===
                                                currentQuestion
                                                ? "#fff"
                                                : "#111"
                                    }}
                                >
                                    {index + 1}
                                </button>

                            )
                        )}

                    </div>


                    {/* =================================================
                        EVALUATION PROGRESS
                    ================================================= */}

                    {submitting && (

                        <div
                            style={{
                                padding:
                                    "15px",
                                marginBottom:
                                    "20px",
                                border:
                                    "1px solid #ddd",
                                borderRadius:
                                    "12px"
                            }}
                        >

                            <strong>
                                <Icon name="bot" /> Evaluating your
                                answers...
                            </strong>


                            <div
                                style={{
                                    marginTop:
                                        "10px",
                                    width:
                                        "100%",
                                    height:
                                        "8px",
                                    background:
                                        "#e5e7eb",
                                    borderRadius:
                                        "10px",
                                    overflow:
                                        "hidden"
                                }}
                            >

                                <div
                                    style={{
                                        width:
                                            `${evaluationProgress}%`,
                                        height:
                                            "100%",
                                        background:
                                            "#16a34a",
                                        transition:
                                            "width 0.3s ease"
                                    }}
                                />

                            </div>


                            <p>
                                {evaluationProgress}%
                                complete
                            </p>

                        </div>

                    )}


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div
                            className="error-message"
                            style={{
                                marginBottom:
                                    "20px"
                            }}
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================================
                        QUESTION CARD
                    ================================================= */}

                    <div
                        style={{
                            border:
                                "1px solid #ddd",
                            borderRadius:
                                "15px",
                            padding:
                                "25px",
                            marginTop:
                                "20px"
                        }}
                    >

                        {/* METADATA */}

                        <div
                            style={{
                                display:
                                    "flex",
                                gap:
                                    "8px",
                                flexWrap:
                                    "wrap",
                                marginBottom:
                                    "20px"
                            }}
                        >

                            {question.category && (

                                <span
                                    style={{
                                        padding:
                                            "6px 12px",
                                        borderRadius:
                                            "20px",
                                        background:
                                            "#eff6ff"
                                    }}
                                >
                                    <Icon name="book" />{" "}
                                    {question.category}
                                </span>

                            )}


                            {question.technology && (

                                <span
                                    style={{
                                        padding:
                                            "6px 12px",
                                        borderRadius:
                                            "20px",
                                        background:
                                            "#ecfdf5"
                                    }}
                                >
                                    <Icon name="code" />{" "}
                                    {question.technology}
                                </span>

                            )}


                            {question.difficulty && (

                                <span
                                    style={{
                                        padding:
                                            "6px 12px",
                                        borderRadius:
                                            "20px",
                                        background:
                                            "#fef3c7"
                                    }}
                                >
                                    <Icon name="target" />{" "}
                                    {question.difficulty}
                                </span>

                            )}

                        </div>


                        {/* QUESTION */}

                        <h2
                            style={{
                                lineHeight:
                                    "1.5",
                                marginBottom:
                                    "25px"
                            }}
                        >
                            {question.question}
                        </h2>


                        {/* ANSWER */}

                        <label
                            style={{
                                display:
                                    "block",
                                fontWeight:
                                    "600",
                                marginBottom:
                                    "10px"
                            }}
                        >
                            Your Answer
                        </label>


                        <textarea
                            value={
                                currentAnswer
                            }
                            onChange={(e) =>
                                handleAnswerChange(
                                    e.target.value
                                )
                            }
                            placeholder="Type your answer here..."
                            rows="10"
                            disabled={
                                submitting
                            }
                            style={{
                                width:
                                    "100%",
                                boxSizing:
                                    "border-box",
                                padding:
                                    "15px",
                                border:
                                    "1px solid #ccc",
                                borderRadius:
                                    "10px",
                                resize:
                                    "vertical",
                                fontSize:
                                    "16px",
                                lineHeight:
                                    "1.5"
                            }}
                        />


                        <p
                            style={{
                                marginTop:
                                    "8px",
                                color:
                                    "#777"
                            }}
                        >
                            Characters:{" "}
                            {currentAnswer.length}
                        </p>

                    </div>


                    {/* =================================================
                        NAVIGATION BUTTONS
                    ================================================= */}

                    <div
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                            gap:
                                "10px",
                            marginTop:
                                "25px",
                            flexWrap:
                                "wrap"
                        }}
                    >

                        <button
                            className="secondary-button"
                            type="button"
                            onClick={
                                handlePrevious
                            }
                            disabled={
                                currentQuestion ===
                                0 ||
                                submitting
                            }
                        >
                            <Icon name="left" /> Previous
                        </button>


                        {!isLastQuestion && (

                            <button
                                className="primary-button"
                                type="button"
                                onClick={
                                    handleNext
                                }
                                disabled={
                                    submitting
                                }
                            >
                                Save & Continue <Icon name="right" />
                            </button>

                        )}


                        {isLastQuestion && (

                            <button
                                className="primary-button"
                                type="button"
                                onClick={
                                    handleFinish
                                }
                                disabled={
                                    submitting
                                }
                            >
                                {submitting
                                    ? `Evaluating ${evaluationProgress}%...`
                                    : "Finish Interview"}
                            </button>

                        )}

                    </div>


                    {/* =================================================
                        FOOTER INFORMATION
                    ================================================= */}

                    <div
                        style={{
                            marginTop:
                                "25px",
                            padding:
                                "15px",
                            borderRadius:
                                "10px",
                            background:
                                "#f8fafc"
                        }}
                    >

                        <p
                            style={{
                                margin:
                                    "0"
                            }}
                        >
                            <Icon name="idea" /> <strong>Tip:</strong>{" "}
                            Give specific answers
                            and use examples from
                            your projects whenever
                            possible.
                        </p>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Interview;