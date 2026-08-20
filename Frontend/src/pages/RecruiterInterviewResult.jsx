import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";

function RecruiterInterviewResult() {

    const navigate = useNavigate();

    const {
        jobId,
        applicationId
    } = useParams();


    // ==========================================
    // STATE
    // ==========================================

    const [interview, setInterview] =
        useState(null);

    const [result, setResult] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // The recruiter interview route contains only applicationId.
    // Recover the jobId from the saved interview result.
    const [resolvedJobId, setResolvedJobId] =
        useState(null);


    // ==========================================
    // LOAD INTERVIEW
    // ==========================================

    useEffect(() => {

        const loadInterview = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await api.get(
                        `/api/interview-attempts/application/${applicationId}`
                    );


                const data =
                    response.data;


                if (!data) {

                    throw new Error(
                        "Interview data not found."
                    );
                }


                if (!data.resultJson) {

                    throw new Error(
                        "Interview result data is not available."
                    );
                }


                let parsedResult;


                try {

                    parsedResult =
                        JSON.parse(
                            data.resultJson
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


                const recoveredJobId =
                    data?.jobId ??
                    data?.job?.jobId ??
                    parsedResult?.jobId ??
                    parsedResult?.job?.jobId ??
                    null;

                setResolvedJobId(
                    recoveredJobId !== null &&
                    recoveredJobId !== undefined &&
                    String(recoveredJobId).trim() !== ""
                        ? recoveredJobId
                        : null
                );

                setInterview(data);


                setResult(
                    parsedResult
                );


            } catch (error) {

                console.error(
                    "Recruiter interview error:",
                    error
                );


                const responseData =
                    error.response?.data;

                const message =
                    typeof responseData === "string"
                        ? responseData
                        : responseData?.message
                            ? String(responseData.message)
                            : error.message ||
                              "Unable to load interview result.";

                setError(message);


            } finally {

                setLoading(false);
            }
        };


        loadInterview();

    }, [applicationId]);


    // ==========================================
    // BACK TO APPLICANTS
    // ==========================================

    const handleBack = () => {

        const targetJobId =
            resolvedJobId ??
            interview?.jobId ??
            result?.jobId ??
            result?.job?.jobId ??
            jobId;

        if (
            targetJobId !== null &&
            targetJobId !== undefined &&
            String(targetJobId).trim() !== "" &&
            String(targetJobId) !== "undefined" &&
            String(targetJobId) !== "null"
        ) {
            navigate(
                `/recruiter/jobs/${targetJobId}/applicants`
            );
            return;
        }

        // Never navigate to /undefined. If the API did not return
        // a jobId, return to the page that opened this interview.
        navigate(-1);
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {

            return "Not available";
        }


        return new Date(date)
            .toLocaleString();
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="page-center">

                <h2>
                    Loading interview performance...
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
                        onClick={handleBack}
                    >
                        <Icon name="left" /> Applicants
                    </button>

                </nav>


                <main className="dashboard">

                    <div className="dashboard-card">

                        <h1>
                            <Icon name="interview" /> AI Interview
                        </h1>


                        <div className="error-message">

                            {error}

                        </div>


                        <button
                            className="primary-button"
                            onClick={handleBack}
                            style={{
                                marginTop: "20px"
                            }}
                        >
                            <Icon name="left" /> Back to Applicants
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // ==========================================
    // RESULT DATA
    // ==========================================

    const results =
        result?.results || [];


    const averageScore =
        interview?.averageScore !== null &&
            interview?.averageScore !== undefined

            ? Number(
                interview.averageScore
            )

            : results.length > 0

                ? results.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.score || 0
                        ),
                    0
                ) / results.length

                : 0;


    const percentage =
        interview?.percentage !== null &&
            interview?.percentage !== undefined

            ? Number(
                interview.percentage
            )

            : Math.round(
                averageScore * 10
            );


    const overallRating =
        interview?.overallRating ||
        result?.overallRating ||
        "Not available";


    const strongAnswers =
        results.filter(
            (item) =>
                Number(
                    item.score || 0
                ) >= 7
        ).length;


    const weakAnswers =
        results.filter(
            (item) =>
                Number(
                    item.score || 0
                ) < 5
        ).length;


    // ==========================================
    // PAGE
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
                    onClick={handleBack}
                >
                    <Icon name="left" /> Applicants
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
                            textAlign: "center",
                            marginBottom: "30px"
                        }}
                    >

                        <h1>
                            <Icon name="interview" /> AI Interview Performance
                        </h1>


                        <h2>
                            {
                                interview?.candidateName ||
                                "Candidate"
                            }
                        </h2>


                        <p>
                            <Icon name="email" />{" "}
                            {
                                interview?.candidateEmail ||
                                "Email not available"
                            }
                        </p>


                        <p>
                            <Icon name="briefcase" />{" "}
                            {
                                interview?.jobTitle ||
                                "Job"
                            }
                        </p>


                        <p>
                            <Icon name="calendar" /> Completed:{" "}
                            {
                                formatDate(
                                    interview?.completedAt
                                )
                            }
                        </p>

                    </div>


                    {/* ==================================
                        OVERALL SCORE
                    ================================== */}

                    <div
                        style={{
                            textAlign: "center",
                            padding: "30px",
                            border: "1px solid #ddd",
                            borderRadius: "15px",
                            marginBottom: "30px"
                        }}
                    >

                        <div
                            style={{
                                fontSize: "64px",
                                fontWeight: "bold"
                            }}
                        >

                            {
                                averageScore.toFixed(1)
                            }

                            <span
                                style={{
                                    fontSize: "25px",
                                    color: "#777"
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

                    </div>


                    {/* ==================================
                        STATISTICS
                    ================================== */}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(160px, 1fr))",
                            gap: "15px",
                            marginBottom: "35px"
                        }}
                    >

                        <div
                            style={{
                                padding: "20px",
                                border: "1px solid #ddd",
                                borderRadius: "12px",
                                textAlign: "center"
                            }}
                        >

                            <h3>
                                {
                                    results.length ||
                                    interview?.totalQuestions ||
                                    0
                                }
                            </h3>

                            <p>
                                Questions
                            </p>

                        </div>


                        <div
                            style={{
                                padding: "20px",
                                border: "1px solid #ddd",
                                borderRadius: "12px",
                                textAlign: "center"
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
                                padding: "20px",
                                border: "1px solid #ddd",
                                borderRadius: "12px",
                                textAlign: "center"
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
                                padding: "20px",
                                border: "1px solid #ddd",
                                borderRadius: "12px",
                                textAlign: "center"
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
                            marginBottom: "20px"
                        }}
                    >
                        <Icon name="analytics" /> Detailed Candidate Performance
                    </h2>


                    {results.length === 0 && (

                        <div className="empty-state">

                            <h3>
                                No detailed results available
                            </h3>

                        </div>

                    )}


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

                                        {
                                            item.score ||
                                            0
                                        }

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
                                    {
                                        item.question ||
                                        "Question not available"
                                    }
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


                                {/* ANSWER */}

                                <div
                                    style={{
                                        marginBottom:
                                            "20px"
                                    }}
                                >

                                    <h4>
                                        <Icon name="file" /> Candidate Answer
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
                                        {
                                            item.submittedAnswer ||
                                            "No answer provided."
                                        }
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
                        ACTIONS
                    ================================== */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginTop: "30px"
                        }}
                    >

                        <button
                            className="primary-button"
                            onClick={handleBack}
                        >
                            <Icon name="left" /> Back to Applicants
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default RecruiterInterviewResult;