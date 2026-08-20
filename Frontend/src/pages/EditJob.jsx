import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";

function EditJob() {

    const navigate = useNavigate();

    const { id } = useParams();


    // ==========================================
    // STATE
    // ==========================================

    const [formData, setFormData] = useState({

        title: "",
        description: "",
        location: "",
        jobType: "",
        experience: "",
        salaryMin: "",
        salaryMax: ""

    });


    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ==========================================
    // LOAD JOB
    // ==========================================

    useEffect(() => {

        const loadJob = async () => {

            try {

                const response =
                    await api.get(
                        `/api/jobs/${id}`
                    );


                const job = response.data;


                setFormData({

                    title: job.title || "",

                    description:
                        job.description || "",

                    location:
                        job.location || "",

                    jobType:
                        job.jobType || "",

                    experience:
                        job.experience || "",

                    salaryMin:
                        job.salaryMin ?? "",

                    salaryMax:
                        job.salaryMax ?? ""

                });


            } catch (error) {

                console.error(
                    "Error loading job:",
                    error
                );


                setError(
                    error.response?.data ||
                    "Unable to load job."
                );

            } finally {

                setLoading(false);

            }

        };


        loadJob();

    }, [id]);


    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData((previousData) => ({

            ...previousData,

            [name]: value

        }));

    };


    // ==========================================
    // UPDATE JOB
    // ==========================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        setError("");

        setSuccess("");

        setSaving(true);


        try {

            const requestData = {

                title:
                    formData.title,

                description:
                    formData.description,

                location:
                    formData.location,

                jobType:
                    formData.jobType,

                experience:
                    formData.experience,

                salaryMin:
                    formData.salaryMin === ""
                        ? null
                        : Number(formData.salaryMin),

                salaryMax:
                    formData.salaryMax === ""
                        ? null
                        : Number(formData.salaryMax)

            };


            await api.put(
                `/api/jobs/${id}`,
                requestData
            );


            setSuccess(
                "Job updated successfully."
            );


            // Go back to recruiter jobs page

            setTimeout(() => {

                navigate(
                    "/recruiter/jobs"
                );

            }, 1000);


        } catch (error) {

            console.error(
                "Update job error:",
                error
            );


            setError(
                error.response?.data ||
                "Unable to update job."
            );

        } finally {

            setSaving(false);

        }

    };


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
    // UI
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
                            "/recruiter/jobs"
                        )
                    }
                >
                    <Icon name="left" /> My Jobs
                </button>

            </nav>


            {/* ======================================
                MAIN CONTENT
            ====================================== */}

            <main className="form-page">

                <div className="form-container">

                    <h1>
                        <Icon name="edit" /> Edit Job
                    </h1>

                    <p>
                        Update the details of your job posting.
                    </p>


                    {/* ==================================
                        ERROR
                    ================================== */}

                    {error && (

                        <div className="error-message">

                            {error}

                        </div>

                    )}


                    {/* ==================================
                        SUCCESS
                    ================================== */}

                    {success && (

                        <div className="success-message">

                            {success}

                        </div>

                    )}


                    {/* ==================================
                        FORM
                    ================================== */}

                    <form
                        onSubmit={handleSubmit}
                    >

                        {/* ==============================
                            JOB TITLE
                        ============================== */}

                        <div className="form-group">

                            <label>
                                Job Title *
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Example: Java Developer"
                                required
                            />

                        </div>


                        {/* ==============================
                            DESCRIPTION
                        ============================== */}

                        <div className="form-group">

                            <label>
                                Job Description *
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the job responsibilities, requirements and skills..."
                                rows="8"
                                required
                            />

                        </div>


                        {/* ==============================
                            LOCATION
                        ============================== */}

                        <div className="form-group">

                            <label>
                                Location *
                            </label>

                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Example: Bangalore"
                                required
                            />

                        </div>


                        {/* ==============================
                            JOB TYPE
                        ============================== */}

                        <div className="form-group">

                            <label>
                                Job Type *
                            </label>

                            <select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleChange}
                                required
                            >

                                <option value="">
                                    Select Job Type
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

                                <option value="REMOTE">
                                    Remote
                                </option>

                            </select>

                        </div>


                        {/* ==============================
                            EXPERIENCE
                        ============================== */}

                        <div className="form-group">

                            <label>
                                Experience
                            </label>

                            <input
                                type="text"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                placeholder="Example: 0-2 years"
                            />

                        </div>


                        {/* ==============================
                            SALARY
                        ============================== */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1fr 1fr",
                                gap: "15px"
                            }}
                        >

                            {/* MIN SALARY */}

                            <div className="form-group">

                                <label>
                                    Minimum Salary
                                </label>

                                <input
                                    type="number"
                                    name="salaryMin"
                                    value={formData.salaryMin}
                                    onChange={handleChange}
                                    placeholder="Example: 400000"
                                    min="0"
                                />

                            </div>


                            {/* MAX SALARY */}

                            <div className="form-group">

                                <label>
                                    Maximum Salary
                                </label>

                                <input
                                    type="number"
                                    name="salaryMax"
                                    value={formData.salaryMax}
                                    onChange={handleChange}
                                    placeholder="Example: 800000"
                                    min="0"
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
                                marginTop: "20px",
                                flexWrap: "wrap"
                            }}
                        >

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}

                            </button>


                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() =>
                                    navigate(
                                        "/recruiter/jobs"
                                    )
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>

    );

}

export default EditJob;