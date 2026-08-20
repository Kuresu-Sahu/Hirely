import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";


function MyApplications() {

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [applications, setApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================================================
    // LOAD APPLICATIONS
    // =========================================================

    useEffect(() => {

        const fetchApplications =
            async () => {

                try {

                    const response =
                        await api.get(
                            "/api/applications/my"
                        );


                    console.log(
                        "My applications:",
                        response.data
                    );


                    setApplications(
                        Array.isArray(
                            response.data
                        )
                            ? response.data
                            : []
                    );


                } catch (error) {

                    console.error(
                        "Error loading applications:",
                        error
                    );


                    const message =
                        typeof error.response?.data ===
                            "string"

                            ? error.response.data

                            : error.response?.data?.message

                            || "Unable to load your applications.";


                    setError(
                        message
                    );


                } finally {

                    setLoading(false);
                }
            };


        fetchApplications();

    }, []);


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
                            fontSize: "40px",
                            marginBottom: "15px"
                        }}
                    >
                        <Icon name="clipboard" />
                    </div>


                    <h2>
                        Loading your applications...
                    </h2>

                </div>

            </div>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

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
                        <Icon name="warning" />
                    </div>


                    <h2>
                        Unable to Load Applications
                    </h2>


                    <p
                        style={{
                            color: "#6b7280",
                            lineHeight: "1.6"
                        }}
                    >
                        {error}
                    </p>


                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                "/candidate/dashboard"
                            )
                        }
                    >
                        Back to Dashboard
                    </button>

                </div>

            </div>
        );
    }


    // =========================================================
    // PAGE
    // =========================================================

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
                            "/candidate/dashboard"
                        )
                    }
                >
                    Dashboard
                </button>

            </nav>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="applications-page">

                <div
                    className="applications-header"
                >

                    <h1>
                        My Applications
                    </h1>


                    <p>
                        Track all the jobs you have
                        applied for.
                    </p>

                </div>


                {/* =================================================
                    NO APPLICATIONS
                ================================================= */}

                {applications.length === 0 && (

                    <div
                        className="empty-state"
                    >

                        <div
                            style={{
                                fontSize: "50px",
                                marginBottom: "15px"
                            }}
                        >
                            <Icon name="file" />
                        </div>


                        <h2>
                            No applications yet
                        </h2>


                        <p>
                            You haven't applied for
                            any jobs yet.
                        </p>


                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/jobs"
                                )
                            }
                        >
                            Find Jobs
                        </button>

                    </div>
                )}


                {/* =================================================
                    APPLICATION LIST
                ================================================= */}

                {applications.length > 0 && (

                    <div
                        className="applications-list"
                    >

                        {applications.map(
                            (
                                application,
                                index
                            ) => (

                                <div
                                    className="application-card"
                                    key={
                                        application.applicationId ??
                                        application.id ??
                                        `${application.jobId}-${application.appliedAt ?? index}`
                                    }
                                >

                                    {/* =================================
                                        HEADER
                                    ================================= */}

                                    <div
                                        className="application-header"
                                    >

                                        <div>

                                            <h2>
                                                {
                                                    application.jobTitle ||
                                                    "Job"
                                                }
                                            </h2>


                                            <p
                                                className="company-name"
                                            >

                                                <Icon name="building" />{" "}

                                                {
                                                    application.companyName ||
                                                    "Company"
                                                }

                                            </p>

                                        </div>


                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <span
                                            className={`application-status ${String(
                                                application.status ||
                                                "APPLIED"
                                            ).toLowerCase()}`}
                                        >

                                            {
                                                application.status ||
                                                "APPLIED"
                                            }

                                        </span>

                                    </div>


                                    {/* =================================
                                        APPLICATION INFORMATION
                                    ================================= */}

                                    <div
                                        className="application-info"
                                    >

                                        {application.appliedAt && (

                                            <p>

                                                <Icon name="calendar" /> Applied on:{" "}

                                                {new Date(
                                                    application.appliedAt
                                                ).toLocaleDateString()}

                                            </p>
                                        )}


                                        {application.jobLocation && (

                                            <p>

                                                <Icon name="pin" />{" "}

                                                {
                                                    application.jobLocation
                                                }

                                            </p>
                                        )}

                                    </div>


                                    {/* =================================
                                        COVER LETTER
                                    ================================= */}

                                    {application.coverLetter && (

                                        <div
                                            className="cover-letter"
                                        >

                                            <strong>
                                                Cover Letter
                                            </strong>


                                            <p>
                                                {
                                                    application.coverLetter
                                                }
                                            </p>

                                        </div>
                                    )}


                                    {/* =================================
                                        ACTIONS
                                    ================================= */}

                                    <div
                                        className="application-actions"
                                    >

                                        {application.jobId && (

                                            <button
                                                className="primary-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/jobs/${application.jobId}`
                                                    )
                                                }
                                            >
                                                View Job
                                            </button>
                                        )}

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </main>

        </div>
    );
}


export default MyApplications;