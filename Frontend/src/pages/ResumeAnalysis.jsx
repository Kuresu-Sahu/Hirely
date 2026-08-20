import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";


function ResumeAnalysis() {

    const { jobId } = useParams();

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [job, setJob] = useState(null);

    const [resume, setResume] = useState(null);

    const [analysis, setAnalysis] = useState(null);

    const [loading, setLoading] = useState(true);

    const [analyzing, setAnalyzing] = useState(false);

    const [error, setError] = useState("");


    // =========================================================
    // LOAD JOB + RESUME
    // =========================================================

    useEffect(() => {

        const loadData = async () => {

            setLoading(true);

            setError("");


            try {

                const [
                    jobResponse,
                    resumeResponse
                ] = await Promise.all([

                    api.get(
                        `/api/jobs/${jobId}`
                    ),

                    api.get(
                        "/api/resumes/my"
                    )

                ]);


                setJob(
                    jobResponse.data
                );


                setResume(
                    resumeResponse.data
                );


            } catch (error) {

                console.error(
                    "Error loading resume analysis page:",
                    error
                );


                const message =
                    typeof error.response?.data === "string"

                        ? error.response.data

                        : "Unable to load job or resume information.";


                setError(
                    message
                );


            } finally {

                setLoading(false);
            }
        };


        if (jobId) {

            loadData();

        } else {

            setError(
                "No job was selected for resume analysis."
            );

            setLoading(false);
        }


    }, [jobId]);


    // =========================================================
    // ANALYZE RESUME
    // =========================================================

    const handleAnalyze = async () => {

        setAnalyzing(true);

        setError("");

        setAnalysis(null);


        try {

            const response =
                await api.post(
                    `/api/ai/analyze/${jobId}`
                );


            setAnalysis(
                response.data
            );


        } catch (error) {

            console.error(
                "Resume analysis error:",
                error
            );


            const message =
                typeof error.response?.data === "string"

                    ? error.response.data

                    : error.response?.data?.message

                    || "Unable to analyze your resume. Please try again.";


            setError(
                message
            );


        } finally {

            setAnalyzing(false);
        }
    };


    // =========================================================
    // SCORE HELPERS
    // =========================================================

    const getScoreColor = (score) => {

        if (score >= 85) {

            return "#16a34a";
        }


        if (score >= 70) {

            return "#2563eb";
        }


        if (score >= 50) {

            return "#d97706";
        }


        return "#dc2626";
    };


    const getScoreLabel = (score) => {

        if (score >= 85) {

            return "Excellent";
        }


        if (score >= 70) {

            return "Good";
        }


        if (score >= 50) {

            return "Moderate";
        }


        return "Needs Improvement";
    };


    const getScoreMessage = (score) => {

        if (score >= 85) {

            return "Your resume is strongly aligned with this job.";

        }


        if (score >= 70) {

            return "Your resume is a good match, but a few improvements can make it stronger.";

        }


        if (score >= 50) {

            return "Your resume has a moderate match and should be tailored more closely to this job.";

        }


        return "Your resume needs significant improvement to become a stronger match for this job.";
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
    // ANALYSIS SUMMARY
    // =========================================================

    const analysisSummary = useMemo(() => {

        if (!analysis) {

            return {
                matched: 0,
                missing: 0,
                totalSkills: 0,
                skillCoverage: 0
            };
        }


        const matched =
            safeArray(
                analysis.matchedSkills
            );


        const missing =
            safeArray(
                analysis.missingSkills
            );


        const totalSkills =
            matched.length +
            missing.length;


        const skillCoverage =
            totalSkills > 0

                ? Math.round(
                    (
                        matched.length /
                        totalSkills
                    ) * 100
                )

                : 0;


        return {

            matched: matched.length,

            missing: missing.length,

            totalSkills,

            skillCoverage
        };


    }, [analysis]);


    // =========================================================
    // LIST COMPONENT
    // =========================================================

    const renderList = (
        items,
        emptyMessage,
        type = "normal"
    ) => {

        const safeItems =
            safeArray(
                items
            );


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
                    gap: "12px",
                    marginTop: "18px"
                }}
            >

                {safeItems.map(
                    (item, index) => (

                        <div
                            key={`${type}-${index}`}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
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
                                    fontSize: "17px",
                                    flexShrink: 0
                                }}
                            >

                                {type === "missing"
                                    ? <Icon name="warning" size={17} />
                                    : type === "strength"
                                        ? <Icon name="check" size={17} />
                                        : <Icon name="circle" size={8} />}

                            </span>


                            <span
                                style={{
                                    lineHeight: "1.6",
                                    color: "#374151"
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
                            fontSize: "42px",
                            marginBottom: "15px"
                        }}
                    >
                        <Icon name="bot" />
                    </div>


                    <h2>
                        Loading Resume Analyzer...
                    </h2>


                    <p
                        style={{
                            color: "#6b7280"
                        }}
                    >
                        Preparing your job and resume information.
                    </p>

                </div>

            </div>
        );
    }


    // =========================================================
    // JOB NOT FOUND
    // =========================================================

    if (!job) {

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
                        textAlign: "center"
                    }}
                >

                    <div
                        style={{
                            fontSize: "50px",
                            marginBottom: "15px"
                        }}
                    >
                        <Icon name="warning" />
                    </div>


                    <h2>
                        {error || "Job not found"}
                    </h2>


                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/jobs")
                        }
                    >
                        Back to Jobs
                    </button>

                </div>

            </div>
        );
    }


    // =========================================================
    // MAIN PAGE
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
                            `/jobs/${job.id}`
                        )
                    }
                >
                    <Icon name="left" /> Back to Job
                </button>

            </nav>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main
                style={{
                    maxWidth: "1150px",
                    margin: "0 auto",
                    padding: "35px 20px 60px"
                }}
            >

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div
                    style={{
                        marginBottom: "28px"
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
                        <Icon name="bot" /> Resume Intelligence
                    </div>


                    <h1
                        style={{
                            marginBottom: "10px"
                        }}
                    >
                        Resume Analyzer
                    </h1>


                    <p
                        style={{
                            color: "#6b7280",
                            lineHeight: "1.7",
                            maxWidth: "750px",
                            margin: 0
                        }}
                    >
                        Compare your resume against this job
                        and identify the skills, strengths and
                        improvements that can increase your match.
                    </p>

                </div>


                {/* =================================================
                    JOB CARD
                ================================================= */}

                <div
                    style={{
                        background: "white",
                        padding: "25px",
                        borderRadius: "16px",
                        marginBottom: "22px",
                        border:
                            "1px solid #e5e7eb",
                        boxShadow:
                            "0 4px 18px rgba(0,0,0,0.04)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "20px",
                            flexWrap: "wrap"
                        }}
                    >

                        <div>

                            <p
                                style={{
                                    margin: "0 0 7px",
                                    color: "#6b7280",
                                    fontSize: "14px"
                                }}
                            >
                                Analyzing resume for
                            </p>


                            <h2
                                style={{
                                    margin: 0
                                }}
                            >
                                {job.title}
                            </h2>


                            <p
                                style={{
                                    margin:
                                        "8px 0 0",
                                    color: "#4b5563"
                                }}
                            >
                                <Icon name="building" />{" "}
                                {job.company?.name ||
                                    "Company"}
                            </p>

                        </div>


                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap"
                            }}
                        >

                            <span
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    fontSize: "14px"
                                }}
                            >
                                <Icon name="pin" /> {job.location ||
                                    "Location not specified"}
                            </span>


                            <span
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    fontSize: "14px"
                                }}
                            >
                                <Icon name="briefcase" /> {job.experience ||
                                    "Experience not specified"}
                            </span>


                            <span
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    fontSize: "14px"
                                }}
                            >
                                <Icon name="tag" /> {job.jobType ||
                                    "Job type not specified"}
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    RESUME CARD
                ================================================= */}

                <div
                    style={{
                        background: "white",
                        padding: "25px",
                        borderRadius: "16px",
                        marginBottom: "22px",
                        border:
                            "1px solid #e5e7eb",
                        boxShadow:
                            "0 4px 18px rgba(0,0,0,0.04)"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "20px",
                            flexWrap: "wrap"
                        }}
                    >

                        <div>

                            <h2
                                style={{
                                    marginTop: 0,
                                    marginBottom: "8px"
                                }}
                            >
                                <Icon name="file" /> Your Resume
                            </h2>


                            {resume ? (

                                <>

                                    <p
                                        style={{
                                            margin:
                                                "0 0 5px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        {resume.fileName}
                                    </p>


                                    <p
                                        style={{
                                            margin: 0,
                                            color: "#6b7280",
                                            lineHeight: "1.5"
                                        }}
                                    >
                                        This resume will be
                                        compared with the selected
                                        job description.
                                    </p>

                                </>

                            ) : (

                                <p
                                    style={{
                                        color: "#6b7280"
                                    }}
                                >
                                    You have not uploaded a resume yet.
                                </p>

                            )}

                        </div>


                        {resume ? (

                            <button
                                className="primary-button"
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                style={{
                                    minWidth: "190px"
                                }}
                            >

                                {analyzing
                                    ? "Analyzing..."
                                    : analysis
                                        ? "Analyze Again"
                                        : <><Icon name="bot" /> Analyze My Resume</>}

                            </button>

                        ) : (

                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate("/resume")
                                }
                            >
                                Upload Resume
                            </button>

                        )}

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        className="error-message"
                        style={{
                            marginBottom: "22px",
                            padding: "15px",
                            borderRadius: "10px"
                        }}
                    >
                        {error}
                    </div>
                )}


                {/* =================================================
                    ANALYZING STATE
                ================================================= */}

                {analyzing && (

                    <div
                        style={{
                            background: "white",
                            padding: "30px",
                            borderRadius: "16px",
                            marginBottom: "22px",
                            border:
                                "1px solid #e5e7eb",
                            textAlign: "center"
                        }}
                    >

                        <div
                            style={{
                                fontSize: "38px",
                                marginBottom: "10px"
                            }}
                        >
                            <Icon name="search" />
                        </div>


                        <h2
                            style={{
                                marginBottom: "8px"
                            }}
                        >
                            Analyzing your resume
                        </h2>


                        <p
                            style={{
                                color: "#6b7280",
                                margin: 0
                            }}
                        >
                            Comparing your resume with the job
                            requirements. This may take a moment.
                        </p>

                    </div>
                )}


                {/* =================================================
                    ANALYSIS RESULT
                ================================================= */}

                {analysis && !analyzing && (

                    <div>

                        {/* =================================================
                            SCORE + SUMMARY
                        ================================================= */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "minmax(260px, 1fr) minmax(300px, 1.5fr)",
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

                                <p
                                    style={{
                                        margin: 0,
                                        color: "#6b7280",
                                        fontWeight: "600"
                                    }}
                                >
                                    ATS COMPATIBILITY
                                </p>


                                <div
                                    style={{
                                        fontSize: "72px",
                                        fontWeight: "800",
                                        lineHeight: "1",
                                        color:
                                            getScoreColor(
                                                analysis.atsScore
                                            ),
                                        margin:
                                            "18px 0 8px"
                                    }}
                                >
                                    {analysis.atsScore ?? 0}
                                </div>


                                <div
                                    style={{
                                        color: "#6b7280",
                                        fontWeight: "600"
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
                                                analysis.atsScore
                                            )}15`,
                                        color:
                                            getScoreColor(
                                                analysis.atsScore
                                            ),
                                        fontWeight: "700"
                                    }}
                                >
                                    {getScoreLabel(
                                        analysis.atsScore
                                    )}
                                </div>


                                <p
                                    style={{
                                        color: "#6b7280",
                                        lineHeight: "1.6",
                                        marginBottom: 0
                                    }}
                                >
                                    {getScoreMessage(
                                        analysis.atsScore
                                    )}
                                </p>

                            </div>


                            {/* SUMMARY */}

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
                                    <Icon name="analytics" /> Match Summary
                                </h2>


                                <p
                                    style={{
                                        color: "#6b7280",
                                        lineHeight: "1.6"
                                    }}
                                >
                                    Your resume was compared
                                    against the detected
                                    job-relevant skills.
                                </p>


                                {/* SKILL COVERAGE */}

                                <div
                                    style={{
                                        marginTop: "20px"
                                    }}
                                >

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            marginBottom: "8px"
                                        }}
                                    >

                                        <strong>
                                            Skill Coverage
                                        </strong>


                                        <strong
                                            style={{
                                                color: "#2563eb"
                                            }}
                                        >
                                            {analysisSummary.skillCoverage}%
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
                                                    `${analysisSummary.skillCoverage}%`,
                                                height: "100%",
                                                background: "#2563eb",
                                                borderRadius: "999px",
                                                transition:
                                                    "width 0.5s ease"
                                            }}
                                        />

                                    </div>

                                </div>


                                {/* SUMMARY CARDS */}

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(3, 1fr)",
                                        gap: "12px",
                                        marginTop: "25px"
                                    }}
                                >

                                    <div
                                        style={{
                                            padding: "16px",
                                            borderRadius: "12px",
                                            background: "#f0fdf4"
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontSize: "25px",
                                                fontWeight: "800",
                                                color: "#16a34a"
                                            }}
                                        >
                                            {analysisSummary.matched}
                                        </div>


                                        <div
                                            style={{
                                                color: "#166534",
                                                fontSize: "13px",
                                                marginTop: "4px"
                                            }}
                                        >
                                            Matched
                                        </div>

                                    </div>


                                    <div
                                        style={{
                                            padding: "16px",
                                            borderRadius: "12px",
                                            background: "#fff7ed"
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontSize: "25px",
                                                fontWeight: "800",
                                                color: "#ea580c"
                                            }}
                                        >
                                            {analysisSummary.missing}
                                        </div>


                                        <div
                                            style={{
                                                color: "#9a3412",
                                                fontSize: "13px",
                                                marginTop: "4px"
                                            }}
                                        >
                                            Missing
                                        </div>

                                    </div>


                                    <div
                                        style={{
                                            padding: "16px",
                                            borderRadius: "12px",
                                            background: "#f8fafc"
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontSize: "25px",
                                                fontWeight: "800",
                                                color: "#475569"
                                            }}
                                        >
                                            {analysisSummary.totalSkills}
                                        </div>


                                        <div
                                            style={{
                                                color: "#475569",
                                                fontSize: "13px",
                                                marginTop: "4px"
                                            }}
                                        >
                                            Detected
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            OVERALL FEEDBACK
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
                                <Icon name="file" /> Overall Feedback
                            </h2>


                            <p
                                style={{
                                    lineHeight: "1.8",
                                    color: "#374151",
                                    marginBottom: 0
                                }}
                            >
                                {analysis.overallFeedback ||
                                    "No overall feedback available."}
                            </p>

                        </div>


                        {/* =================================================
                            SKILLS
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

                            {/* MATCHED SKILLS */}

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
                                    <Icon name="success" /> Matched Skills
                                </h2>


                                <p
                                    style={{
                                        color: "#6b7280",
                                        marginBottom: 0
                                    }}
                                >
                                    Skills detected in your resume
                                    that align with the job.
                                </p>


                                {renderList(
                                    analysis.matchedSkills,
                                    "No matching skills were detected.",
                                    "strength"
                                )}

                            </div>


                            {/* MISSING SKILLS */}

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
                                    <Icon name="warning" /> Missing Skills
                                </h2>


                                <p
                                    style={{
                                        color: "#6b7280",
                                        marginBottom: 0
                                    }}
                                >
                                    Job-relevant skills that were
                                    not detected in your resume.
                                </p>


                                {renderList(
                                    analysis.missingSkills,
                                    "No important missing skills were detected.",
                                    "missing"
                                )}

                            </div>

                        </div>


                        {/* =================================================
                            STRENGTHS + WEAKNESSES
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

                            {/* STRENGTHS */}

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
                                    <Icon name="strength" /> Strengths
                                </h2>


                                {renderList(
                                    analysis.strengths,
                                    "No specific strengths were identified.",
                                    "strength"
                                )}

                            </div>


                            {/* WEAKNESSES */}

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
                                    <Icon name="warning" /> Weaknesses
                                </h2>


                                {renderList(
                                    analysis.weaknesses,
                                    "No major weaknesses were identified.",
                                    "missing"
                                )}

                            </div>

                        </div>


                        {/* =================================================
                            SUGGESTIONS
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
                                <Icon name="idea" /> What You Should Do
                            </h2>


                            <p
                                style={{
                                    color: "#6b7280",
                                    lineHeight: "1.6"
                                }}
                            >
                                Focus on these recommendations
                                before applying for this position.
                            </p>


                            {renderList(
                                analysis.suggestions,
                                "No additional suggestions were generated."
                            )}

                        </div>


                        {/* =================================================
                            RESUME IMPROVEMENTS
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
                                <Icon name="chart" /> Resume Improvements
                            </h2>


                            <p
                                style={{
                                    color: "#6b7280",
                                    lineHeight: "1.6"
                                }}
                            >
                                These improvements can make your
                                resume clearer and more ATS-friendly.
                            </p>


                            {renderList(
                                analysis.resumeImprovements,
                                "No major structural improvements were identified."
                            )}

                        </div>


                        {/* =================================================
                            NEXT STEPS
                        ================================================= */}

                        <div
                            className="resume-analysis-next-steps"
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--primary-light), var(--surface-soft))",
                                padding: "30px",
                                borderRadius: "16px",
                                marginBottom: "25px",
                                border:
                                    "1px solid var(--border)"
                            }}
                        >

                            <h2
                                style={{
                                    marginTop: 0
                                }}
                            >
                                <Icon name="rocket" /> Recommended Next Steps
                            </h2>


                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px",
                                    marginTop: "18px"
                                }}
                            >

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "12px",
                                        alignItems: "flex-start"
                                    }}
                                >

                                    <strong>
                                        1.
                                    </strong>


                                    <span
                                        style={{
                                            lineHeight: "1.6"
                                        }}
                                    >
                                        Review the missing skills and
                                        only add skills you genuinely
                                        know or have experience with.
                                    </span>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        gap: "12px",
                                        alignItems: "flex-start"
                                    }}
                                >

                                    <strong>
                                        2.
                                    </strong>


                                    <span
                                        style={{
                                            lineHeight: "1.6"
                                        }}
                                    >
                                        Improve the resume bullets using
                                        measurable results wherever possible.
                                    </span>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        gap: "12px",
                                        alignItems: "flex-start"
                                    }}
                                >

                                    <strong>
                                        3.
                                    </strong>


                                    <span
                                        style={{
                                            lineHeight: "1.6"
                                        }}
                                    >
                                        Tailor the resume to this specific
                                        job instead of using exactly the
                                        same resume everywhere.
                                    </span>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        gap: "12px",
                                        alignItems: "flex-start"
                                    }}
                                >

                                    <strong>
                                        4.
                                    </strong>


                                    <span
                                        style={{
                                            lineHeight: "1.6"
                                        }}
                                    >
                                        Run the analyzer again after making
                                        meaningful resume changes.
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            ACTION BUTTONS
                        ================================================= */}

                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                flexWrap: "wrap",
                                paddingBottom: "20px"
                            }}
                        >

                            <button
                                className="primary-button"
                                onClick={handleAnalyze}
                                disabled={analyzing}
                            >

                                {analyzing
                                    ? "Analyzing..."
                                    : <><Icon name="scan" /> Analyze Again</>}

                            </button>


                            <button
                                className="secondary-button"
                                onClick={() =>
                                    navigate(
                                        `/jobs/${job.id}`
                                    )
                                }
                            >
                                <Icon name="left" /> Back to Job
                            </button>


                            <button
                                className="secondary-button"
                                onClick={() =>
                                    navigate("/resume")
                                }
                            >
                                <Icon name="file" /> Manage Resume
                            </button>

                        </div>

                    </div>
                )}

            </main>

        </div>
    );
}


export default ResumeAnalysis;