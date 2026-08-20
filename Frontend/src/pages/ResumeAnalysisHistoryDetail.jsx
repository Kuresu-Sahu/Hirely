import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";


function ResumeAnalysisHistoryDetail() {

    const { analysisId } = useParams();

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [analysis, setAnalysis] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // LOAD ANALYSIS
    // =========================================================

    useEffect(() => {

        const loadAnalysis = async () => {

            setLoading(true);

            setError("");


            try {

                const response =
                    await api.get(
                        `/api/resume-analysis/${analysisId}`
                    );


                setAnalysis(
                    response.data
                );


            } catch (error) {

                console.error(
                    "Error loading resume analysis:",
                    error
                );


                const message =
                    typeof error.response?.data === "string"

                        ? error.response.data

                        : error.response?.data?.message

                        || "Unable to load this resume analysis.";


                setError(message);


            } finally {

                setLoading(false);
            }
        };


        if (analysisId) {

            loadAnalysis();

        } else {

            setError(
                "Analysis ID is missing."
            );

            setLoading(false);
        }


    }, [analysisId]);


    // =========================================================
    // SCORE COLOR
    // =========================================================

    const getScoreColor = (score) => {

        const numericScore =
            Number(score || 0);


        if (numericScore >= 85) {

            return "#16a34a";
        }


        if (numericScore >= 70) {

            return "#2563eb";
        }


        if (numericScore >= 50) {

            return "#d97706";
        }


        return "#dc2626";
    };


    // =========================================================
    // SCORE LABEL
    // =========================================================

    const getScoreLabel = (score) => {

        const numericScore =
            Number(score || 0);


        if (numericScore >= 85) {

            return "Excellent";
        }


        if (numericScore >= 70) {

            return "Good";
        }


        if (numericScore >= 50) {

            return "Moderate";
        }


        return "Needs Improvement";
    };


    // =========================================================
    // SAFE ARRAY
    // =========================================================

    const safeArray = (value) => {

        if (!Array.isArray(value)) {

            return [];
        }


        return value.filter(
            item =>
                item !== null &&
                item !== undefined &&
                String(item).trim() !== ""
        );
    };


    // =========================================================
    // DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {

            return "Date unavailable";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "Date unavailable";
        }


        return parsedDate.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    };


    // =========================================================
    // LIST
    // =========================================================

    const renderList = (
        items,
        emptyMessage,
        type = "normal"
    ) => {

        const safeItems =
            safeArray(items);


        if (
            safeItems.length === 0
        ) {

            return (

                <div
                    style={{
                        padding: "15px 0",
                        color: "#6b7280",
                        lineHeight: "1.6"
                    }}
                >
                    {emptyMessage}
                </div>
            );
        }


        return (

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "11px",
                    marginTop: "17px"
                }}
            >

                {safeItems.map(
                    (item, index) => (

                        <div
                            key={`${type}-${index}`}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "11px",
                                padding: "12px 14px",
                                borderRadius: "10px",
                                background:
                                    type === "missing"
                                        ? "#fff7ed"
                                        : type === "strength"
                                            ? "#f0fdf4"
                                            : "#f8fafc"
                            }}
                        >

                            <span
                                style={{
                                    flexShrink: 0,
                                    fontSize: "16px"
                                }}
                            >

                                {type === "missing"
                                    ? "⚠️"
                                    : type === "strength"
                                        ? "✓"
                                        : "•"}

                            </span>


                            <span
                                style={{
                                    color: "#374151",
                                    lineHeight: "1.6"
                                }}
                            >
                                {item}
                            </span>

                        </div>
                    )
                )}

            </div>
        );
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div
                className="page-center"
                style={{
                    minHeight: "70vh"
                }}
            >

                <div
                    style={{
                        textAlign: "center"
                    }}
                >

                    <div
                        style={{
                            fontSize: "45px",
                            marginBottom: "15px"
                        }}
                    >
                        📊
                    </div>


                    <h2>
                        Loading Analysis...
                    </h2>


                    <p
                        style={{
                            color: "#6b7280"
                        }}
                    >
                        Retrieving your saved resume analysis.
                    </p>

                </div>

            </div>
        );
    }


    // =========================================================
    // ERROR / NOT FOUND
    // =========================================================

    if (!analysis) {

        return (

            <div
                className="page-center"
                style={{
                    minHeight: "70vh",
                    padding: "30px"
                }}
            >

                <div
                    style={{
                        textAlign: "center",
                        maxWidth: "500px"
                    }}
                >

                    <div
                        style={{
                            fontSize: "50px",
                            marginBottom: "15px"
                        }}
                    >
                        ⚠️
                    </div>


                    <h2>
                        Unable to Load Analysis
                    </h2>


                    <p
                        style={{
                            color: "#6b7280",
                            lineHeight: "1.6"
                        }}
                    >
                        {error ||
                            "This analysis could not be found."}
                    </p>


                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                "/resume-analysis/history"
                            )
                        }
                    >
                        ← Back to History
                    </button>

                </div>

            </div>
        );
    }


    // =========================================================
    // VALUES
    // =========================================================

    const score =
        Number(
            analysis.atsScore || 0
        );


    const matchedKeywords =
        safeArray(
            analysis.matchedKeywords
        );


    const missingKeywords =
        safeArray(
            analysis.missingKeywords
        );


    const strengths =
        safeArray(
            analysis.strengths
        );


    const suggestions =
        safeArray(
            analysis.suggestions
        );


    const totalKeywords =
        matchedKeywords.length +
        missingKeywords.length;


    const keywordCoverage =
        totalKeywords > 0

            ? Math.round(
                (
                    matchedKeywords.length /
                    totalKeywords
                ) * 100
            )

            : 0;


    // =========================================================
    // MAIN
    // =========================================================

    return (

        <div
            style={{
                minHeight: "100vh",
                background: "#f8fafc"
            }}
        >

            {/* =================================================
                NAVBAR
            ================================================= */}

            <nav
                className="navbar"
                style={{
                    background: "white",
                    borderBottom:
                        "1px solid #e5e7eb"
                }}
            >

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
                            "/resume-analysis/history"
                        )
                    }
                >
                    ← Analysis History
                </button>

            </nav>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    padding:
                        "35px 20px 60px"
                }}
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    style={{
                        marginBottom: "25px"
                    }}
                >

                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "7px 12px",
                            borderRadius: "999px",
                            background: "#eef2ff",
                            color: "#4338ca",
                            fontSize: "13px",
                            fontWeight: "600",
                            marginBottom: "12px"
                        }}
                    >
                        📊 Saved Analysis
                    </div>


                    <h1
                        style={{
                            marginBottom: "9px"
                        }}
                    >
                        {analysis.jobTitle ||
                            "Resume Analysis"}
                    </h1>


                    <p
                        style={{
                            color: "#6b7280",
                            margin: 0
                        }}
                    >
                        Analyzed on{" "}
                        {formatDate(
                            analysis.analyzedAt
                        )}
                    </p>

                </div>


                {/* =================================================
                    SCORE + KEYWORD SUMMARY
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "minmax(260px, 1fr) minmax(320px, 1.5fr)",
                        gap: "22px",
                        marginBottom: "22px"
                    }}
                >

                    {/* SCORE */}

                    <div
                        style={{
                            background: "white",
                            padding: "30px",
                            borderRadius: "16px",
                            border:
                                "1px solid #e5e7eb",
                            boxShadow:
                                "0 4px 18px rgba(0,0,0,0.04)",
                            textAlign: "center"
                        }}
                    >

                        <div
                            style={{
                                color: "#6b7280",
                                fontSize: "13px",
                                fontWeight: "700",
                                letterSpacing: "0.5px"
                            }}
                        >
                            ATS SCORE
                        </div>


                        <div
                            style={{
                                fontSize: "72px",
                                fontWeight: "800",
                                lineHeight: "1",
                                color:
                                    getScoreColor(
                                        score
                                    ),
                                margin:
                                    "18px 0 8px"
                            }}
                        >
                            {score}
                        </div>


                        <div
                            style={{
                                color: "#6b7280"
                            }}
                        >
                            out of 100
                        </div>


                        <div
                            style={{
                                display: "inline-block",
                                marginTop: "15px",
                                padding:
                                    "7px 14px",
                                borderRadius:
                                    "999px",
                                background:
                                    `${getScoreColor(
                                        score
                                    )}15`,
                                color:
                                    getScoreColor(
                                        score
                                    ),
                                fontWeight: "700"
                            }}
                        >
                            {getScoreLabel(
                                score
                            )}
                        </div>

                    </div>


                    {/* KEYWORD SUMMARY */}

                    <div
                        style={{
                            background: "white",
                            padding: "30px",
                            borderRadius: "16px",
                            border:
                                "1px solid #e5e7eb",
                            boxShadow:
                                "0 4px 18px rgba(0,0,0,0.04)"
                        }}
                    >

                        <h2
                            style={{
                                marginTop: 0
                            }}
                        >
                            📊 Keyword Match
                        </h2>


                        <p
                            style={{
                                color: "#6b7280",
                                lineHeight: "1.6"
                            }}
                        >
                            This shows how many detected
                            job-relevant keywords were found
                            in the saved resume analysis.
                        </p>


                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                marginBottom: "8px"
                            }}
                        >

                            <strong>
                                Keyword Coverage
                            </strong>


                            <strong
                                style={{
                                    color: "#2563eb"
                                }}
                            >
                                {keywordCoverage}%
                            </strong>

                        </div>


                        <div
                            style={{
                                height: "10px",
                                background: "#e5e7eb",
                                borderRadius: "999px",
                                overflow: "hidden"
                            }}
                        >

                            <div
                                style={{
                                    width:
                                        `${keywordCoverage}%`,
                                    height: "100%",
                                    background: "#2563eb",
                                    borderRadius: "999px"
                                }}
                            />

                        </div>


                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(3, 1fr)",
                                gap: "12px",
                                marginTop: "24px"
                            }}
                        >

                            <div
                                style={{
                                    background: "#f0fdf4",
                                    padding: "15px",
                                    borderRadius: "11px"
                                }}
                            >

                                <div
                                    style={{
                                        fontSize: "25px",
                                        fontWeight: "800",
                                        color: "#16a34a"
                                    }}
                                >
                                    {matchedKeywords.length}
                                </div>


                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#166534"
                                    }}
                                >
                                    Matched
                                </div>

                            </div>


                            <div
                                style={{
                                    background: "#fff7ed",
                                    padding: "15px",
                                    borderRadius: "11px"
                                }}
                            >

                                <div
                                    style={{
                                        fontSize: "25px",
                                        fontWeight: "800",
                                        color: "#ea580c"
                                    }}
                                >
                                    {missingKeywords.length}
                                </div>


                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#9a3412"
                                    }}
                                >
                                    Missing
                                </div>

                            </div>


                            <div
                                style={{
                                    background: "#f8fafc",
                                    padding: "15px",
                                    borderRadius: "11px"
                                }}
                            >

                                <div
                                    style={{
                                        fontSize: "25px",
                                        fontWeight: "800",
                                        color: "#475569"
                                    }}
                                >
                                    {totalKeywords}
                                </div>


                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#475569"
                                    }}
                                >
                                    Total
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    MATCHED / MISSING KEYWORDS
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "22px",
                        marginBottom: "22px"
                    }}
                >

                    {/* MATCHED */}

                    <div
                        style={{
                            background: "white",
                            padding: "30px",
                            borderRadius: "16px",
                            border:
                                "1px solid #e5e7eb",
                            boxShadow:
                                "0 4px 18px rgba(0,0,0,0.04)"
                        }}
                    >

                        <h2
                            style={{
                                marginTop: 0
                            }}
                        >
                            ✅ Matched Keywords
                        </h2>


                        <p
                            style={{
                                color: "#6b7280",
                                lineHeight: "1.6"
                            }}
                        >
                            Keywords detected in your resume
                            that matched the job requirements.
                        </p>


                        {renderList(
                            matchedKeywords,
                            "No matched keywords were recorded.",
                            "strength"
                        )}

                    </div>


                    {/* MISSING */}

                    <div
                        style={{
                            background: "white",
                            padding: "30px",
                            borderRadius: "16px",
                            border:
                                "1px solid #e5e7eb",
                            boxShadow:
                                "0 4px 18px rgba(0,0,0,0.04)"
                        }}
                    >

                        <h2
                            style={{
                                marginTop: 0
                            }}
                        >
                            ⚠️ Missing Keywords
                        </h2>


                        <p
                            style={{
                                color: "#6b7280",
                                lineHeight: "1.6"
                            }}
                        >
                            Job-related keywords that were not
                            detected in the saved analysis.
                        </p>


                        {renderList(
                            missingKeywords,
                            "No missing keywords were recorded.",
                            "missing"
                        )}

                    </div>

                </div>


                {/* =================================================
                    STRENGTHS
                ================================================= */}

                <div
                    style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "16px",
                        marginBottom: "22px",
                        border:
                            "1px solid #e5e7eb",
                        boxShadow:
                            "0 4px 18px rgba(0,0,0,0.04)"
                    }}
                >

                    <h2
                        style={{
                            marginTop: 0
                        }}
                    >
                        💪 Strengths
                    </h2>


                    <p
                        style={{
                            color: "#6b7280",
                            lineHeight: "1.6"
                        }}
                    >
                        Positive aspects identified during
                        the original analysis.
                    </p>


                    {renderList(
                        strengths,
                        "No strengths were recorded.",
                        "strength"
                    )}

                </div>


                {/* =================================================
                    SUGGESTIONS
                ================================================= */}

                <div
                    style={{
                        background: "white",
                        padding: "30px",
                        borderRadius: "16px",
                        marginBottom: "25px",
                        border:
                            "1px solid #e5e7eb",
                        boxShadow:
                            "0 4px 18px rgba(0,0,0,0.04)"
                    }}
                >

                    <h2
                        style={{
                            marginTop: 0
                        }}
                    >
                        💡 Suggestions
                    </h2>


                    <p
                        style={{
                            color: "#6b7280",
                            lineHeight: "1.6"
                        }}
                    >
                        Recommendations saved from the original
                        resume analysis.
                    </p>


                    {renderList(
                        suggestions,
                        "No suggestions were recorded."
                    )}

                </div>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        flexWrap: "wrap"
                    }}
                >

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/resume-analysis/history"
                            )
                        }
                    >
                        ← Analysis History
                    </button>


                    {analysis.jobId && (

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    `/resume-analysis/${analysis.jobId}`
                                )
                            }
                        >
                            🔄 Analyze Again
                        </button>
                    )}


                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/jobs")
                        }
                    >
                        🔎 Find Jobs
                    </button>

                </div>

            </main>

        </div>
    );
}


export default ResumeAnalysisHistoryDetail;