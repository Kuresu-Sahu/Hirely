import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function ResumeAnalysisHistory() {
    const navigate = useNavigate();

    const {
        user,
        logout
    } = useAuth();

    const [analyses, setAnalyses] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // LOAD ANALYSIS HISTORY
    // =========================================================

    useEffect(() => {

        let mounted = true;


        const loadHistory = async () => {

            setLoading(true);

            setError("");


            try {

                const response =
                    await api.get(
                        "/api/resume-analysis/my"
                    );


                if (!mounted) {

                    return;
                }


                const data =
                    Array.isArray(response.data)
                        ? response.data
                        : [];


                setAnalyses(data);


            } catch (err) {

                console.error(
                    "Error loading resume analysis history:",
                    err
                );


                if (!mounted) {

                    return;
                }


                const message =
                    typeof err.response?.data === "string"

                        ? err.response.data

                        : err.response?.data?.message

                        ||
                          "Unable to load your resume analysis history.";


                setError(message);

                setAnalyses([]);


            } finally {

                if (mounted) {

                    setLoading(false);
                }
            }
        };


        loadHistory();


        return () => {

            mounted = false;
        };

    }, []);


    // =========================================================
    // SCORE COLOR
    // =========================================================

    const getScoreColor = (score) => {

        const numericScore =
            Number(score ?? 0);


        if (numericScore >= 85) {

            return "var(--success)";
        }


        if (numericScore >= 70) {

            return "var(--primary)";
        }


        if (numericScore >= 50) {

            return "var(--warning)";
        }


        return "var(--danger)";
    };


    // =========================================================
    // SCORE LABEL
    // =========================================================

    const getScoreLabel = (score) => {

        const numericScore =
            Number(score ?? 0);


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
    // DATE FORMAT
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
    // RENDER
    // =========================================================

    return (

        <div>


            {/* =================================================
                NAVBAR
            ================================================= */}

            <nav className="navbar">

                <div className="brand">

                    <img
                        src="/logo.png"
                        alt="Hirely"
                        className="brand-logo"
                    />

                </div>


                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px"
                    }}
                >

                    <NotificationBell />


                    <span>
                        Welcome, {
                            user?.name ||
                            "Candidate"
                        }
                    </span>


                    <button
                        type="button"
                        onClick={logout}
                        className="logout-button"
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="dashboard">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "20px",
                        flexWrap: "wrap",
                        marginBottom: "30px"
                    }}
                >

                    <div>

                        <h1
                            style={{
                                marginBottom: "8px"
                            }}
                        >
                            Resume Analysis History
                        </h1>


                        <p
                            style={{
                                marginBottom: 0
                            }}
                        >
                            Review your previous ATS scores,
                            matched keywords, and resume
                            improvement recommendations.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/candidate/dashboard"
                            )
                        }
                    >
                        <Icon name="left" />
                        Back to Dashboard
                    </button>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div
                        className="dashboard-card"
                        style={{
                            textAlign: "center",
                            padding: "55px 25px"
                        }}
                    >

                        <Icon
                            name="history"
                            size={34}
                        />


                        <h2
                            style={{
                                marginTop: "18px",
                                marginBottom: "8px"
                            }}
                        >
                            Loading analysis history...
                        </h2>


                        <p>
                            Please wait while we retrieve
                            your previous resume analyses.
                        </p>

                    </div>

                )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading && error && (

                    <div
                        className="dashboard-card"
                        style={{
                            textAlign: "center",
                            padding: "55px 25px",
                            borderColor:
                                "var(--danger)"
                        }}
                    >

                        <Icon
                            name="warning"
                            size={36}
                        />


                        <h2
                            style={{
                                marginTop: "18px",
                                marginBottom: "8px"
                            }}
                        >
                            Unable to Load Analysis History
                        </h2>


                        <p
                            style={{
                                marginBottom: "22px"
                            }}
                        >
                            {error}
                        </p>


                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "12px",
                                flexWrap: "wrap"
                            }}
                        >

                            <button
                                type="button"
                                className="primary-button"
                                onClick={() =>
                                    window.location.reload()
                                }
                            >
                                <Icon name="history" />
                                Try Again
                            </button>


                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    navigate(
                                        "/candidate/dashboard"
                                    )
                                }
                            >
                                <Icon name="left" />
                                Back to Dashboard
                            </button>

                        </div>

                    </div>

                )}


                {/* =================================================
                    EMPTY HISTORY
                ================================================= */}

                {!loading &&
                    !error &&
                    analyses.length === 0 && (

                        <div
                            className="dashboard-card"
                            style={{
                                textAlign: "center",
                                padding: "60px 25px"
                            }}
                        >

                            <Icon
                                name="fileSearch"
                                size={42}
                            />


                            <h2
                                style={{
                                    marginTop: "18px",
                                    marginBottom: "8px"
                                }}
                            >
                                No Resume Analyses Yet
                            </h2>


                            <p
                                style={{
                                    marginBottom: "24px"
                                }}
                            >
                                Analyze your resume against
                                a job to see the ATS score
                                and recommendations here.
                            </p>


                            <button
                                type="button"
                                className="primary-button"
                                onClick={() =>
                                    navigate("/jobs")
                                }
                            >
                                <Icon name="search" />
                                Find Jobs
                            </button>

                        </div>

                    )}


                {/* =================================================
                    ANALYSIS HISTORY
                ================================================= */}

                {!loading &&
                    !error &&
                    analyses.length > 0 && (

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(300px, 1fr))",
                                gap: "18px"
                            }}
                        >

                            {analyses.map((item) => {

                                const score =
                                    Number(
                                        item.atsScore ?? 0
                                    );


                                const scoreColor =
                                    getScoreColor(score);


                                return (

                                    <article
                                        key={
                                            item.analysisId
                                        }
                                        className="dashboard-card"
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            minHeight: "265px",
                                            cursor: "pointer"
                                        }}
                                        onClick={() =>
                                            navigate(
                                                `/resume-analysis/history/${item.analysisId}`
                                            )
                                        }
                                    >


                                        {/* =================================================
                                            CARD HEADER
                                        ================================================= */}

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "flex-start",
                                                gap: "15px",
                                                marginBottom:
                                                    "20px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "10px",
                                                    minWidth: 0
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width: "42px",
                                                        height: "42px",
                                                        flexShrink: 0,
                                                        display:
                                                            "grid",
                                                        placeItems:
                                                            "center",
                                                        borderRadius:
                                                            "12px",
                                                        background:
                                                            "var(--primary-light)",
                                                        color:
                                                            "var(--primary)"
                                                    }}
                                                >
                                                    <Icon
                                                        name="fileSearch"
                                                    />
                                                </div>


                                                <div
                                                    style={{
                                                        minWidth: 0
                                                    }}
                                                >

                                                    <h2
                                                        style={{
                                                            margin: 0,
                                                            fontSize:
                                                                "18px",
                                                            overflow:
                                                                "hidden",
                                                            textOverflow:
                                                                "ellipsis",
                                                            whiteSpace:
                                                                "nowrap"
                                                        }}
                                                        title={
                                                            item.jobTitle ||
                                                            "Job Analysis"
                                                        }
                                                    >
                                                        {
                                                            item.jobTitle ||
                                                            "Job Analysis"
                                                        }
                                                    </h2>


                                                    <p
                                                        style={{
                                                            margin:
                                                                "4px 0 0",
                                                            color:
                                                                "var(--text-muted)",
                                                            fontSize:
                                                                "13px"
                                                        }}
                                                    >
                                                        {
                                                            formatDate(
                                                                item.analyzedAt
                                                            )
                                                        }
                                                    </p>

                                                </div>

                                            </div>


                                            {/* =================================================
                                                SCORE
                                            ================================================= */}

                                            <div
                                                style={{
                                                    flexShrink: 0,
                                                    textAlign: "center",
                                                    minWidth: "72px"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        fontSize:
                                                            "28px",
                                                        fontWeight:
                                                            800,
                                                        lineHeight:
                                                            1,
                                                        color:
                                                            scoreColor
                                                    }}
                                                >
                                                    {score}
                                                </div>


                                                <div
                                                    style={{
                                                        marginTop:
                                                            "5px",
                                                        fontSize:
                                                            "11px",
                                                        color:
                                                            "var(--text-muted)",
                                                        fontWeight:
                                                            600
                                                    }}
                                                >
                                                    ATS SCORE
                                                </div>

                                            </div>

                                        </div>


                                        {/* =================================================
                                            SCORE BAR
                                        ================================================= */}

                                        <div
                                            style={{
                                                height: "8px",
                                                width: "100%",
                                                borderRadius:
                                                    "999px",
                                                background:
                                                    "var(--surface-soft)",
                                                overflow:
                                                    "hidden",
                                                marginBottom:
                                                    "10px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        Math.max(
                                                            0,
                                                            score
                                                        )
                                                    )}%`,
                                                    height: "100%",
                                                    borderRadius:
                                                        "999px",
                                                    background:
                                                        scoreColor,
                                                    transition:
                                                        "width 0.25s ease"
                                                }}
                                            />

                                        </div>


                                        {/* =================================================
                                            SCORE INFORMATION
                                        ================================================= */}

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                                gap: "12px",
                                                marginBottom:
                                                    "22px"
                                            }}
                                        >

                                            <span
                                                style={{
                                                    color:
                                                        scoreColor,
                                                    fontWeight:
                                                        700,
                                                    fontSize:
                                                        "14px"
                                                }}
                                            >
                                                {
                                                    getScoreLabel(
                                                        score
                                                    )
                                                }
                                            </span>


                                            <span
                                                style={{
                                                    color:
                                                        "var(--text-muted)",
                                                    fontSize:
                                                        "13px"
                                                }}
                                            >
                                                Analysis #
                                                {
                                                    item.analysisId
                                                }
                                            </span>

                                        </div>


                                        {/* =================================================
                                            VIEW BUTTON
                                        ================================================= */}

                                        <div
                                            style={{
                                                marginTop:
                                                    "auto"
                                            }}
                                        >

                                            <button
                                                type="button"
                                                className="primary-button"
                                                style={{
                                                    width:
                                                        "100%"
                                                }}
                                                onClick={(
                                                    event
                                                ) => {

                                                    event.stopPropagation();


                                                    navigate(
                                                        `/resume-analysis/history/${item.analysisId}`
                                                    );

                                                }}
                                            >

                                                <Icon
                                                    name="eye"
                                                />

                                                View Analysis

                                            </button>

                                        </div>

                                    </article>

                                );

                            })}

                        </div>

                    )}

            </main>

        </div>
    );
}


export default ResumeAnalysisHistory;