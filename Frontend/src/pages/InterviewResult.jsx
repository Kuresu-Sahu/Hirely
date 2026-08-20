import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";

function InterviewResult() {

    const {
        jobId,
        attemptId
    } = useParams();

    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================
    // LOAD RESULT
    // ==========================================

    useEffect(() => {

        const loadResult = async () => {

            try {

                setLoading(true);

                setError("");


                // ======================================
                // HISTORY RESULT
                // ======================================

                if (attemptId) {

                    const response =
                        await api.get(
                            `/api/interview-attempts/${attemptId}`
                        );


                    const attempt =
                        response.data;


                    if (
                        !attempt ||
                        !attempt.resultJson
                    ) {

                        throw new Error(
                            "Interview result data is not available."
                        );
                    }


                    let parsedResult;


                    try {

                        parsedResult =
                            JSON.parse(
                                attempt.resultJson
                            );

                    } catch (parseError) {

                        console.error(
                            "Result JSON parse error:",
                            parseError
                        );

                        throw new Error(
                            "Saved interview result is invalid."
                        );
                    }


                    setResult({

                        ...parsedResult,

                        attemptId:
                            attempt.id,

                        jobId:
                            attempt.jobId,

                        jobTitle:
                            attempt.jobTitle,

                        averageScore:
                            attempt.averageScore,

                        percentage:
                            attempt.percentage,

                        overallRating:
                            attempt.overallRating,

                        completedAt:
                            attempt.completedAt
                    });


                    return;
                }


                // ======================================
                // LATEST RESULT
                // ======================================

                const storedResult =
                    sessionStorage.getItem(
                        "latestInterviewResult"
                    );


                if (!storedResult) {

                    throw new Error(
                        "Interview result could not be found."
                    );
                }


                const parsedResult =
                    JSON.parse(
                        storedResult
                    );


                if (
                    jobId &&
                    String(parsedResult.jobId) !==
                    String(jobId)
                ) {

                    throw new Error(
                        "This interview result does not belong to this job."
                    );
                }


                if (
                    !parsedResult.results ||
                    !Array.isArray(
                        parsedResult.results
                    )
                ) {

                    throw new Error(
                        "Invalid interview result."
                    );
                }


                setResult(
                    parsedResult
                );


            } catch (error) {

                console.error(
                    "Result loading error:",
                    error
                );


                setError(
                    error.response?.data ||
                    error.message ||
                    "Unable to load interview result."
                );


            } finally {

                setLoading(false);
            }
        };


        loadResult();

    }, [jobId, attemptId]);


    // ==========================================
    // CLEAR LATEST RESULT
    // ==========================================

    const clearLatestResult = () => {

        sessionStorage.removeItem(
            "latestInterviewResult"
        );
    };


    // ==========================================
    // DASHBOARD
    // ==========================================

    const handleDashboard = () => {

        clearLatestResult();

        navigate(
            "/candidate/dashboard"
        );
    };


    // ==========================================
    // JOBS
    // ==========================================

    const handleJobs = () => {

        clearLatestResult();

        navigate("/jobs");
    };


    // ==========================================
    // HISTORY
    // ==========================================

    const handleHistory = () => {

        clearLatestResult();

        navigate(
            "/candidate/interview/history"
        );
    };


    // ==========================================
    // RETAKE
    // ==========================================

    const handleRetake = () => {

        clearLatestResult();


        const selectedJobId =
            result?.jobId ||
            jobId;


        if (!selectedJobId) {

            navigate("/jobs");

            return;
        }


        navigate(
            `/candidate/interview/${selectedJobId}`
        );
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="page-center">

                <h2>
                    Loading interview result...
                </h2>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

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
                        onClick={
                            handleDashboard
                        }
                    >
                        <Icon name="left" /> Dashboard
                    </button>

                </nav>


                <main className="dashboard">

                    <div className="dashboard-card">

                        <h1>
                            Interview Result
                        </h1>


                        <div className="error-message">

                            {error}

                        </div>


                        <div
                            style={{
                                display:
                                    "flex",
                                gap:
                                    "10px",
                                flexWrap:
                                    "wrap",
                                marginTop:
                                    "20px"
                            }}
                        >

                            <button
                                className="primary-button"
                                onClick={
                                    handleHistory
                                }
                            >
                                Interview History
                            </button>


                            <button
                                className="secondary-button"
                                onClick={
                                    handleJobs
                                }
                            >
                                Find Jobs
                            </button>

                        </div>

                    </div>

                </main>

            </div>
        );
    }


    // ==========================================
    // RESULTS
    // ==========================================

    const results =
        result?.results || [];


    // ==========================================
    // SCORE
    // ==========================================

    const calculatedTotalScore =
        results.reduce(
            (sum, item) =>
                sum +
                Number(item.score || 0),
            0
        );


    const calculatedAverage =
        results.length > 0
            ? calculatedTotalScore /
            results.length
            : 0;


    const averageScore =
        result?.averageScore !== undefined &&
            result?.averageScore !== null

            ? Number(
                result.averageScore
            )

            : calculatedAverage;


    const roundedAverage =
        averageScore.toFixed(1);


    const percentage =
        result?.percentage !== undefined &&
            result?.percentage !== null

            ? Number(
                result.percentage
            )

            : Math.round(
                averageScore * 10
            );


    // ==========================================
    // OVERALL RATING
    // ==========================================

    let overallRating =
        result?.overallRating ||
        "Poor";


    if (!result?.overallRating) {

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
    }


    // ==========================================
    // SCORE MESSAGE
    // ==========================================

    let scoreMessage =
        "Keep practicing and improve your technical explanations.";


    if (averageScore >= 9) {

        scoreMessage =
            "Excellent performance! You are demonstrating strong interview readiness.";

    } else if (averageScore >= 8) {

        scoreMessage =
            "Very good performance. A little more practice can make your answers even stronger.";

    } else if (averageScore >= 7) {

        scoreMessage =
            "Good performance. Focus on improving depth and practical examples.";

    } else if (averageScore >= 5) {

        scoreMessage =
            "You have a foundation, but you should strengthen your concepts and explanations.";
    }


    // ==========================================
    // STRONG ANSWERS
    // ==========================================

    const strongAnswers =
        results.filter(
            (item) =>
                Number(
                    item.score || 0
                ) >= 7
        ).length;


    // ==========================================
    // WEAK ANSWERS
    // ==========================================

    const weakAnswers =
        results.filter(
            (item) =>
                Number(
                    item.score || 0
                ) < 5
        ).length;


    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div>

            {/* ======================================
                NAVBAR
            ====================================== */}

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
                    onClick={
                        handleDashboard
                    }
                >
                    <Icon name="left" /> Dashboard
                </button>

            </nav>


            {/* ======================================
                MAIN
            ====================================== */}

            <main className="dashboard">

                <div className="dashboard-card">

                    {/* ==================================
                        HEADER
                    ================================== */}

                    <div
                        style={{
                            textAlign:
                                "center",
                            marginBottom:
                                "30px"
                        }}
                    >

                        <h1>
                            <Icon name="celebration" /> Interview Completed
                        </h1>


                        {result?.jobTitle && (

                            <h2>
                                {result.jobTitle}
                            </h2>

                        )}


                        <p>
                            Here is your interview
                            performance report.
                        </p>

                    </div>


                    {/* ==================================
                        OVERALL SCORE
                    ================================== */}

                    <div
                        style={{
                            textAlign:
                                "center",
                            padding:
                                "30px",
                            border:
                                "1px solid #ddd",
                            borderRadius:
                                "15px",
                            marginBottom:
                                "30px"
                        }}
                    >

                        <div
                            style={{
                                fontSize:
                                    "64px",
                                fontWeight:
                                    "bold"
                            }}
                        >

                            {roundedAverage}

                            <span
                                style={{
                                    fontSize:
                                        "25px",
                                    color:
                                        "#777"
                                }}
                            >
                                /10
                            </span>

                        </div>


                        <h2>
                            {overallRating}
                        </h2>


                        <p>
                            Overall Score:{" "}
                            <strong>
                                {percentage}%
                            </strong>
                        </p>


                        <p>
                            {scoreMessage}
                        </p>

                    </div>


                    {/* ==================================
                        STATISTICS
                    ================================== */}

                    <div
                        style={{
                            display:
                                "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(160px, 1fr))",
                            gap:
                                "15px",
                            marginBottom:
                                "35px"
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
                                {results.length}
                            </h3>

                            <p>
                                Questions
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
                                {percentage}%
                            </h3>

                            <p>
                                Overall Score
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
                                {strongAnswers}
                            </h3>

                            <p>
                                Strong Answers
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
                                {weakAnswers}
                            </h3>

                            <p>
                                Weak Answers
                            </p>

                        </div>

                    </div>


                    {/* ==================================
                        DETAILED PERFORMANCE
                    ================================== */}

                    <h2
                        style={{
                            marginBottom:
                                "20px"
                        }}
                    >
                        <Icon name="analytics" /> Detailed Performance
                    </h2>


                    {results.map(
                        (item, index) => (

                            <div
                                key={
                                    item.questionId ||
                                    index
                                }
                                style={{
                                    border:
                                        "1px solid #ddd",
                                    borderRadius:
                                        "12px",
                                    padding:
                                        "25px",
                                    marginBottom:
                                        "20px"
                                }}
                            >

                                {/* QUESTION HEADER */}

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
                                            "wrap"
                                    }}
                                >

                                    <h3>
                                        Question{" "}
                                        {index + 1}
                                    </h3>


                                    <div
                                        style={{
                                            fontWeight:
                                                "bold",
                                            fontSize:
                                                "20px"
                                        }}
                                    >

                                        {item.score}

                                        <span
                                            style={{
                                                fontSize:
                                                    "14px",
                                                color:
                                                    "#777"
                                            }}
                                        >
                                            /10
                                        </span>

                                    </div>

                                </div>


                                {/* QUESTION */}

                                <p
                                    style={{
                                        fontWeight:
                                            "bold",
                                        fontSize:
                                            "17px",
                                        lineHeight:
                                            "1.5"
                                    }}
                                >
                                    {item.question}
                                </p>


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

                                    {item.category && (

                                        <span
                                            style={{
                                                padding:
                                                    "5px 10px",
                                                borderRadius:
                                                    "20px",
                                                background:
                                                    "#eff6ff"
                                            }}
                                        >
                                            <Icon name="book" />{" "}
                                            {item.category}
                                        </span>

                                    )}


                                    {item.technology && (

                                        <span
                                            style={{
                                                padding:
                                                    "5px 10px",
                                                borderRadius:
                                                    "20px",
                                                background:
                                                    "#ecfdf5"
                                            }}
                                        >
                                            <Icon name="code" />{" "}
                                            {item.technology}
                                        </span>

                                    )}


                                    {item.difficulty && (

                                        <span
                                            style={{
                                                padding:
                                                    "5px 10px",
                                                borderRadius:
                                                    "20px",
                                                background:
                                                    "#fef3c7"
                                            }}
                                        >
                                            <Icon name="target" />{" "}
                                            {item.difficulty}
                                        </span>

                                    )}

                                </div>


                                {/* SUBMITTED ANSWER */}

                                <div
                                    style={{
                                        marginBottom:
                                            "20px"
                                    }}
                                >

                                    <h4>
                                        <Icon name="file" /> Your Answer
                                    </h4>


                                    <div
                                        style={{
                                            padding:
                                                "15px",
                                            background:
                                                "#f8fafc",
                                            borderRadius:
                                                "10px",
                                            whiteSpace:
                                                "pre-wrap",
                                            lineHeight:
                                                "1.6"
                                        }}
                                    >
                                        {item.submittedAnswer ||
                                            "No answer provided."}
                                    </div>

                                </div>


                                {/* RATING */}

                                {item.rating && (

                                    <p>
                                        <strong>
                                            Rating:
                                        </strong>{" "}
                                        {item.rating}
                                    </p>

                                )}


                                {/* STRENGTHS */}

                                {item.strengths &&
                                    item.strengths.length >
                                    0 && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "20px"
                                            }}
                                        >

                                            <h4>
                                                <Icon name="success" /> Strengths
                                            </h4>


                                            <ul>

                                                {item.strengths.map(
                                                    (
                                                        strength,
                                                        strengthIndex
                                                    ) => (

                                                        <li
                                                            key={
                                                                strengthIndex
                                                            }
                                                        >
                                                            {strength}
                                                        </li>

                                                    )
                                                )}

                                            </ul>

                                        </div>

                                    )}


                                {/* WEAKNESSES */}

                                {item.weaknesses &&
                                    item.weaknesses.length >
                                    0 && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "20px"
                                            }}
                                        >

                                            <h4>
                                                <Icon name="warning" /> Areas to Improve
                                            </h4>


                                            <ul>

                                                {item.weaknesses.map(
                                                    (
                                                        weakness,
                                                        weaknessIndex
                                                    ) => (

                                                        <li
                                                            key={
                                                                weaknessIndex
                                                            }
                                                        >
                                                            {weakness}
                                                        </li>

                                                    )
                                                )}

                                            </ul>

                                        </div>

                                    )}


                                {/* SUGGESTIONS */}

                                {item.suggestions &&
                                    item.suggestions.length >
                                    0 && (

                                        <div
                                            style={{
                                                marginTop:
                                                    "20px"
                                            }}
                                        >

                                            <h4>
                                                <Icon name="idea" /> Suggestions
                                            </h4>


                                            <ul>

                                                {item.suggestions.map(
                                                    (
                                                        suggestion,
                                                        suggestionIndex
                                                    ) => (

                                                        <li
                                                            key={
                                                                suggestionIndex
                                                            }
                                                        >
                                                            {suggestion}
                                                        </li>

                                                    )
                                                )}

                                            </ul>

                                        </div>

                                    )}


                                {/* EXPECTED ANSWER */}

                                {item.expectedAnswer && (

                                    <div
                                        style={{
                                            marginTop:
                                                "20px"
                                        }}
                                    >

                                        <h4>
                                            <Icon name="book" /> Expected Answer
                                        </h4>


                                        <div
                                            style={{
                                                padding:
                                                    "15px",
                                                background:
                                                    "#f0fdf4",
                                                borderRadius:
                                                    "10px",
                                                whiteSpace:
                                                    "pre-wrap",
                                                lineHeight:
                                                    "1.6"
                                            }}
                                        >
                                            {
                                                item.expectedAnswer
                                            }
                                        </div>

                                    </div>

                                )}

                            </div>
                        )
                    )}


                    {/* ==================================
                        ACTION BUTTONS
                    ================================== */}

                    <div
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "center",
                            gap:
                                "10px",
                            flexWrap:
                                "wrap",
                            marginTop:
                                "30px"
                        }}
                    >

                        <button
                            className="primary-button"
                            onClick={
                                handleRetake
                            }
                        >
                            <Icon name="scan" /> Retake Interview
                        </button>


                        <button
                            className="secondary-button"
                            onClick={
                                handleHistory
                            }
                        >
                            <Icon name="analytics" /> Interview History
                        </button>


                        <button
                            className="secondary-button"
                            onClick={
                                handleJobs
                            }
                        >
                            <Icon name="search" /> Find Jobs
                        </button>


                        <button
                            className="secondary-button"
                            onClick={
                                handleDashboard
                            }
                        >
                            <Icon name="home" /> Dashboard
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default InterviewResult;