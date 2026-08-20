import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";


function ApplyJob() {

    const { id } = useParams();

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [job, setJob] =
        useState(null);

    const [coverLetter, setCoverLetter] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =========================================================
    // SUBMIT LOCK
    // =========================================================
    // Prevents accidental double-clicks before React finishes
    // updating the submitting state.
    // =========================================================

    const submitLock =
        useRef(false);


    // =========================================================
    // LOAD JOB
    // =========================================================

    useEffect(() => {

        const fetchJob = async () => {

            setLoading(true);

            setError("");


            try {

                const response =
                    await api.get(
                        `/api/jobs/${id}`
                    );


                setJob(
                    response.data
                );


            } catch (error) {

                console.error(
                    "Error loading job:",
                    error
                );


                const message =
                    typeof error.response?.data ===
                        "string"

                        ? error.response.data

                        : error.response?.data?.message

                        || "Unable to load job details.";


                setError(
                    message
                );


            } finally {

                setLoading(false);
            }
        };


        if (id) {

            fetchJob();

        } else {

            setError(
                "Invalid job ID."
            );

            setLoading(false);
        }


    }, [id]);


    // =========================================================
    // COVER LETTER CHANGE
    // =========================================================

    const handleCoverLetterChange = (
        event
    ) => {

        setCoverLetter(
            event.target.value
        );


        if (error) {

            setError("");
        }


        if (success) {

            setSuccess("");
        }
    };


    // =========================================================
    // SUBMIT APPLICATION
    // =========================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        // -----------------------------------------------------
        // PREVENT DOUBLE SUBMIT
        // -----------------------------------------------------

        if (
            submitLock.current ||
            submitting
        ) {

            return;
        }


        setError("");

        setSuccess("");


        // -----------------------------------------------------
        // COVER LETTER VALIDATION
        // -----------------------------------------------------

        const trimmedCoverLetter =
            coverLetter.trim();


        if (!trimmedCoverLetter) {

            setError(
                "Please write a cover letter before applying."
            );

            return;
        }


        if (
            trimmedCoverLetter.length < 20
        ) {

            setError(
                `Your cover letter must contain at least 20 characters. You currently have ${trimmedCoverLetter.length} characters.`
            );

            return;
        }


        if (
            trimmedCoverLetter.length > 5000
        ) {

            setError(
                "Your cover letter cannot exceed 5000 characters."
            );

            return;
        }


        // -----------------------------------------------------
        // LOCK SUBMISSION
        // -----------------------------------------------------

        submitLock.current = true;

        setSubmitting(true);


        try {

            const response =
                await api.post(
                    "/api/applications",
                    {
                        jobId:
                            Number(id),

                        coverLetter:
                            trimmedCoverLetter
                    }
                );


            console.log(
                "Application submitted:",
                response.data
            );


            setSuccess(
                "Application submitted successfully!"
            );


            setCoverLetter("");


        } catch (error) {

            console.error(
                "Application error:",
                error
            );


            let message =
                "Unable to submit application.";


            // -------------------------------------------------
            // DUPLICATE APPLICATION
            // -------------------------------------------------

            if (
                error.response?.status === 409
            ) {

                message =
                    "You have already applied for this job.";

            }

            // -------------------------------------------------
            // VALIDATION ERROR
            // -------------------------------------------------

            else if (
                error.response?.status === 400
            ) {

                const responseData =
                    error.response.data;


                if (
                    typeof responseData ===
                    "string"
                ) {

                    message =
                        responseData;

                } else if (
                    responseData?.message
                ) {

                    message =
                        responseData.message;

                } else {

                    message =
                        "Please check your application details and try again.";
                }

            }

            // -------------------------------------------------
            // OTHER SERVER ERROR
            // -------------------------------------------------

            else if (
                error.response?.data?.message
            ) {

                message =
                    error.response.data.message;

            }


            setError(
                message
            );


        } finally {

            submitLock.current = false;

            setSubmitting(false);
        }
    };


    // =========================================================
    // CHARACTER COUNT
    // =========================================================

    const characterCount =
        coverLetter.trim().length;


    const characterCountColor =
        characterCount < 20
            ? "#dc2626"
            : characterCount > 5000
                ? "#dc2626"
                : "#16a34a";


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
                        <Icon name="briefcase" />
                    </div>


                    <h2>
                        Loading job...
                    </h2>

                </div>

            </div>
        );
    }


    // =========================================================
    // JOB LOAD ERROR
    // =========================================================

    if (
        error &&
        !job
    ) {

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
                        Unable to Load Job
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
                            `/jobs/${id}`
                        )
                    }
                    disabled={submitting}
                >
                    <Icon name="left" /> Back to Job
                </button>

            </nav>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="apply-page">

                <div className="apply-card">

                    {/* =========================================
                        JOB INFORMATION
                    ========================================= */}

                    <div
                        className="apply-job-header"
                    >

                        <h1>
                            Apply for this Job
                        </h1>


                        <h2>
                            {job?.title}
                        </h2>


                        <p>
                            <Icon name="building" />{" "}
                            {job?.company?.name ||
                                "Company"}
                        </p>


                        <p>
                            <Icon name="pin" />{" "}
                            {job?.location ||
                                "Location not specified"}
                        </p>

                    </div>


                    {/* =========================================
                        ERROR
                    ========================================= */}

                    {error && (

                        <div
                            className="error-message"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}


                    {/* =========================================
                        SUCCESS
                    ========================================= */}

                    {success && (

                        <div
                            className="success-message"
                            role="status"
                        >

                            <h3>
                                <Icon name="check" /> Application Submitted
                            </h3>


                            <p>
                                {success}
                            </p>


                            <div
                                className="application-success-actions"
                            >

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate(
                                            "/my-applications"
                                        )
                                    }
                                >
                                    View My Applications
                                </button>


                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        navigate(
                                            `/jobs/${id}`
                                        )
                                    }
                                >
                                    Back to Job
                                </button>

                            </div>

                        </div>
                    )}


                    {/* =========================================
                        APPLICATION FORM
                    ========================================= */}

                    {!success && (

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="application-form"
                        >

                            <div className="form-group">

                                <label
                                    htmlFor="coverLetter"
                                >
                                    Cover Letter
                                </label>


                                <textarea
                                    id="coverLetter"
                                    rows="10"
                                    placeholder="Write a short cover letter explaining why you are a good fit for this position..."
                                    value={
                                        coverLetter
                                    }
                                    onChange={
                                        handleCoverLetterChange
                                    }
                                    disabled={
                                        submitting
                                    }
                                    required
                                    minLength={20}
                                    maxLength={5000}
                                />


                                {/* =================================
                                    CHARACTER COUNT
                                ================================= */}

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        marginTop: "7px",
                                        fontSize: "13px"
                                    }}
                                >

                                    <span
                                        style={{
                                            color:
                                                characterCount < 20
                                                    ? "#dc2626"
                                                    : "#6b7280"
                                        }}
                                    >

                                        {characterCount < 20

                                            ? `At least ${20 - characterCount} more characters required`

                                            : "Minimum requirement satisfied"}

                                    </span>


                                    <span
                                        style={{
                                            color:
                                                characterCountColor,
                                            fontWeight: "600"
                                        }}
                                    >
                                        {characterCount}/5000
                                    </span>

                                </div>

                            </div>


                            {/* =========================================
                                FORM ACTIONS
                            ========================================= */}

                            <div
                                className="form-actions"
                            >

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        navigate(
                                            `/jobs/${id}`
                                        )
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        submitting ||
                                        characterCount < 20 ||
                                        characterCount > 5000
                                    }
                                >

                                    {submitting

                                        ? "Submitting..."

                                        : "Submit Application"}

                                </button>

                            </div>

                        </form>
                    )}

                </div>

            </main>

        </div>
    );
}


export default ApplyJob;