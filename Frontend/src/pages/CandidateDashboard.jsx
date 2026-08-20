import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import NotificationBell
    from "./NotificationBell";
import Icon from "../components/Icon";


function CandidateDashboard() {

    const navigate = useNavigate();


    const {
        user,
        logout
    } = useAuth();


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


                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px"
                    }}
                >

                    <NotificationBell />


                    <span>
                        Welcome, {user?.name}
                    </span>


                    <button
                        onClick={logout}
                        className="logout-button"
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* ======================================
                MAIN DASHBOARD
            ====================================== */}

            <main className="dashboard">

                <h1>
                    Candidate Dashboard
                </h1>


                <p>
                    Find jobs, upload your resume,
                    and analyze your resume with AI.
                </p>


                {/* ==================================
                    NOTIFICATION SHORTCUT
                ================================== */}

                <div
                    className="dashboard-card"
                    style={{
                        marginBottom: "25px"
                    }}
                >

                    <h2>
                        <Icon name="bell" /> Notifications
                    </h2>


                    <p>
                        View your application,
                        interview and recruitment
                        updates.
                    </p>


                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                "/notifications"
                            )
                        }
                    >
                        View Notifications
                    </button>

                </div>


                <div className="dashboard-grid">

                    {/* ==================================
                        FIND JOBS
                    ================================== */}

                    <div
                        className="dashboard-card"
                        onClick={() =>
                            navigate("/jobs")
                        }
                    >

                        <h2>
                            <Icon name="search" /> Find Jobs
                        </h2>


                        <p>
                            Search and explore available
                            job opportunities.
                        </p>

                    </div>


                    {/* ==================================
                        MY RESUME
                    ================================== */}

                    <div
                        className="dashboard-card"
                        onClick={() =>
                            navigate("/resume")
                        }
                    >

                        <h2>
                            <Icon name="file" /> My Resume
                        </h2>


                        <p>
                            Upload and manage your resume.
                        </p>

                    </div>


                    {/* ==================================
                        AI RESUME ANALYZER
                    ================================== */}

                    <div
                        className="dashboard-card"
                    >

                        <h2>
                            <Icon name="bot" /> AI Resume Analyzer
                        </h2>


                        <p>
                            Analyze your resume against
                            a job and get an ATS score,
                            keyword matching and
                            improvement suggestions.
                        </p>


                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                                marginTop: "15px"
                            }}
                        >

                            <button
                                className="primary-button"
                                onClick={(event) => {

                                    event.stopPropagation();

                                    navigate("/jobs");

                                }}
                            >
                                <Icon name="search" /> Analyze for a Job
                            </button>


                            <button
                                className="secondary-button"
                                onClick={(event) => {

                                    event.stopPropagation();

                                    navigate(
                                        "/resume-analysis/history"
                                    );

                                }}
                            >
                                <Icon name="analytics" /> View Analysis History
                            </button>

                        </div>

                    </div>


                    {/* ==================================
                        MY APPLICATIONS
                    ================================== */}

                    <div
                        className="dashboard-card"
                        onClick={() =>
                            navigate(
                                "/my-applications"
                            )
                        }
                    >

                        <h2>
                            <Icon name="clipboard" /> My Applications
                        </h2>


                        <p>
                            Track the jobs you have
                            applied for.
                        </p>

                    </div>


                    {/* ==================================
                        INTERVIEW HISTORY
                    ================================== */}

                    <div
                        className="dashboard-card"
                        onClick={() =>
                            navigate(
                                "/candidate/interview/history"
                            )
                        }
                    >

                        <h2>
                            <Icon name="interview" /> Interview History
                        </h2>


                        <p>
                            Review your previous AI interview
                            attempts, scores and detailed feedback.
                        </p>

                    </div>


                    {/* ==================================
                        RESUME ANALYSIS HISTORY
                    ================================== */}

                    <div
                        className="dashboard-card"
                        onClick={() =>
                            navigate(
                                "/resume-analysis/history"
                            )
                        }
                    >

                        <h2>
                            <Icon name="analytics" /> Resume Analysis History
                        </h2>


                        <p>
                            Review your previous ATS scores,
                            matched keywords, missing keywords,
                            strengths and AI suggestions.
                        </p>


                        <p
                            style={{
                                marginTop: "10px",
                                fontWeight: "600"
                            }}
                        >
                            View previous analyses <Icon name="right" />
                        </p>

                    </div>

                </div>

            </main>

        </div>
    );
}


export default CandidateDashboard;