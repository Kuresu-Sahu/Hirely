import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";


function Resume() {

    const navigate = useNavigate();


    // ==========================================
    // STATE
    // ==========================================

    const [resume, setResume] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ==========================================
    // LOAD MY RESUME
    // ==========================================

    useEffect(() => {

        const fetchResume = async () => {

            try {

                const response =
                    await api.get("/api/resumes/my");

                setResume(response.data);

            } catch (error) {

                // 400 means resume does not exist yet.
                // This is not a serious error.

                if (error.response?.status !== 400) {

                    console.error(
                        "Error loading resume:",
                        error
                    );

                    setError(
                        "Unable to load your resume."
                    );
                }

            } finally {

                setLoading(false);
            }
        };


        fetchResume();

    }, []);


    // ==========================================
    // FILE SELECT
    // ==========================================

    const handleFileChange = (event) => {

        setError("");

        setSuccess("");

        const file =
            event.target.files[0];


        if (!file) {

            setSelectedFile(null);

            return;
        }


        // Check PDF

        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {

            setError(
                "Only PDF files are allowed."
            );

            setSelectedFile(null);

            return;
        }


        // Check file size
        // Maximum 5 MB

        const maxSize =
            5 * 1024 * 1024;


        if (file.size > maxSize) {

            setError(
                "Resume file must be smaller than 5 MB."
            );

            setSelectedFile(null);

            return;
        }


        setSelectedFile(file);
    };


    // ==========================================
    // UPLOAD RESUME
    // ==========================================

    const handleUpload = async (event) => {

        event.preventDefault();


        setError("");

        setSuccess("");


        if (!selectedFile) {

            setError(
                "Please select a PDF resume."
            );

            return;
        }


        try {

            setUploading(true);


            const formData =
                new FormData();


            formData.append(
                "file",
                selectedFile
            );


            const response =
                await api.post(
                    "/api/resumes/upload",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );


            setResume(response.data);

            setSelectedFile(null);

            setSuccess(
                "Resume uploaded successfully!"
            );


        } catch (error) {

            console.error(
                "Error uploading resume:",
                error
            );


            setError(
                error.response?.data ||
                "Failed to upload resume."
            );

        } finally {

            setUploading(false);
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="page-center">

                <h2>
                    Loading resume...
                </h2>

            </div>
        );
    }


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

            <main className="resume-page">

                <div className="resume-header">

                    <h1>
                        My Resume
                    </h1>

                    <p>
                        Upload your resume to use
                        the AI Resume Analyzer.
                    </p>

                </div>


                {/* ==================================
                    MESSAGES
                ================================== */}

                {error && (

                    <div className="error-message">

                        {error}

                    </div>
                )}


                {success && (

                    <div className="success-message">

                        {success}

                    </div>
                )}


                {/* ==================================
                    UPLOAD CARD
                ================================== */}

                <div className="resume-card">

                    <h2>
                        Upload Resume
                    </h2>


                    <p className="resume-help">

                        Upload your latest resume
                        in PDF format.

                    </p>


                    <form
                        onSubmit={handleUpload}
                        className="resume-upload-form"
                    >

                        <div className="form-group">

                            <label>
                                Select Resume PDF
                            </label>


                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                            />

                        </div>


                        {selectedFile && (

                            <div className="selected-file">

                                <strong>
                                    Selected file:
                                </strong>

                                <span>
                                    {selectedFile.name}
                                </span>

                            </div>
                        )}


                        <button
                            type="submit"
                            className="primary-button resume-upload-button"
                            disabled={
                                uploading ||
                                !selectedFile
                            }
                        >

                            {uploading
                                ? "Uploading..."
                                : "Upload Resume"}

                        </button>

                    </form>

                </div>


                {/* ==================================
                    CURRENT RESUME
                ================================== */}

                {resume && (

                    <div className="resume-card">

                        <div className="resume-card-header">

                            <div>

                                <h2>
                                    Current Resume
                                </h2>

                                <p className="resume-help">
                                    Your resume is ready
                                    for analysis.
                                </p>

                            </div>


                            <span className="resume-status">

                                <Icon name="check" /> Uploaded

                            </span>

                        </div>


                        <div className="resume-details">

                            <div>

                                <strong>
                                    File Name
                                </strong>

                                <p>
                                    {resume.fileName}
                                </p>

                            </div>


                            <div>

                                <strong>
                                    File Type
                                </strong>

                                <p>
                                    {resume.fileType ||
                                        "application/pdf"}
                                </p>

                            </div>


                            <div>

                                <strong>
                                    Uploaded At
                                </strong>

                                <p>
                                    {resume.uploadedAt
                                        ? new Date(
                                            resume.uploadedAt
                                        ).toLocaleString()
                                        : "Not available"}
                                </p>

                            </div>

                        </div>


                        <div className="resume-analysis-info">

                            <h3>
                                <Icon name="bot" /> Ready for AI Analysis
                            </h3>

                            <p>
                                Go to a job and click
                                "Analyze My Resume" to
                                compare your resume with
                                that job.
                            </p>


                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate("/jobs")
                                }
                            >
                                Find Jobs
                            </button>

                        </div>

                    </div>
                )}


                {/* ==================================
                    NO RESUME
                ================================== */}

                {!resume && !error && (

                    <div className="resume-empty">

                        <h2>
                            No resume uploaded yet
                        </h2>

                        <p>
                            Upload your resume above
                            to start using the AI
                            Resume Analyzer.
                        </p>

                    </div>
                )}

            </main>

        </div>
    );
}


export default Resume;