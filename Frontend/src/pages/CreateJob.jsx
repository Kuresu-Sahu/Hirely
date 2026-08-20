import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CreateJob() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        jobType: "",
        experience: "",
        salaryMin: "",
        salaryMax: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    // ==========================================
    // CREATE JOB
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            const requestData = {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                jobType: formData.jobType,
                experience: formData.experience,
                salaryMin:
                    formData.salaryMin === ""
                        ? null
                        : Number(formData.salaryMin),
                salaryMax:
                    formData.salaryMax === ""
                        ? null
                        : Number(formData.salaryMax)
            };


            await api.post(
                "/api/jobs",
                requestData
            );


            setSuccess(
                "Job created successfully!"
            );


            setTimeout(() => {

                navigate(
                    "/recruiter/jobs"
                );

            }, 1000);


        } catch (error) {

            console.error(
                "Create job error:",
                error
            );


            if (
                error.response &&
                error.response.data
            ) {

                setError(
                    error.response.data
                );

            } else {

                setError(
                    "Failed to create job"
                );
            }

        } finally {

            setLoading(false);
        }
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
                    className="logout-button"
                    onClick={() =>
                        navigate(
                            "/recruiter/dashboard"
                        )
                    }
                >
                    Back to Dashboard
                </button>

            </nav>


            {/* ======================================
                CREATE JOB
            ====================================== */}

            <main className="dashboard">

                <div className="dashboard-card">

                    <h1>
                        Create Job
                    </h1>

                    <p>
                        Post a new job for candidates.
                    </p>


                    {error && (

                        <div
                            style={{
                                color: "red",
                                marginBottom: "15px"
                            }}
                        >
                            {error}
                        </div>

                    )}


                    {success && (

                        <div
                            style={{
                                color: "green",
                                marginBottom: "15px"
                            }}
                        >
                            {success}
                        </div>

                    )}


                    <form
                        onSubmit={handleSubmit}
                    >

                        {/* JOB TITLE */}

                        <div className="form-group">

                            <label>
                                Job Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Example: Java Full Stack Developer"
                                required
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div className="form-group">

                            <label>
                                Job Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={handleChange}
                                placeholder="Enter job description"
                                rows="6"
                                required
                            />

                        </div>


                        {/* LOCATION */}

                        <div className="form-group">

                            <label>
                                Location
                            </label>

                            <input
                                type="text"
                                name="location"
                                value={
                                    formData.location
                                }
                                onChange={handleChange}
                                placeholder="Example: Bangalore"
                                required
                            />

                        </div>


                        {/* JOB TYPE */}

                        <div className="form-group">

                            <label>
                                Job Type
                            </label>

                            <select
                                name="jobType"
                                value={
                                    formData.jobType
                                }
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

                            </select>

                        </div>


                        {/* EXPERIENCE */}

                        <div className="form-group">

                            <label>
                                Experience
                            </label>

                            <input
                                type="text"
                                name="experience"
                                value={
                                    formData.experience
                                }
                                onChange={handleChange}
                                placeholder="Example: 0-2 years"
                            />

                        </div>


                        {/* SALARY MIN */}

                        <div className="form-group">

                            <label>
                                Minimum Salary
                            </label>

                            <input
                                type="number"
                                name="salaryMin"
                                value={
                                    formData.salaryMin
                                }
                                onChange={handleChange}
                                placeholder="Example: 300000"
                                min="0"
                            />

                        </div>


                        {/* SALARY MAX */}

                        <div className="form-group">

                            <label>
                                Maximum Salary
                            </label>

                            <input
                                type="number"
                                name="salaryMax"
                                value={
                                    formData.salaryMax
                                }
                                onChange={handleChange}
                                placeholder="Example: 600000"
                                min="0"
                            />

                        </div>


                        {/* BUTTONS */}

                        <div
                            style={{
                                marginTop: "20px"
                            }}
                        >

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Creating..."
                                    : "Create Job"}

                            </button>


                            <button
                                type="button"
                                className="logout-button"
                                style={{
                                    marginLeft: "10px"
                                }}
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

export default CreateJob;