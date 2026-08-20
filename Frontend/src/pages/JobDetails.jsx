import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";

function JobDetails() {

    const { id } = useParams();

    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [job, setJob] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================
    // LOAD JOB
    // ==========================================

    useEffect(() => {

        const fetchJob = async () => {

            try {

                const response =
                    await api.get(`/api/jobs/${id}`);

                setJob(response.data);

            } catch (error) {

                console.error(
                    "Error loading job:",
                    error
                );

                setError(
                    error.response?.data ||
                    "Unable to load job details."
                );

            } finally {

                setLoading(false);
            }
        };


        fetchJob();

    }, [id]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="page-center">

                <h2>
                    Loading job...
                </h2>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error || !job) {

        return (

            <div className="page-center">

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
        );
    }


    // ==========================================
    // START AI INTERVIEW
    // ==========================================

    const handleStartAIInterview = () => {

        console.log(
            "Starting AI interview for job:",
            job.id
        );

        navigate(
            `/candidate/interview/${job.id}`
        );
    };


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
                    onClick={() =>
                        navigate("/jobs")
                    }
                >
                    <Icon name="left" /> Back to Jobs
                </button>

            </nav>


            {/* ======================================
                JOB DETAILS
            ====================================== */}

            <main className="job-details-page">

                <div className="job-details-card">


                    {/* ==================================
                        HEADER
                    ================================== */}

                    <div className="job-details-header">

                        <div>

                            <h1>
                                {job.title}
                            </h1>


                            <h3>
                                <Icon name="building" />{" "}

                                {job.company?.name ||
                                    "Company"}

                            </h3>

                        </div>


                        <span className="job-type">

                            {job.jobType}

                        </span>

                    </div>


                    {/* ==================================
                        BASIC INFORMATION
                    ================================== */}

                    <div className="job-info-grid">

                        <div>

                            <strong>
                                <Icon name="pin" /> Location
                            </strong>

                            <p>
                                {job.location}
                            </p>

                        </div>


                        <div>

                            <strong>
                                <Icon name="briefcase" /> Experience
                            </strong>

                            <p>
                                {job.experience ||
                                    "Not specified"}
                            </p>

                        </div>


                        <div>

                            <strong>
                                <Icon name="chart" /> Salary
                            </strong>

                            <p>

                                {job.salaryMin ||
                                    job.salaryMax

                                    ? `${job.salaryMin || 0} - ${job.salaryMax ||
                                    "Negotiable"
                                    }`

                                    : "Not specified"}

                            </p>

                        </div>

                    </div>


                    {/* ==================================
                        DESCRIPTION
                    ================================== */}

                    <section className="job-section">

                        <h2>
                            Job Description
                        </h2>


                        <p className="job-full-description">

                            {job.description}

                        </p>

                    </section>


                    {/* ==================================
                        COMPANY
                    ================================== */}

                    {job.company && (

                        <section className="job-section">

                            <h2>
                                About the Company
                            </h2>


                            <h3>
                                {job.company.name}
                            </h3>


                            {job.company.description && (

                                <p>
                                    {job.company.description}
                                </p>

                            )}


                            {job.company.location && (

                                <p>
                                    <Icon name="pin" />{" "}
                                    {job.company.location}
                                </p>

                            )}


                            {job.company.website && (

                                <p>

                                    <Icon name="globe" />{" "}

                                    <a
                                        href={
                                            job.company.website
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {job.company.website}
                                    </a>

                                </p>

                            )}

                        </section>

                    )}


                    {/* ==================================
                        ACTIONS
                    ================================== */}

                    <div className="job-actions">


                        {/* APPLY */}

                        <button
                            className="primary-button apply-button"
                            onClick={() =>
                                navigate(
                                    `/jobs/${job.id}/apply`
                                )
                            }
                        >
                            Apply for this Job
                        </button>


                        {/* AI RESUME ANALYSIS */}

                        <button
                            className="secondary-button"
                            onClick={() =>
                                navigate(
                                    `/resume-analysis/${job.id}`
                                )
                            }
                        >
                            <Icon name="bot" /> Analyze My Resume
                        </button>


                        {/* AI INTERVIEW */}

                        <button
                            className="primary-button"
                            onClick={
                                handleStartAIInterview
                            }
                        >
                            <Icon name="interview" /> Start AI Interview
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}


export default JobDetails;