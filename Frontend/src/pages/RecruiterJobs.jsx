import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";

function RecruiterJobs() {

    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [deletingId, setDeletingId] = useState(null);


    // ==========================================
    // LOAD MY JOBS
    // ==========================================

    useEffect(() => {

        fetchJobs();

    }, []);


    const fetchJobs = async () => {

        setLoading(true);

        setError("");

        try {

            /*
             * We use /api/jobs here because your
             * existing backend already provides
             * GET /api/jobs.
             *
             * Later, if you want strict "my jobs"
             * filtering on the backend, we can add it.
             */

            const response =
                await api.get("/api/jobs/my");

            setJobs(response.data);

        } catch (error) {

            console.error(
                "Error loading jobs:",
                error
            );

            setError(
                error.response?.data ||
                "Unable to load jobs."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // DELETE JOB
    // ==========================================

    const handleDelete = async (jobId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this job?"
            );


        if (!confirmed) {

            return;
        }


        setDeletingId(jobId);

        setError("");


        try {

            await api.delete(
                `/api/jobs/${jobId}`
            );


            // Remove deleted job from UI

            setJobs((previousJobs) =>
                previousJobs.filter(
                    (job) =>
                        job.id !== jobId
                )
            );


        } catch (error) {

            console.error(
                "Delete job error:",
                error
            );

            setError(
                error.response?.data ||
                "Unable to delete the job."
            );

        } finally {

            setDeletingId(null);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="page-center">

                <h2>
                    Loading jobs...
                </h2>

            </div>
        );
    }


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
                            "/recruiter/dashboard"
                        )
                    }
                >
                    <Icon name="left" /> Dashboard
                </button>

            </nav>


            {/* ======================================
                MAIN CONTENT
            ====================================== */}

            <main className="jobs-page">

                {/* ==================================
                    HEADER
                ================================== */}

                <div
                    className="jobs-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "20px",
                        flexWrap: "wrap"
                    }}
                >

                    <div>

                        <h1>
                            <Icon name="briefcase" /> My Jobs
                        </h1>

                        <p>
                            Create and manage your job postings.
                        </p>

                    </div>


                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                "/recruiter/jobs/create"
                            )
                        }
                    >
                        + Create New Job
                    </button>

                </div>


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="error-message">

                        {error}

                    </div>

                )}


                {/* ==================================
                    NO JOBS
                ================================== */}

                {!error &&
                    jobs.length === 0 && (

                        <div className="empty-state">

                            <h2>
                                No jobs posted yet
                            </h2>

                            <p>
                                Create your first job posting
                                to start receiving applications.
                            </p>


                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate(
                                        "/recruiter/jobs/create"
                                    )
                                }
                            >
                                Create Your First Job
                            </button>

                        </div>
                    )
                }


                {/* ==================================
                    JOB LIST
                ================================== */}

                {jobs.length > 0 && (

                    <div className="jobs-grid">

                        {jobs.map((job) => (

                            <div
                                className="job-card"
                                key={job.id}
                            >

                                {/* ==========================
                                    JOB HEADER
                                ========================== */}

                                <div
                                    className="job-card-header"
                                >

                                    <h2>
                                        {job.title}
                                    </h2>


                                    <span
                                        className="job-type"
                                    >
                                        {job.jobType}
                                    </span>

                                </div>


                                {/* ==========================
                                    COMPANY
                                ========================== */}

                                <p className="company-name">

                                    <Icon name="building" />{" "}

                                    {job.company?.name ||
                                        "Company"}

                                </p>


                                {/* ==========================
                                    LOCATION
                                ========================== */}

                                <p className="job-location">

                                    <Icon name="pin" />{" "}

                                    {job.location}

                                </p>


                                {/* ==========================
                                    EXPERIENCE
                                ========================== */}

                                {job.experience && (

                                    <p>

                                        <Icon name="briefcase" /> Experience:{" "}

                                        {job.experience}

                                    </p>

                                )}


                                {/* ==========================
                                    SALARY
                                ========================== */}

                                {(job.salaryMin ||
                                    job.salaryMax) && (

                                        <p>

                                            <Icon name="chart" /> Salary:{" "}

                                            {job.salaryMin ||
                                                0}

                                            {" - "}

                                            {job.salaryMax ||
                                                "Negotiable"}

                                        </p>

                                    )}


                                {/* ==========================
                                    DESCRIPTION
                                ========================== */}

                                <p className="job-description">

                                    {job.description &&
                                        job.description.length > 150

                                        ? job.description.substring(
                                            0,
                                            150
                                        ) + "..."

                                        : job.description}

                                </p>


                                {/* ==========================
                                    ACTIONS
                                ========================== */}

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
                                        onClick={() =>
                                            navigate(
                                                `/recruiter/jobs/edit/${job.id}`
                                            )
                                        }
                                    >
                                        <Icon name="edit" /> Edit
                                    </button>


                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            navigate(
                                                `/recruiter/jobs/${job.id}/applicants`
                                            )
                                        }
                                    >
                                        <Icon name="users" /> Applicants
                                    </button>


                                    <button
                                        className="clear-button"
                                        disabled={
                                            deletingId ===
                                            job.id
                                        }
                                        onClick={() =>
                                            handleDelete(
                                                job.id
                                            )
                                        }
                                    >

                                        {deletingId === job.id
                                            ? "Deleting..."
                                            : <><Icon name="delete" /> Delete</>}

                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </main>

        </div>
    );
}

export default RecruiterJobs;