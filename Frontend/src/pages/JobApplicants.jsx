import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";


function JobApplicants() {

    const navigate = useNavigate();

    const { jobId } = useParams();


    // ==========================================
    // STATE
    // ==========================================

    const [applications, setApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [updatingId, setUpdatingId] =
        useState(null);

    const [resumeLoadingId, setResumeLoadingId] =
        useState(null);

    const [downloadLoadingId, setDownloadLoadingId] =
        useState(null);


    // ==========================================
    // LOAD APPLICANTS
    // ==========================================

    useEffect(() => {

        const loadApplicants = async () => {

            try {

                setLoading(true);

                setError("");

                if (
                    !jobId ||
                    String(jobId).trim() === "" ||
                    String(jobId) === "undefined" ||
                    String(jobId) === "null"
                ) {
                    setApplications([]);
                    setError(
                        "Job ID is missing. Unable to load applicants for this job."
                    );
                    return;
                }


                const response =
                    await api.get(
                        `/api/applications/job/${jobId}`
                    );


                setApplications(
                    response.data
                );


            } catch (error) {

                console.error(
                    "Error loading applicants:",
                    error
                );

                const responseData =
                    error.response?.data;

                const message =
                    typeof responseData === "string"
                        ? responseData
                        : responseData?.message
                            ? String(responseData.message)
                            : error.message ||
                              "Unable to load applicants.";

                setError(message);


            } finally {

                setLoading(false);
            }
        };


        loadApplicants();

    }, [jobId]);


    // ==========================================
    // UPDATE STATUS
    // ==========================================

    const handleStatusChange = async (
        applicationId,
        newStatus
    ) => {

        setUpdatingId(
            applicationId
        );

        setError("");


        try {

            const response =
                await api.put(
                    `/api/applications/${applicationId}/status`,
                    {
                        status: newStatus
                    }
                );


            setApplications(
                previous =>
                    previous.map(
                        application =>
                            application.applicationId ===
                                applicationId

                                ? response.data

                                : application
                    )
            );


        } catch (error) {

            console.error(
                "Status update error:",
                error
            );


            const responseData =
                error.response?.data;

            const message =
                typeof responseData === "string"
                    ? responseData
                    : responseData?.message
                        ? String(responseData.message)
                        : error.message ||
                          "Unable to update application status.";

            setError(message);


        } finally {

            setUpdatingId(null);
        }
    };


    // ==========================================
    // VIEW CANDIDATE EVALUATION
    // ==========================================

    const handleViewEvaluation = (
        applicationId
    ) => {

        navigate(
            `/recruiter/applications/${applicationId}/evaluation`
        );
    };


    // ==========================================
    // VIEW AI INTERVIEW
    // ==========================================

    const handleViewInterview = (
        applicationId
    ) => {

        /*
         * IMPORTANT:
         *
         * App.jsx uses:
         *
         * /recruiter/interview/:applicationId
         *
         * Therefore we must navigate to that
         * exact route.
         */

        navigate(
            `/recruiter/interview/${applicationId}`
        );
    };


    // ==========================================
    // OPEN RESUME
    // ==========================================

    const handleViewResume = async (
        applicationId
    ) => {

        setResumeLoadingId(
            applicationId
        );

        setError("");


        try {

            const response =
                await api.get(
                    `/api/applications/${applicationId}/resume`,
                    {
                        responseType:
                            "blob"
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
                        type:
                            contentType
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
                "Unable to open resume."
            );


        } finally {

            setResumeLoadingId(
                null
            );
        }
    };


    // ==========================================
    // DOWNLOAD RESUME
    // ==========================================

    const handleDownloadResume = async (
        applicationId,
        candidateName
    ) => {

        setDownloadLoadingId(
            applicationId
        );

        setError("");


        try {

            const response =
                await api.get(
                    `/api/applications/${applicationId}/resume/download`,
                    {
                        responseType:
                            "blob"
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
                        type:
                            contentType
                    }
                );


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");


            link.href =
                url;


            const safeName =
                candidateName
                    ? candidateName.replace(
                        /[^a-z0-9]/gi,
                        "_"
                    )
                    : "candidate";


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
                "Unable to download resume."
            );


        } finally {

            setDownloadLoadingId(
                null
            );
        }
    };


    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "Not available";
        }


        try {

            return new Date(
                date
            ).toLocaleString();

        } catch {

            return "Not available";
        }
    };


    // ==========================================
    // STATUS LABEL
    // ==========================================

    const getStatusLabel = (
        status
    ) => {

        switch (status) {

            case "APPLIED":
                return "Applied";

            case "SHORTLISTED":
                return "Shortlisted";

            case "INTERVIEW":
                return "Interview";

            case "SELECTED":
                return "Selected";

            case "REJECTED":
                return "Rejected";

            default:
                return status ||
                    "Applied";
        }
    };


    // ==========================================
    // STATUS STYLE
    // ==========================================

    const getStatusClassName = (status) => {

        switch (status) {

            case "SHORTLISTED":
                return "status-badge status-shortlisted";

            case "INTERVIEW":
                return "status-badge status-interview";

            case "SELECTED":
                return "status-badge status-selected";

            case "REJECTED":
                return "status-badge status-rejected";

            default:
                return "status-badge status-applied";
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="page-center">

                <h2>
                    Loading applicants...
                </h2>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div>

            {/* NAVBAR */}

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


            {/* MAIN */}

            <main className="jobs-page">

                {/* HEADER */}

                <div className="jobs-header job-applicants-header">

                    <div>

                        <h1>
                            <Icon name="users" /> Job Applicants
                        </h1>

                        <p>
                            Review and manage
                            candidates who applied
                            for this job.
                        </p>

                    </div>


                    <div className="applicant-count">

                        Total Applicants:
                        {" "}
                        {applications.length}

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="error-message applicant-error">
                        {error}
                    </div>
                )}


                {/* EMPTY */}

                {!error &&
                    applications.length === 0 && (

                        <div className="empty-state">

                            <h2>
                                No applicants yet
                            </h2>

                            <p>
                                Candidates who apply
                                for this job will
                                appear here.
                            </p>

                        </div>
                    )}


                {/* APPLICANTS */}

                {applications.length > 0 && (

                    <div className="jobs-grid">

                        {applications.map(
                            application => (

                                <div
                                    className="job-card job-applicant-card"
                                    key={application.applicationId}
                                >

                                    {/* CANDIDATE */}

                                    <div
                                        className="job-card-header"
                                    >

                                        <div>

                                            <h2>
                                                <Icon name="user" />{" "}
                                                {
                                                    application.candidateName ||
                                                    "Candidate"
                                                }
                                            </h2>


                                            <span
                                                className={getStatusClassName(
                                                    application.status
                                                )}
                                            >
                                                {
                                                    getStatusLabel(
                                                        application.status
                                                    )
                                                }
                                            </span>

                                        </div>

                                    </div>


                                    {/* INFORMATION */}

                                    <div className="applicant-info">

                                        <p>
                                            <strong>
                                                Email:
                                            </strong>{" "}
                                            {
                                                application.candidateEmail ||
                                                "Not available"
                                            }
                                        </p>


                                        <p>
                                            <strong>
                                                Candidate ID:
                                            </strong>{" "}
                                            {
                                                application.candidateId ||
                                                "Not available"
                                            }
                                        </p>


                                        <p>
                                            <strong>
                                                Applied:
                                            </strong>{" "}
                                            {
                                                formatDate(
                                                    application.appliedAt
                                                )
                                            }
                                        </p>


                                        <p>
                                            <strong>
                                                Application ID:
                                            </strong>{" "}
                                            {
                                                application.applicationId
                                            }
                                        </p>

                                    </div>


                                    {/* COVER LETTER */}

                                    {application.coverLetter && (

                                        <div>

                                            <h3>
                                                Cover Letter
                                            </h3>


                                            <p className="job-description applicant-cover-letter">
                                                {
                                                    application.coverLetter
                                                }
                                            </p>

                                        </div>
                                    )}


                                    {/* CANDIDATE EVALUATION */}

                                    <div className="candidate-evaluation-panel">

                                        <h3>
                                            <Icon name="trophy" /> Candidate Evaluation
                                        </h3>


                                        <p>
                                            View the complete
                                            candidate profile,
                                            resume analysis,
                                            AI interview and
                                            application status.
                                        </p>


                                        <button
                                            className="primary-button"
                                            onClick={() =>
                                                handleViewEvaluation(
                                                    application.applicationId
                                                )
                                            }
                                        >
                                            <Icon name="user" /> View Candidate Evaluation
                                        </button>

                                    </div>


                                    {/* RESUME */}

                                    <div className="applicant-resume">

                                        <h3>
                                            <Icon name="file" /> Resume
                                        </h3>


                                        {application.resumeAvailable ? (

                                            <div className="applicant-actions">

                                                <button
                                                    className="secondary-button"
                                                    disabled={
                                                        resumeLoadingId ===
                                                        application.applicationId
                                                    }
                                                    onClick={() =>
                                                        handleViewResume(
                                                            application.applicationId
                                                        )
                                                    }
                                                >
                                                    {
                                                        resumeLoadingId ===
                                                            application.applicationId
                                                            ? "Opening..."
                                                            : "View Resume"
                                                    }
                                                </button>


                                                <button
                                                    className="primary-button"
                                                    disabled={
                                                        downloadLoadingId ===
                                                        application.applicationId
                                                    }
                                                    onClick={() =>
                                                        handleDownloadResume(
                                                            application.applicationId,
                                                            application.candidateName
                                                        )
                                                    }
                                                >
                                                    {
                                                        downloadLoadingId ===
                                                            application.applicationId
                                                            ? "Downloading..."
                                                            : "Download Resume"
                                                    }
                                                </button>

                                            </div>

                                        ) : (

                                            <p>
                                                <Icon name="error" /> Candidate has not
                                                uploaded a resume.
                                            </p>
                                        )}

                                    </div>


                                    {/* INTERVIEW */}

                                    <div className="applicant-interview">

                                        <h3>
                                            <Icon name="interview" /> AI Interview
                                        </h3>


                                        <p>
                                            View the candidate's
                                            AI interview score,
                                            answers and detailed
                                            evaluation.
                                        </p>


                                        <button
                                            className="secondary-button"
                                            onClick={() =>
                                                handleViewInterview(
                                                    application.applicationId
                                                )
                                            }
                                        >
                                            <Icon name="interview" /> View Interview
                                        </button>

                                    </div>


                                    {/* STATUS */}

                                    <div className="form-group application-status-group">

                                        <label>

                                            <strong>
                                                Application Status
                                            </strong>

                                        </label>


                                        <select
                                            value={
                                                application.status ||
                                                "APPLIED"
                                            }
                                            disabled={
                                                updatingId ===
                                                application.applicationId
                                            }
                                            onChange={
                                                event =>
                                                    handleStatusChange(
                                                        application.applicationId,
                                                        event.target.value
                                                    )
                                            }
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


                                        {updatingId ===
                                            application.applicationId && (

                                                <small>
                                                    Updating status...
                                                </small>
                                            )}

                                    </div>


                                    {/* EMAIL */}

                                    {application.candidateEmail && (

                                        <div className="applicant-email-footer">

                                            <button
                                                className="secondary-button"
                                                onClick={() =>
                                                    window.location.href =
                                                    `mailto:${application.candidateEmail}`
                                                }
                                            >
                                                <Icon name="email" /> Email Candidate
                                            </button>

                                        </div>
                                    )}

                                </div>
                            ))}

                    </div>
                )}

            </main>

        </div>
    );
}


export default JobApplicants;