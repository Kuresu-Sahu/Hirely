import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";


function RecruiterCandidateEvaluation() {

    const navigate = useNavigate();

    const { applicationId } = useParams();


    // =====================================================
    // STATE
    // =====================================================

    const [evaluation, setEvaluation] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [resumeLoading, setResumeLoading] =
        useState(false);

    const [resumeDownloadLoading, setResumeDownloadLoading] =
        useState(false);

    const [statusUpdating, setStatusUpdating] =
        useState(false);


    // =====================================================
    // LOAD EVALUATION
    // =====================================================

    useEffect(() => {

        const loadEvaluation = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await api.get(
                        `/api/recruiter/evaluations/application/${applicationId}`
                    );


                setEvaluation(
                    response.data
                );


            } catch (error) {

                console.error(
                    "Evaluation loading error:",
                    error
                );


                setError(
                    getErrorMessage(
                        error,
                        "Unable to load candidate evaluation."
                    )
                );


            } finally {

                setLoading(false);
            }
        };


        if (applicationId) {

            loadEvaluation();
        }

    }, [applicationId]);


    // =====================================================
    // VIEW RESUME
    // =====================================================

    const handleViewResume = async () => {

        setResumeLoading(true);

        setError("");


        try {

            const response =
                await api.get(
                    `/api/applications/${applicationId}/resume`,
                    {
                        responseType: "blob"
                    }
                );


            const contentType =
                response.headers[
                "content-type"
                ] ||
                "application/pdf";


            const blob =
                new Blob(
                    [response.data],
                    {
                        type: contentType
                    }
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );


            setTimeout(() => {

                window.URL.revokeObjectURL(
                    url
                );

            }, 60000);


        } catch (error) {

            console.error(
                "Resume view error:",
                error
            );


            setError(
                "Unable to open candidate resume."
            );


        } finally {

            setResumeLoading(false);
        }
    };


    // =====================================================
    // DOWNLOAD RESUME
    // =====================================================

    const handleDownloadResume = async () => {

        setResumeDownloadLoading(true);

        setError("");


        try {

            const response =
                await api.get(
                    `/api/applications/${applicationId}/resume/download`,
                    {
                        responseType: "blob"
                    }
                );


            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            response.headers[
                            "content-type"
                            ] ||
                            "application/pdf"
                    }
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");


            link.href = url;


            const candidateName =
                evaluation?.application
                    ?.candidateName ||
                "candidate";


            const safeName =
                candidateName
                    .replace(
                        /[^a-z0-9]/gi,
                        "_"
                    );


            link.download =
                `${safeName}_resume.pdf`;


            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            setTimeout(() => {

                window.URL.revokeObjectURL(
                    url
                );

            }, 60000);


        } catch (error) {

            console.error(
                "Resume download error:",
                error
            );


            setError(
                "Unable to download candidate resume."
            );


        } finally {

            setResumeDownloadLoading(
                false
            );
        }
    };


    // =====================================================
    // EMAIL CANDIDATE
    // =====================================================

    const handleEmailCandidate = () => {

        const candidateEmail =
            application?.candidateEmail?.trim();

        if (!candidateEmail) {
            setError("Candidate email address is not available.");
            return;
        }

        const candidateName =
            application?.candidateName ||
            "Candidate";

        const jobTitle =
            application?.jobTitle ||
            "your job application";

        const subject =
            `Regarding your application for ${jobTitle}`;

        const body =
            `Dear ${candidateName},\n\n` +
            `We are contacting you regarding your application for ${jobTitle}.\n\n` +
            `Regards,\nHirely Recruitment Team`;

        const gmailUrl =
            `https://mail.google.com/mail/?view=cm&fs=1` +
            `&to=${encodeURIComponent(candidateEmail)}` +
            `&su=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;

        const emailWindow =
            window.open(
                gmailUrl,
                "_blank",
                "noopener,noreferrer"
            );

        if (!emailWindow) {
            const mailtoUrl =
                `mailto:${encodeURIComponent(candidateEmail)}` +
                `?subject=${encodeURIComponent(subject)}` +
                `&body=${encodeURIComponent(body)}`;

            window.location.href = mailtoUrl;
        }
    };


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    const handleStatusChange = async (
        newStatus
    ) => {

        setStatusUpdating(true);

        setError("");


        try {

            const response =
                await api.put(
                    `/api/applications/${applicationId}/status`,
                    {
                        status: newStatus
                    }
                );


            setEvaluation(
                previous => {

                    if (!previous) {

                        return previous;
                    }


                    return {

                        ...previous,

                        application: {

                            ...previous.application,

                            ...response.data
                        }
                    };
                }
            );


        } catch (error) {

            console.error(
                "Status update error:",
                error
            );


            setError(
                getErrorMessage(
                    error,
                    "Unable to update application status."
                )
            );


        } finally {

            setStatusUpdating(false);
        }
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "Not available";
        }


        try {

            return new Date(
                date
            ).toLocaleString(
                "en-IN"
            );

        } catch {

            return "Not available";
        }
    };


    // =====================================================
    // STATUS LABEL
    // =====================================================

    const getStatusLabel = (
        status
    ) => {

        if (!status) {

            return "Applied";
        }


        return status
            .replaceAll(
                "_",
                " "
            )
            .toLowerCase()
            .replace(
                /\b\w/g,
                character =>
                    character.toUpperCase()
            );
    };


    // =====================================================
    // STATUS STYLE
    // =====================================================

    const getStatusStyle = (
        status
    ) => {

        const baseStyle = {

            display:
                "inline-block",

            padding:
                "8px 14px",

            borderRadius:
                "20px",

            fontWeight:
                "600",

            fontSize:
                "14px"
        };


        switch (status) {

            case "SHORTLISTED":

                return {

                    ...baseStyle,

                    background:
                        "#fff3cd",

                    color:
                        "#856404"
                };


            case "INTERVIEW":

                return {

                    ...baseStyle,

                    background:
                        "#cfe2ff",

                    color:
                        "#084298"
                };


            case "SELECTED":

                return {

                    ...baseStyle,

                    background:
                        "#d1e7dd",

                    color:
                        "#0f5132"
                };


            case "REJECTED":

                return {

                    ...baseStyle,

                    background:
                        "#f8d7da",

                    color:
                        "#842029"
                };


            default:

                return {

                    ...baseStyle,

                    background:
                        "#e2e3e5",

                    color:
                        "#41464b"
                };
        }
    };


    // =====================================================
    // PARSE INTERVIEW RESULT
    // =====================================================

    const parseInterviewResult = () => {

        const resultJson =
            evaluation
                ?.interview
                ?.resultJson;


        if (!resultJson) {

            return null;
        }


        if (typeof resultJson === "object") {

            return resultJson;
        }


        if (typeof resultJson !== "string") {

            return null;
        }


        try {

            return JSON.parse(
                resultJson
            );

        } catch (parseError) {

            console.error(
                "Interview result JSON parse error:",
                parseError
            );

            return null;
        }
    };


    // =====================================================
    // SAFE ERROR MESSAGE
    // =====================================================

    const getErrorMessage = (error, fallback) => {

        const data =
            error?.response?.data;


        if (typeof data === "string") {

            return data;
        }


        if (data?.message) {

            return String(data.message);
        }


        if (error?.message) {

            return String(error.message);
        }


        return fallback;
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="page-center">

                <h2>
                    Loading candidate evaluation...
                </h2>

                <p>
                    Preparing resume, application
                    and interview information.
                </p>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error && !evaluation) {

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
                            navigate(-1)
                        }
                    >
                        <Icon name="left" /> Back
                    </button>

                </nav>


                <main className="dashboard">

                    <div className="dashboard-card">

                        <h2>
                            Unable to load evaluation
                        </h2>

                        <div className="error-message">
                            {error}
                        </div>


                        <button
                            className="primary-button"
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            Try Again
                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // =====================================================
    // DATA
    // =====================================================

    const application =
        evaluation?.application;


    const analysis =
        evaluation?.resumeAnalysis;


    const interview =
        evaluation?.interview;


    const interviewResult =
        parseInterviewResult();


    // =====================================================
    // PAGE
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
                    onClick={() =>
                        navigate(
                            `/recruiter/jobs/${application?.jobId}/applicants`
                        )
                    }
                >
                    <Icon name="left" /> Back to Applicants
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
                            "1100px",
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
                                "flex-start",
                            gap:
                                "20px",
                            flexWrap:
                                "wrap"
                        }}
                    >

                        <div>

                            <h1>
                                <Icon name="user" /> Candidate Evaluation
                            </h1>

                            <p>
                                Complete evaluation
                                for the candidate's
                                application.
                            </p>

                        </div>


                        {application?.status && (

                            <span
                                style={
                                    getStatusStyle(
                                        application.status
                                    )
                                }
                            >
                                {
                                    getStatusLabel(
                                        application.status
                                    )
                                }
                            </span>
                        )}

                    </div>


                    {error && (

                        <div
                            className="error-message"
                            style={{
                                marginTop:
                                    "20px"
                            }}
                        >
                            {error}
                        </div>
                    )}


                    {/* =================================================
                        CANDIDATE INFORMATION
                    ================================================= */}

                    <section
                        style={{
                            marginTop:
                                "30px"
                        }}
                    >

                        <h2>
                            <Icon name="user" /> Candidate Information
                        </h2>


                        <div
                            style={{
                                display:
                                    "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(240px, 1fr))",
                                gap:
                                    "15px",
                                marginTop:
                                    "15px"
                            }}
                        >

                            <InfoCard
                                title="Name"
                                value={
                                    application
                                        ?.candidateName ||
                                    "Not available"
                                }
                            />


                            <InfoCard
                                title="Email"
                                value={
                                    application
                                        ?.candidateEmail ||
                                    "Not available"
                                }
                            />


                            <InfoCard
                                title="Candidate ID"
                                value={
                                    application
                                        ?.candidateId ||
                                    "Not available"
                                }
                            />

                        </div>

                    </section>


                    {/* =================================================
                        APPLICATION
                    ================================================= */}

                    <section
                        style={{
                            marginTop:
                                "30px"
                        }}
                    >

                        <h2>
                            <Icon name="clipboard" /> Application
                        </h2>


                        <div
                            style={{
                                marginTop:
                                    "15px",
                                padding:
                                    "20px",
                                background:
                                    "#f8f9fa",
                                borderRadius:
                                    "12px"
                            }}
                        >

                            <p>
                                <strong>
                                    Job:
                                </strong>{" "}

                                {
                                    application?.jobTitle ||
                                    "Not available"
                                }
                            </p>


                            <p>
                                <strong>
                                    Application ID:
                                </strong>{" "}

                                {
                                    application?.applicationId
                                }
                            </p>


                            <p>
                                <strong>
                                    Applied:
                                </strong>{" "}

                                {
                                    formatDate(
                                        application?.appliedAt
                                    )
                                }
                            </p>


                            <div
                                style={{
                                    marginTop:
                                        "15px"
                                }}
                            >

                                <strong>
                                    Cover Letter
                                </strong>


                                <p
                                    style={{
                                        whiteSpace:
                                            "pre-wrap",
                                        lineHeight:
                                            "1.6"
                                    }}
                                >
                                    {
                                        application
                                            ?.coverLetter ||
                                        "No cover letter provided."
                                    }
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        RESUME
                    ================================================= */}

                    <section
                        style={{
                            marginTop:
                                "30px"
                        }}
                    >

                        <h2>
                            <Icon name="file" /> Resume
                        </h2>


                        <div
                            style={{
                                marginTop:
                                    "15px",
                                padding:
                                    "20px",
                                border:
                                    "1px solid #ddd",
                                borderRadius:
                                    "12px"
                            }}
                        >

                            {application?.resumeAvailable ? (

                                <>

                                    <p>
                                        Candidate resume
                                        is available.
                                    </p>


                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            gap:
                                                "10px",
                                            flexWrap:
                                                "wrap"
                                        }}
                                    >

                                        <button
                                            className="secondary-button"
                                            disabled={
                                                resumeLoading
                                            }
                                            onClick={
                                                handleViewResume
                                            }
                                        >
                                            {
                                                resumeLoading
                                                    ? "Opening..."
                                                    : "View Resume"
                                            }
                                        </button>


                                        <button
                                            className="primary-button"
                                            disabled={
                                                resumeDownloadLoading
                                            }
                                            onClick={
                                                handleDownloadResume
                                            }
                                        >
                                            {
                                                resumeDownloadLoading
                                                    ? "Downloading..."
                                                    : "Download Resume"
                                            }
                                        </button>

                                    </div>

                                </>

                            ) : (

                                <p>
                                    <Icon name="error" /> Candidate has not
                                    uploaded a resume.
                                </p>
                            )}

                        </div>

                    </section>


                    {/* =================================================
                        AI RESUME ANALYSIS
                    ================================================= */}

                    <section
                        style={{
                            marginTop:
                                "30px"
                        }}
                    >

                        <h2>
                            <Icon name="bot" /> AI Resume Analysis
                        </h2>


                        {!analysis ? (

                            <div
                                style={{
                                    marginTop:
                                        "15px",
                                    padding:
                                        "20px",
                                    background:
                                        "#f8f9fa",
                                    borderRadius:
                                        "12px"
                                }}
                            >

                                <h3>
                                    No analysis available
                                </h3>

                                <p>
                                    The candidate has
                                    not analyzed their
                                    resume for this job
                                    yet.
                                </p>

                            </div>

                        ) : (

                            <div
                                style={{
                                    marginTop:
                                        "15px"
                                }}
                            >

                                {/* ATS SCORE */}

                                <div
                                    style={{
                                        padding:
                                            "25px",
                                        border:
                                            "1px solid #ddd",
                                        borderRadius:
                                            "12px",
                                        textAlign:
                                            "center"
                                    }}
                                >

                                    <p>
                                        ATS SCORE
                                    </p>


                                    <div
                                        style={{
                                            fontSize:
                                                "48px",
                                            fontWeight:
                                                "bold"
                                        }}
                                    >
                                        {
                                            analysis.atsScore ??
                                            0
                                        }%
                                    </div>


                                    <p>
                                        Job:
                                        {" "}
                                        {
                                            analysis.jobTitle
                                        }
                                    </p>

                                </div>


                                {/* ANALYSIS GRID */}

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(250px, 1fr))",
                                        gap:
                                            "20px",
                                        marginTop:
                                            "20px"
                                    }}
                                >

                                    <ListCard
                                        title="Matched Skills"
                                        items={
                                            analysis.matchedKeywords
                                        }
                                    />


                                    <ListCard
                                        title="Missing Skills"
                                        items={
                                            analysis.missingKeywords
                                        }
                                    />


                                    <ListCard
                                        title="Strengths"
                                        items={
                                            analysis.strengths
                                        }
                                    />


                                    <ListCard
                                        title="Suggestions"
                                        items={
                                            analysis.suggestions
                                        }
                                    />

                                </div>


                                <p
                                    style={{
                                        marginTop:
                                            "15px",
                                        fontSize:
                                            "13px",
                                        opacity:
                                            "0.7"
                                    }}
                                >
                                    Analyzed:
                                    {" "}
                                    {
                                        formatDate(
                                            analysis.analyzedAt
                                        )
                                    }
                                </p>

                            </div>
                        )}

                    </section>


                    {/* =================================================
                        AI INTERVIEW
                    ================================================= */}

                    <section
                        style={{
                            marginTop:
                                "30px"
                        }}
                    >

                        <h2>
                            <Icon name="interview" /> AI Interview
                        </h2>


                        {!interview ? (

                            <div
                                style={{
                                    marginTop:
                                        "15px",
                                    padding:
                                        "20px",
                                    background:
                                        "#f8f9fa",
                                    borderRadius:
                                        "12px"
                                }}
                            >

                                <h3>
                                    No completed interview
                                </h3>

                                <p>
                                    The candidate has not
                                    completed an AI
                                    interview for this job
                                    yet.
                                </p>

                            </div>

                        ) : (

                            <div
                                style={{
                                    marginTop:
                                        "15px"
                                }}
                            >

                                <div
                                    style={{
                                        display:
                                            "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(180px, 1fr))",
                                        gap:
                                            "15px"
                                    }}
                                >

                                    <ScoreCard
                                        title="Percentage"
                                        value={
                                            `${interview.percentage ?? 0}%`
                                        }
                                    />


                                    <ScoreCard
                                        title="Average Score"
                                        value={
                                            interview.averageScore ??
                                            "N/A"
                                        }
                                    />


                                    <ScoreCard
                                        title="Questions"
                                        value={
                                            interview.totalQuestions ??
                                            0
                                        }
                                    />


                                    <ScoreCard
                                        title="Rating"
                                        value={
                                            interview.overallRating ||
                                            "N/A"
                                        }
                                    />

                                </div>


                                <div
                                    style={{
                                        marginTop:
                                            "20px",
                                        padding:
                                            "20px",
                                        border:
                                            "1px solid #ddd",
                                        borderRadius:
                                            "12px"
                                    }}
                                >

                                    <p>
                                        <strong>
                                            Completed:
                                        </strong>{" "}

                                        {
                                            formatDate(
                                                interview.completedAt
                                            )
                                        }
                                    </p>


                                    {interviewResult && (

                                        <InterviewEvaluation
                                            result={interviewResult}
                                            interview={interview}
                                        />

                                    )}

                                </div>


                                <button
                                    className="secondary-button"
                                    style={{
                                        marginTop:
                                            "15px"
                                    }}
                                    onClick={() =>
                                        navigate(
                                            `/recruiter/interview/${applicationId}`
                                        )
                                    }
                                >
                                    <Icon name="interview" /> View Detailed Interview
                                </button>

                            </div>
                        )}

                    </section>


                    {/* =================================================
                        APPLICATION STATUS
                    ================================================= */}

                    <section
                        style={{
                            marginTop:
                                "30px"
                        }}
                    >

                        <h2>
                            <Icon name="scan" /> Application Status
                        </h2>


                        <div
                            style={{
                                marginTop:
                                    "15px",
                                padding:
                                    "20px",
                                border:
                                    "1px solid #ddd",
                                borderRadius:
                                    "12px"
                            }}
                        >

                            <label>
                                <strong>
                                    Current Status
                                </strong>
                            </label>


                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    maxWidth: "420px",
                                    marginTop: "12px"
                                }}
                            >

                                <select
                                    value={
                                        application?.status ||
                                        "APPLIED"
                                    }
                                    disabled={
                                        statusUpdating
                                    }
                                    onChange={
                                        event =>
                                            handleStatusChange(
                                                event.target.value
                                            )
                                    }
                                    style={{
                                        width: "100%",
                                        minHeight: "50px",
                                        padding: "0 48px 0 16px",
                                        borderRadius: "12px",
                                        border: "1px solid var(--border)",
                                        background: "var(--surface)",
                                        color: "var(--text)",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        outline: "none",
                                        appearance: "none",
                                        WebkitAppearance: "none",
                                        cursor: statusUpdating
                                            ? "not-allowed"
                                            : "pointer",
                                        boxShadow: "var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.08))",
                                        transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
                                        opacity: statusUpdating ? 0.7 : 1
                                    }}
                                    onFocus={event => {
                                        event.currentTarget.style.borderColor = "var(--primary)";
                                        event.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent)";
                                    }}
                                    onBlur={event => {
                                        event.currentTarget.style.borderColor = "var(--border)";
                                        event.currentTarget.style.boxShadow = "var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.08))";
                                    }}
                                >

                                    <option value="APPLIED">
                                        Applied
                                    </option>

                                    <option value="SHORTLISTED">
                                        Shortlisted
                                    </option>

                                    <option value="INTERVIEW">
                                        Interview
                                    </option>

                                    <option value="SELECTED">
                                        Selected
                                    </option>

                                    <option value="REJECTED">
                                        Rejected
                                    </option>

                                </select>

                                <span
                                    aria-hidden="true"
                                    style={{
                                        position: "absolute",
                                        right: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        pointerEvents: "none",
                                        color: "var(--text-muted)",
                                        fontSize: "18px",
                                        fontWeight: 700
                                    }}
                                >
                                    ▾
                                </span>

                            </div>


                            {statusUpdating && (

                                <small
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "8px"
                                    }}
                                >
                                    Updating status...
                                </small>
                            )}

                        </div>

                    </section>


                    {/* =================================================
                        QUICK ACTIONS
                    ================================================= */}

                    <section
                        style={{
                            marginTop:
                                "30px",
                            paddingTop:
                                "20px",
                            borderTop:
                                "1px solid #eee"
                        }}
                    >

                        <div
                            style={{
                                display:
                                    "flex",
                                gap:
                                    "10px",
                                flexWrap:
                                    "wrap"
                            }}
                        >

                            {application?.candidateEmail && (

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={handleEmailCandidate}
                                    title={`Email ${application.candidateEmail}`}
                                >
                                    <Icon name="email" /> Email Candidate
                                </button>
                            )}


                            <button
                                className="secondary-button"
                                onClick={() =>
                                    navigate(
                                        `/recruiter/jobs/${application?.jobId}/applicants`
                                    )
                                }
                            >
                                <Icon name="left" /> Back to Applicants
                            </button>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}


// =====================================================
// INTERVIEW EVALUATION
// =====================================================

function InterviewEvaluation({
    result,
    interview
}) {

    const results = Array.isArray(result?.results)
        ? result.results
        : [];


    const averageScore =
        interview?.averageScore !== null &&
        interview?.averageScore !== undefined
            ? Number(interview.averageScore)
            : results.length > 0
                ? results.reduce(
                    (sum, item) =>
                        sum + Number(item?.score || 0),
                    0
                ) / results.length
                : 0;


    const percentage =
        interview?.percentage !== null &&
        interview?.percentage !== undefined
            ? Number(interview.percentage)
            : Math.round(averageScore * 10);


    const overallRating =
        interview?.overallRating ||
        result?.overallRating ||
        getOverallRating(averageScore);


    const strongAnswers = results.filter(
        item => Number(item?.score || 0) >= 7
    ).length;


    const weakAnswers = results.filter(
        item => Number(item?.score || 0) < 5
    ).length;


    const formatScore = value => {

        const score = Number(value);

        if (Number.isNaN(score)) {

            return "0";
        }

        return score % 1 === 0
            ? String(score)
            : score.toFixed(1);
    };


    const getScoreColor = score => {

        const numericScore = Number(score || 0);

        if (numericScore >= 7) {

            return "var(--success)";
        }

        if (numericScore >= 5) {

            return "var(--warning)";
        }

        return "var(--danger)";
    };


    const getScoreLabel = score => {

        const numericScore = Number(score || 0);

        if (numericScore >= 8) {

            return "Excellent";
        }

        if (numericScore >= 7) {

            return "Strong";
        }

        if (numericScore >= 5) {

            return "Average";
        }

        return "Needs Improvement";
    };


    const toList = value => {

        if (Array.isArray(value)) {

            return value
                .filter(item => item !== null && item !== undefined)
                .map(item => String(item))
                .filter(Boolean);
        }


        if (
            typeof value === "string" &&
            value.trim()
        ) {

            return [value.trim()];
        }


        return [];
    };


    const renderListSection = (
        title,
        icon,
        items,
        tone
    ) => {

        const list = toList(items);


        if (list.length === 0) {

            return null;
        }


        const toneStyles = {

            success: {
                background: "var(--success-light, rgba(34, 197, 94, 0.10))",
                border: "var(--success)",
                color: "var(--success)"
            },

            warning: {
                background: "var(--warning-light, rgba(245, 158, 11, 0.10))",
                border: "var(--warning)",
                color: "var(--warning)"
            },

            primary: {
                background: "var(--primary-light)",
                border: "var(--primary)",
                color: "var(--primary)"
            },

            neutral: {
                background: "var(--surface-soft)",
                border: "var(--border)",
                color: "var(--text)"
            }
        };


        const style =
            toneStyles[tone] ||
            toneStyles.neutral;


        return (

            <div
                style={{
                    padding: "18px",
                    background: style.background,
                    border: `1px solid ${style.border}`,
                    borderRadius: "12px",
                    marginTop: "16px"
                }}
            >

                <h4
                    style={{
                        margin: "0 0 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: style.color
                    }}
                >
                    <Icon name={icon} />
                    {title}
                </h4>


                <ul
                    style={{
                        margin: 0,
                        paddingLeft: "22px"
                    }}
                >

                    {list.map(
                        (item, index) => (

                            <li
                                key={`${title}-${index}`}
                                style={{
                                    marginBottom:
                                        index === list.length - 1
                                            ? 0
                                            : "8px",
                                    lineHeight: "1.55"
                                }}
                            >
                                {item}
                            </li>

                        )
                    )}

                </ul>

            </div>
        );
    };


    return (

        <div
            style={{
                marginTop: "22px"
            }}
        >

            {/* =================================================
                EVALUATION SUMMARY
            ================================================= */}

            <div
                style={{
                    padding: "22px",
                    borderRadius: "16px",
                    background:
                        "linear-gradient(135deg, var(--primary-light), var(--surface-soft))",
                    border:
                        "1px solid var(--border)"
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

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "9px",
                                marginBottom: "6px"
                            }}
                        >
                            <Icon name="analytics" />

                            <h3
                                style={{
                                    margin: 0
                                }}
                            >
                                Interview Evaluation
                            </h3>
                        </div>


                        <p
                            style={{
                                margin: 0,
                                color: "var(--text-muted)"
                            }}
                        >
                            AI-generated evaluation of the
                            candidate's interview responses.
                        </p>

                    </div>


                    <div
                        style={{
                            minWidth: "120px",
                            textAlign: "center",
                            padding: "14px 18px",
                            borderRadius: "14px",
                            background: "var(--surface)",
                            border: "1px solid var(--border)"
                        }}
                    >

                        <div
                            style={{
                                fontSize: "34px",
                                fontWeight: 800,
                                lineHeight: 1,
                                color:
                                    getScoreColor(
                                        averageScore
                                    )
                            }}
                        >
                            {formatScore(averageScore)}
                            <span
                                style={{
                                    fontSize: "16px",
                                    color: "var(--text-muted)"
                                }}
                            >
                                /10
                            </span>
                        </div>


                        <div
                            style={{
                                marginTop: "7px",
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "var(--text-muted)"
                            }}
                        >
                            AVERAGE SCORE
                        </div>

                    </div>

                </div>


                {/* =================================================
                    SUMMARY METRICS
                ================================================= */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "12px",
                        marginTop: "18px"
                    }}
                >

                    <EvaluationMetric
                        label="Overall Score"
                        value={`${Math.round(
                            percentage
                        )}%`}
                        icon="analytics"
                    />


                    <EvaluationMetric
                        label="Rating"
                        value={overallRating}
                        icon="success"
                    />


                    <EvaluationMetric
                        label="Questions"
                        value={
                            interview?.totalQuestions ??
                            results.length
                        }
                        icon="interview"
                    />


                    <EvaluationMetric
                        label="Strong Answers"
                        value={strongAnswers}
                        icon="success"
                    />


                    <EvaluationMetric
                        label="Needs Improvement"
                        value={weakAnswers}
                        icon="warning"
                    />

                </div>

            </div>


            {/* =================================================
                QUESTION-BY-QUESTION EVALUATION
            ================================================= */}

            <div
                style={{
                    marginTop: "25px"
                }}
            >

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "15px"
                    }}
                >

                    <div>

                        <h3
                            style={{
                                margin: 0
                            }}
                        >
                            Question-by-Question Evaluation
                        </h3>

                        <p
                            style={{
                                margin: "5px 0 0",
                                color: "var(--text-muted)",
                                fontSize: "14px"
                            }}
                        >
                            Review how the candidate performed
                            on each interview question.
                        </p>

                    </div>


                    <span
                        style={{
                            padding: "7px 12px",
                            borderRadius: "999px",
                            background: "var(--surface-soft)",
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                            fontSize: "13px",
                            fontWeight: 700
                        }}
                    >
                        {results.length}{" "}
                        {results.length === 1
                            ? "Question"
                            : "Questions"}
                    </span>

                </div>


                {results.length === 0 ? (

                    <div
                        style={{
                            padding: "28px",
                            textAlign: "center",
                            border: "1px solid var(--border)",
                            borderRadius: "14px",
                            background: "var(--surface-soft)"
                        }}
                    >

                        <h4>
                            No detailed evaluation available
                        </h4>

                        <p
                            style={{
                                color: "var(--text-muted)"
                            }}
                        >
                            The interview was completed, but
                            question-level evaluation data is
                            not available.
                        </p>

                    </div>

                ) : (

                    results.map(
                        (item, index) => {

                            const score =
                                Number(
                                    item?.score || 0
                                );


                            const strengths =
                                toList(
                                    item?.strengths
                                );


                            const weaknesses =
                                toList(
                                    item?.weaknesses
                                );


                            const suggestions =
                                toList(
                                    item?.suggestions
                                );


                            return (

                                <article
                                    key={
                                        item?.questionId ||
                                        `evaluation-${index}`
                                    }
                                    style={{
                                        border:
                                            "1px solid var(--border)",
                                        borderRadius:
                                            "16px",
                                        padding:
                                            "22px",
                                        marginBottom:
                                            "16px",
                                        background:
                                            "var(--surface)"
                                    }}
                                >

                                    {/* QUESTION HEADER */}

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "flex-start",
                                            gap: "15px",
                                            flexWrap: "wrap"
                                        }}
                                    >

                                        <div
                                            style={{
                                                flex: 1,
                                                minWidth:
                                                    "240px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: "8px",
                                                    marginBottom:
                                                        "10px"
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        padding:
                                                            "5px 10px",
                                                        borderRadius:
                                                            "999px",
                                                        background:
                                                            "var(--primary-light)",
                                                        color:
                                                            "var(--primary)",
                                                        fontSize:
                                                            "12px",
                                                        fontWeight:
                                                            800
                                                    }}
                                                >
                                                    Question{" "}
                                                    {index + 1}
                                                </span>


                                                {item?.category && (

                                                    <span
                                                        style={{
                                                            padding:
                                                                "5px 10px",
                                                            borderRadius:
                                                                "999px",
                                                            background:
                                                                "var(--surface-soft)",
                                                            color:
                                                                "var(--text-muted)",
                                                            border:
                                                                "1px solid var(--border)",
                                                            fontSize:
                                                                "12px",
                                                            fontWeight:
                                                                600
                                                        }}
                                                    >
                                                        {String(
                                                            item.category
                                                        )}
                                                    </span>

                                                )}

                                            </div>


                                            <h4
                                                style={{
                                                    margin: 0,
                                                    fontSize:
                                                        "17px",
                                                    lineHeight:
                                                        "1.5"
                                                }}
                                            >
                                                {
                                                    item?.question ||
                                                    "Question not available"
                                                }
                                            </h4>


                                            {(item?.technology ||
                                                item?.difficulty) && (

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap: "8px",
                                                        flexWrap:
                                                            "wrap",
                                                        marginTop:
                                                            "10px"
                                                    }}
                                                >

                                                    {item?.technology && (

                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                                color:
                                                                    "var(--text-muted)"
                                                            }}
                                                        >
                                                            Technology:{" "}
                                                            {
                                                                String(
                                                                    item.technology
                                                                )
                                                            }
                                                        </span>

                                                    )}


                                                    {item?.difficulty && (

                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    "12px",
                                                                color:
                                                                    "var(--text-muted)"
                                                            }}
                                                        >
                                                            Difficulty:{" "}
                                                            {
                                                                String(
                                                                    item.difficulty
                                                                )
                                                            }
                                                        </span>

                                                    )}

                                                </div>

                                            )}

                                        </div>


                                        {/* SCORE */}

                                        <div
                                            style={{
                                                minWidth: "90px",
                                                textAlign: "center",
                                                padding: "12px 14px",
                                                borderRadius: "13px",
                                                background:
                                                    "var(--surface-soft)",
                                                border:
                                                    `1px solid ${getScoreColor(
                                                        score
                                                    )}`
                                            }}
                                        >

                                            <div
                                                style={{
                                                    fontSize: "25px",
                                                    fontWeight: 800,
                                                    lineHeight: 1,
                                                    color:
                                                        getScoreColor(
                                                            score
                                                        )
                                                }}
                                            >
                                                {formatScore(score)}
                                                <span
                                                    style={{
                                                        fontSize: "13px",
                                                        color:
                                                            "var(--text-muted)"
                                                    }}
                                                >
                                                    /10
                                                </span>
                                            </div>


                                            <div
                                                style={{
                                                    marginTop: "6px",
                                                    fontSize: "11px",
                                                    fontWeight: 800,
                                                    color:
                                                        getScoreColor(
                                                            score
                                                        )
                                                }}
                                            >
                                                {
                                                    getScoreLabel(
                                                        score
                                                    )
                                                }
                                            </div>

                                        </div>

                                    </div>


                                    {/* CANDIDATE ANSWER */}

                                    <EvaluationContent
                                        title="Candidate Answer"
                                        icon="file"
                                        value={
                                            item?.submittedAnswer ||
                                            "No answer provided."
                                        }
                                    />


                                    {/* STRENGTHS */}

                                    {renderListSection(
                                        "Strengths",
                                        "success",
                                        strengths,
                                        "success"
                                    )}


                                    {/* WEAKNESSES */}

                                    {renderListSection(
                                        "Areas to Improve",
                                        "warning",
                                        weaknesses,
                                        "warning"
                                    )}


                                    {/* SUGGESTIONS */}

                                    {renderListSection(
                                        "Suggestions",
                                        "idea",
                                        suggestions,
                                        "primary"
                                    )}


                                    {/* EXPECTED ANSWER */}

                                    {item?.expectedAnswer && (

                                        <EvaluationContent
                                            title="Expected Answer"
                                            icon="book"
                                            value={
                                                item.expectedAnswer
                                            }
                                            tone="success"
                                        />

                                    )}


                                    {/* RATING */}

                                    {item?.rating && (

                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                marginTop: "16px",
                                                paddingTop: "16px",
                                                borderTop:
                                                    "1px solid var(--border)"
                                            }}
                                        >

                                            <strong>
                                                Rating:
                                            </strong>

                                            <span
                                                style={{
                                                    color:
                                                        getScoreColor(
                                                            score
                                                        ),
                                                    fontWeight: 800
                                                }}
                                            >
                                                {
                                                    String(
                                                        item.rating
                                                    )
                                                }
                                            </span>

                                        </div>

                                    )}

                                </article>

                            );
                        }
                    )

                )}

            </div>

        </div>
    );
}


// =====================================================
// EVALUATION METRIC
// =====================================================

function EvaluationMetric({
    label,
    value,
    icon
}) {

    return (

        <div
            style={{
                padding: "15px",
                borderRadius: "12px",
                background: "var(--surface)",
                border: "1px solid var(--border)"
            }}
        >

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "7px"
                }}
            >
                <Icon name={icon} />
                {label}
            </div>


            <div
                style={{
                    fontSize: "19px",
                    fontWeight: 800,
                    wordBreak: "break-word"
                }}
            >
                {String(value ?? "N/A")}
            </div>

        </div>
    );
}


// =====================================================
// EVALUATION CONTENT
// =====================================================

function EvaluationContent({
    title,
    icon,
    value,
    tone = "neutral"
}) {

    const toneStyles = {

        neutral: {
            background: "var(--surface-soft)",
            border: "var(--border)"
        },

        success: {
            background:
                "var(--success-light, rgba(34, 197, 94, 0.10))",
            border: "var(--success)"
        }
    };


    const style =
        toneStyles[tone] ||
        toneStyles.neutral;


    return (

        <div
            style={{
                marginTop: "18px"
            }}
        >

            <h4
                style={{
                    margin: "0 0 9px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}
            >
                <Icon name={icon} />
                {title}
            </h4>


            <div
                style={{
                    padding: "15px 17px",
                    background: style.background,
                    border:
                        `1px solid ${style.border}`,
                    borderRadius: "11px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: "1.65"
                }}
            >
                {
                    typeof value === "string"
                        ? value
                        : String(value ?? "")
                }
            </div>

        </div>
    );
}


// =====================================================
// OVERALL RATING
// =====================================================

function getOverallRating(score) {

    const numericScore =
        Number(score || 0);


    if (numericScore >= 8) {

        return "Excellent";
    }


    if (numericScore >= 7) {

        return "Strong";
    }


    if (numericScore >= 5) {

        return "Average";
    }


    return "Needs Improvement";
}


// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
    title,
    value
}) {

    return (

        <div
            style={{
                padding:
                    "18px",
                background:
                    "#f8f9fa",
                borderRadius:
                    "10px"
            }}
        >

            <p
                style={{
                    margin:
                        "0 0 8px",
                    fontSize:
                        "13px",
                    opacity:
                        "0.65"
                }}
            >
                {title}
            </p>


            <strong>
                {value}
            </strong>

        </div>
    );
}


// =====================================================
// SCORE CARD
// =====================================================

function ScoreCard({
    title,
    value
}) {

    return (

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

            <p>
                {title}
            </p>


            <h2
                style={{
                    margin:
                        "5px 0"
                }}
            >
                {value}
            </h2>

        </div>
    );
}


// =====================================================
// LIST CARD
// =====================================================

function ListCard({
    title,
    items
}) {

    return (

        <div
            style={{
                padding:
                    "20px",
                border:
                    "1px solid #ddd",
                borderRadius:
                    "12px"
            }}
        >

            <h3>
                {title}
            </h3>


            {!items ||
                items.length === 0 ? (

                <p>
                    None available.
                </p>

            ) : (

                <ul>

                    {items.map(
                        (item, index) => (

                            <li
                                key={`${title}-${index}`}
                                style={{
                                    marginBottom:
                                        "6px"
                                }}
                            >
                                {item}
                            </li>
                        )
                    )}

                </ul>
            )}

        </div>
    );
}


export default RecruiterCandidateEvaluation;