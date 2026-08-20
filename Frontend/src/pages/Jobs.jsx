import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";

function Jobs() {

    const navigate = useNavigate();

    // ==========================================
    // JOB DATA
    // ==========================================

    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // ==========================================
    // SEARCH FILTERS
    // ==========================================

    const [keyword, setKeyword] = useState("");

    const [location, setLocation] = useState("");

    const [jobType, setJobType] = useState("");

    const [experience, setExperience] = useState("");

    const [minSalary, setMinSalary] = useState("");

    const [maxSalary, setMaxSalary] = useState("");


    // ==========================================
    // FETCH JOBS
    // ==========================================

    const fetchJobs = async () => {

        setLoading(true);

        setError("");

        try {

            const params = {};

            // Keyword
            if (keyword.trim()) {

                params.keyword =
                    keyword.trim();
            }

            // Location
            if (location.trim()) {

                params.location =
                    location.trim();
            }

            // Job Type
            if (jobType) {

                params.jobType =
                    jobType;
            }

            // Experience
            if (experience.trim()) {

                params.experience =
                    experience.trim();
            }

            // Minimum Salary
            if (minSalary !== "") {

                params.minSalary =
                    Number(minSalary);
            }

            // Maximum Salary
            if (maxSalary !== "") {

                params.maxSalary =
                    Number(maxSalary);
            }


            // ==================================
            // USE ADVANCED SEARCH ENDPOINT
            // ==================================

            const response =
                await api.get(
                    "/api/jobs/search",
                    {
                        params: params
                    }
                );


            setJobs(response.data);

        } catch (error) {

            console.error(
                "Error loading jobs:",
                error
            );

            setError(
                error.response?.data ||
                "Unable to load jobs. Please try again."
            );

            setJobs([]);

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // LOAD ALL JOBS WHEN PAGE OPENS
    // ==========================================

    useEffect(() => {

        fetchJobs();

    }, []);


    // ==========================================
    // SEARCH
    // ==========================================

    const handleSearch = (event) => {

        event.preventDefault();

        fetchJobs();
    };


    // ==========================================
    // CLEAR FILTERS
    // ==========================================

    const clearFilters = () => {

        setKeyword("");

        setLocation("");

        setJobType("");

        setExperience("");

        setMinSalary("");

        setMaxSalary("");


        // Fetch all jobs directly
        fetchAllJobs();
    };


    // ==========================================
    // FETCH ALL JOBS
    // ==========================================

    const fetchAllJobs = async () => {

        setLoading(true);

        setError("");

        try {

            const response =
                await api.get(
                    "/api/jobs"
                );

            setJobs(response.data);

        } catch (error) {

            console.error(
                "Error loading jobs:",
                error
            );

            setError(
                "Unable to load jobs."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // FORMAT SALARY
    // ==========================================

    const formatSalary = (salary) => {

        if (
            salary === null ||
            salary === undefined
        ) {

            return null;
        }


        return Number(salary).toLocaleString(
            "en-IN"
        );
    };


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
                    Dashboard
                </button>

            </nav>


            {/* ======================================
                MAIN CONTENT
            ====================================== */}

            <main className="jobs-page">


                {/* ==================================
                    HEADER
                ================================== */}

                <div className="jobs-header">

                    <h1>
                        Find Your Next Job
                    </h1>

                    <p>
                        Search thousands of opportunities
                        and find the right job for you.
                    </p>

                </div>


                {/* ==================================
                    ADVANCED SEARCH
                ================================== */}

                <div
                    className="dashboard-card"
                    style={{
                        marginBottom: "30px"
                    }}
                >

                    <h2>
                        <Icon name="search" /> Search & Filter Jobs
                    </h2>


                    <form
                        onSubmit={handleSearch}
                    >


                        {/* ==========================
                            KEYWORD + LOCATION
                        ========================== */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "15px",
                                marginTop: "20px"
                            }}
                        >

                            <div className="form-group">

                                <label>
                                    Keyword
                                </label>

                                <input
                                    type="text"
                                    placeholder="Java, React, Developer..."
                                    value={keyword}
                                    onChange={(event) =>
                                        setKeyword(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    placeholder="Bangalore, Hyderabad..."
                                    value={location}
                                    onChange={(event) =>
                                        setLocation(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* ==========================
                                JOB TYPE
                            ========================== */}

                            <div className="form-group">

                                <label>
                                    Job Type
                                </label>

                                <select
                                    value={jobType}
                                    onChange={(event) =>
                                        setJobType(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Job Types
                                    </option>

                                    <option value="FULL_TIME">
                                        Full Time
                                    </option>

                                    <option value="PART_TIME">
                                        Part Time
                                    </option>

                                    <option value="INTERNSHIP">
                                        Internship
                                    </option>

                                    <option value="CONTRACT">
                                        Contract
                                    </option>

                                </select>

                            </div>


                            {/* ==========================
                                EXPERIENCE
                            ========================== */}

                            <div className="form-group">

                                <label>
                                    Experience
                                </label>

                                <input
                                    type="text"
                                    placeholder="0-2 years"
                                    value={experience}
                                    onChange={(event) =>
                                        setExperience(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* ==========================
                                MIN SALARY
                            ========================== */}

                            <div className="form-group">

                                <label>
                                    Minimum Salary
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="300000"
                                    value={minSalary}
                                    onChange={(event) =>
                                        setMinSalary(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>


                            {/* ==========================
                                MAX SALARY
                            ========================== */}

                            <div className="form-group">

                                <label>
                                    Maximum Salary
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    placeholder="800000"
                                    value={maxSalary}
                                    onChange={(event) =>
                                        setMaxSalary(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* ==================================
                            BUTTONS
                        ================================== */}

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                                marginTop: "20px"
                            }}
                        >

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={loading}
                            >

                                <Icon name="search" />
                                {" "}
                                {loading
                                    ? "Searching..."
                                    : "Search Jobs"}

                            </button>


                            <button
                                type="button"
                                className="clear-button"
                                onClick={
                                    clearFilters
                                }
                            >
                                <Icon name="close" /> Clear Filters
                            </button>

                        </div>

                    </form>

                </div>


                {/* ==================================
                    RESULTS COUNT
                ================================== */}

                {!loading &&
                    !error &&
                    jobs.length > 0 && (

                        <div
                            style={{
                                marginBottom: "20px"
                            }}
                        >

                            <h2>
                                {jobs.length}{" "}
                                {jobs.length === 1
                                    ? "Job"
                                    : "Jobs"}{" "}
                                Found
                            </h2>

                        </div>
                    )
                }


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="error-message">

                        {error}

                    </div>

                )}


                {/* ==================================
                    LOADING
                ================================== */}

                {loading && (

                    <div className="loading">

                        <h2>
                            Finding jobs...
                        </h2>

                        <p>
                            Please wait.
                        </p>

                    </div>

                )}


                {/* ==================================
                    NO JOBS
                ================================== */}

                {!loading &&
                    !error &&
                    jobs.length === 0 && (

                        <div className="empty-state">

                            <h2>
                                No jobs found
                            </h2>

                            <p>
                                Try changing your
                                search filters.
                            </p>


                            <button
                                className="primary-button"
                                onClick={
                                    clearFilters
                                }
                            >
                                Show All Jobs
                            </button>

                        </div>
                    )
                }


                {/* ==================================
                    JOB LIST
                ================================== */}

                {!loading &&
                    jobs.length > 0 && (

                        <div className="jobs-grid">

                            {jobs.map((job) => (

                                <div
                                    className="job-card"
                                    key={job.id}
                                >

                                    {/* ==========================
                                        HEADER
                                    ========================== */}

                                    <div
                                        className="job-card-header"
                                    >

                                        <div>

                                            <h2>
                                                {job.title}
                                            </h2>

                                        </div>


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

                                                {job.salaryMin
                                                    ? `₹${formatSalary(
                                                        job.salaryMin
                                                    )}`
                                                    : "Not specified"}

                                                {" - "}

                                                {job.salaryMax
                                                    ? `₹${formatSalary(
                                                        job.salaryMax
                                                    )}`
                                                    : "Negotiable"}

                                            </p>

                                        )}


                                    {/* ==========================
                                        DESCRIPTION
                                    ========================== */}

                                    <p
                                        className="job-description"
                                    >

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
                                                    `/jobs/${job.id}`
                                                )
                                            }
                                        >
                                            <Icon name="eye" /> View Details
                                        </button>


                                        <button
                                            className="secondary-button"
                                            onClick={() =>
                                                navigate(
                                                    `/resume-analysis/${job.id}`
                                                )
                                            }
                                        >
                                            <Icon name="bot" /> Analyze Resume
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>
                    )
                }

            </main>

        </div>
    );
}

export default Jobs;