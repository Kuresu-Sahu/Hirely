import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";

function InterviewHistory() {

    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================
    // LOAD HISTORY
    // ==========================================

    useEffect(() => {

        const loadHistory = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await api.get(
                        "/api/interview-attempts/my"
                    );


                setHistory(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );


            } catch (error) {

                console.error(
                    "Interview history error:",
                    error
                );


                setError(
                    error.response?.data ||
                    "Unable to load interview history."
                );


            } finally {

                setLoading(false);
            }
        };


        loadHistory();

    }, []);


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {

        if (!date) {

            return "Unknown";
        }


        try {

            return new Date(
                date
            ).toLocaleString();

        } catch {

            return "Unknown";
        }
    };


    // ==========================================
    // VIEW RESULT
    // ==========================================

    const handleViewResult = (
        attemptId
    ) => {

        navigate(
            `/candidate/interview/history/${attemptId}`
        );
    };


    // ==========================================
    // START NEW INTERVIEW
    // ==========================================

    const handleFindJobs = () => {

        navigate("/jobs");
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="page-center">

                <h2>
                    Loading interview history...
                </h2>

            </div>
        );
    }


    // ==========================================
    // MAIN
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
                    onClick={() =>
                        navigate(
                            "/candidate/dashboard"
                        )
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

                    <h1>
                        <Icon name="analytics" /> Interview History
                    </h1>


                    <p>
                        Review your previous AI
                        interview attempts and
                        performance.
                    </p>


                    {/* ==================================
                        ERROR
                    ================================== */}

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


                    {/* ==================================
                        EMPTY
                    ================================== */}

                    {!error &&
                        history.length === 0 && (

                            <div
                                className="empty-state"
                                style={{
                                    marginTop:
                                        "25px"
                                }}
                            >

                                <h2>
                                    No interviews completed yet
                                </h2>


                                <p>
                                    Practice an interview
                                    for a job to see your
                                    results here.
                                </p>


                                <button
                                    className="primary-button"
                                    onClick={
                                        handleFindJobs
                                    }
                                >
                                    <Icon name="search" /> Find Jobs
                                </button>

                            </div>
                        )
                    }


                    {/* ==================================
                        HISTORY LIST
                    ================================== */}

                    {history.length > 0 && (

                        <div
                            style={{
                                display:
                                    "grid",
                                gap:
                                    "20px",
                                marginTop:
                                    "25px"
                            }}
                        >

                            {history.map(
                                (attempt) => (

                                    <div
                                        key={
                                            attempt.id
                                        }
                                        style={{
                                            border:
                                                "1px solid #ddd",
                                            borderRadius:
                                                "14px",
                                            padding:
                                                "20px"
                                        }}
                                    >

                                        {/* HEADER */}

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

                                            <div>

                                                <h2>
                                                    {attempt.jobTitle ||
                                                        "Interview"}
                                                </h2>


                                                <p>
                                                    <Icon name="calendar" />{" "}
                                                    {formatDate(
                                                        attempt.completedAt
                                                    )}
                                                </p>

                                            </div>


                                            <div
                                                style={{
                                                    textAlign:
                                                        "center"
                                                }}
                                            >

                                                <strong
                                                    style={{
                                                        fontSize:
                                                            "30px"
                                                    }}
                                                >
                                                    {Number(
                                                        attempt.averageScore ||
                                                        0
                                                    ).toFixed(1)}
                                                    /10
                                                </strong>


                                                <p>
                                                    {
                                                        attempt.overallRating
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        {/* STATISTICS */}

                                        <div
                                            style={{
                                                display:
                                                    "grid",
                                                gridTemplateColumns:
                                                    "repeat(auto-fit, minmax(150px, 1fr))",
                                                gap:
                                                    "15px",
                                                marginTop:
                                                    "20px",
                                                marginBottom:
                                                    "20px"
                                            }}
                                        >

                                            <div>

                                                <strong>
                                                    Questions
                                                </strong>

                                                <p>
                                                    {
                                                        attempt.totalQuestions
                                                    }
                                                </p>

                                            </div>


                                            <div>

                                                <strong>
                                                    Percentage
                                                </strong>

                                                <p>
                                                    {
                                                        attempt.percentage
                                                    }%
                                                </p>

                                            </div>


                                            <div>

                                                <strong>
                                                    Rating
                                                </strong>

                                                <p>
                                                    {
                                                        attempt.overallRating ||
                                                        "Not available"
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        {/* BUTTON */}

                                        <button
                                            className="primary-button"
                                            onClick={() =>
                                                handleViewResult(
                                                    attempt.id
                                                )
                                            }
                                        >
                                            <Icon name="analytics" /> View Detailed Result
                                        </button>

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </div>

            </main>

        </div>
    );
}

export default InterviewHistory;