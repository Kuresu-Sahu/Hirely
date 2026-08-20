import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import NotificationBell from "./NotificationBell";
import Icon from "../components/Icon";


function RecruiterDashboard() {

    const {
        user,
        logout
    } = useAuth();

    const navigate = useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [company, setCompany] =
        useState(null);

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [statsLoading, setStatsLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [statsError, setStatsError] =
        useState("");


    // =====================================================
    // LOAD COMPANY
    // =====================================================

    useEffect(() => {

        const loadCompany = async () => {

            setLoading(true);

            setError("");

            setStatsError("");


            try {

                const response =
                    await api.get(
                        "/api/companies/my"
                    );


                setCompany(
                    response.data
                );


            } catch (companyError) {

                /*
                 * A 400 response with this message means
                 * that the recruiter simply hasn't created
                 * a company yet.
                 *
                 * This is NOT a real application error.
                 */

                const responseMessage =
                    companyError.response?.data;


                if (
                    companyError.response?.status === 400 &&
                    (
                        responseMessage ===
                        "You have not created a company yet"
                        ||
                        String(responseMessage)
                            .toLowerCase()
                            .includes(
                                "have not created a company"
                            )
                    )
                ) {

                    setCompany(null);

                    setError("");

                } else {

                    console.error(
                        "Company loading error:",
                        companyError
                    );


                    setCompany(null);


                    setError(
                        typeof responseMessage ===
                            "string"

                            ? responseMessage

                            : "Unable to load company information."
                    );
                }


            } finally {

                setLoading(false);
            }
        };


        loadCompany();

    }, []);


    // =====================================================
    // LOAD DASHBOARD STATISTICS
    // =====================================================
    //
    // IMPORTANT:
    //
    // Statistics are requested ONLY when a company exists.
    //
    // A newly registered recruiter without a company
    // should not receive a 400 request here.
    // =====================================================

    useEffect(() => {

        const loadStatistics = async () => {

            if (
                loading ||
                !company
            ) {

                setDashboard(null);

                setStatsLoading(false);

                setStatsError("");

                return;
            }


            setStatsLoading(true);

            setStatsError("");


            try {

                const response =
                    await api.get(
                        "/api/recruiter/dashboard/stats"
                    );


                setDashboard(
                    response.data
                );


            } catch (statsErrorResponse) {

                console.error(
                    "Dashboard statistics error:",
                    statsErrorResponse
                );


                setDashboard(null);


                const responseMessage =
                    statsErrorResponse.response?.data;


                setStatsError(
                    typeof responseMessage ===
                        "string"

                        ? responseMessage

                        : "Unable to load dashboard statistics."
                );


            } finally {

                setStatsLoading(false);
            }
        };


        loadStatistics();

    }, [
        company,
        loading
    ]);


    // =====================================================
    // FORMAT STATUS
    // =====================================================

    const formatStatus = (
        status
    ) => {

        if (!status) {

            return "Unknown";
        }


        return status
            .toString()
            .replaceAll(
                "_",
                " "
            )
            .toLowerCase()
            .replace(
                /\b\w/g,
                character =>
                    character.toUpperCase()
            );
    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (
        status
    ) => {

        switch (status) {

            case "SELECTED":

                return "status-selected";


            case "REJECTED":

                return "status-rejected";


            case "INTERVIEW":

                return "status-interview";


            case "SHORTLISTED":

                return "status-shortlisted";


            default:

                return "status-applied";
        }
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "N/A";
        }


        try {

            return new Date(date)
                .toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

        } catch {

            return date;
        }
    };


    // =====================================================
    // STAT CARD
    // =====================================================

    const StatCard = ({
        icon,
        title,
        value,
        description
    }) => {

        return (

            <div
                className="dashboard-card"
                style={{
                    flex:
                        "1 1 220px",

                    minWidth:
                        "220px",

                    margin:
                        "0"
                }}
            >

                <div
                    style={{
                        display:
                            "flex",

                        justifyContent:
                            "space-between",

                        alignItems:
                            "flex-start",

                        gap:
                            "15px"
                    }}
                >

                    <div>

                        <p
                            style={{
                                margin:
                                    "0 0 8px",

                                fontSize:
                                    "14px",

                                opacity:
                                    "0.7"
                            }}
                        >
                            {title}
                        </p>


                        <h2
                            style={{
                                margin:
                                    "0",

                                fontSize:
                                    "32px"
                            }}
                        >

                            {statsLoading
                                ? "..."
                                : value}

                        </h2>


                        {description && (

                            <p
                                style={{
                                    margin:
                                        "8px 0 0",

                                    fontSize:
                                        "13px",

                                    opacity:
                                        "0.65"
                                }}
                            >
                                {description}
                            </p>

                        )}

                    </div>


                    <div
                        style={{
                            fontSize:
                                "32px"
                        }}
                    >
                        {icon}
                    </div>

                </div>

            </div>
        );
    };


    // =====================================================
    // PAGE
    // =====================================================

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


                <div
                    style={{
                        display:
                            "flex",

                        alignItems:
                            "center",

                        gap:
                            "15px",

                        flexWrap:
                            "wrap"
                    }}
                >

                    <span>
                        Welcome,{" "}
                        {user?.name}
                    </span>


                    {/* =========================================
                        NOTIFICATION BELL
                    ========================================= */}

                    <NotificationBell />


                    {/* =========================================
                        LOGOUT
                    ========================================= */}

                    <button
                        onClick={logout}
                        className="logout-button"
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="dashboard">

                <h1>
                    Recruiter Dashboard
                </h1>


                <p>
                    Manage your company, jobs,
                    applicants and recruitment activity.
                </p>


                {/* =================================================
                    COMPANY
                ================================================= */}

                <div className="dashboard-card">

                    <h2>
                        <Icon name="building" /> My Company
                    </h2>


                    {/* =============================================
                        LOADING COMPANY
                    ============================================= */}

                    {loading && (

                        <p>
                            Loading company...
                        </p>

                    )}


                    {/* =============================================
                        COMPANY EXISTS
                    ============================================= */}

                    {!loading &&
                        company && (

                            <div>

                                <h3>
                                    {company.name}
                                </h3>


                                {company.location && (

                                    <p>
                                        <Icon name="pin" />{" "}
                                        {company.location}
                                    </p>

                                )}


                                {company.description && (

                                    <p>
                                        {
                                            company.description
                                        }
                                    </p>

                                )}


                                {company.website && (

                                    <p>
                                        <Icon name="globe" />{" "}
                                        {company.website}
                                    </p>

                                )}


                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate(
                                            "/recruiter/company"
                                        )
                                    }
                                >
                                    Manage Company
                                </button>

                            </div>
                        )
                    }


                    {/* =============================================
                        NO COMPANY
                    ============================================= */}

                    {!loading &&
                        !company && (

                            <div>

                                <p>
                                    You have not created
                                    a company yet.
                                </p>


                                <p
                                    style={{
                                        color:
                                            "#6b7280",

                                        marginBottom:
                                            "15px"
                                    }}
                                >
                                    Create your company
                                    profile before posting
                                    jobs and viewing
                                    recruitment statistics.
                                </p>


                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate(
                                            "/recruiter/company"
                                        )
                                    }
                                >
                                    <Icon name="building" /> Create Company
                                </button>

                            </div>
                        )
                    }

                </div>


                {/* =================================================
                    COMPANY ERROR
                ================================================= */}

                {error && (

                    <div
                        className="error-message"
                        style={{
                            marginBottom:
                                "20px"
                        }}
                    >
                        {error}
                    </div>
                )}


                {/* =================================================
                    NO COMPANY MESSAGE
                ================================================= */}

                {!loading &&
                    !company &&
                    !error && (

                        <div
                            className="dashboard-card"
                            style={{
                                marginTop:
                                    "20px",

                                border:
                                    "1px solid #f59e0b"
                            }}
                        >

                            <h2>
                                <Icon name="rocket" /> Complete Your Recruiter
                                Profile
                            </h2>


                            <p>
                                Your recruiter account is
                                ready. The next step is to
                                create your company profile.
                            </p>


                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate(
                                        "/recruiter/company"
                                    )
                                }
                            >
                                Create Company
                            </button>

                        </div>
                    )
                }


                {/* =================================================
                    EVERYTHING BELOW REQUIRES A COMPANY
                ================================================= */}

                {company && (

                    <>

                        {/* =============================================
                            STATS ERROR
                        ============================================= */}

                        {statsError && (

                            <div
                                className="error-message"
                                style={{
                                    marginBottom:
                                        "20px"
                                }}
                            >
                                {statsError}
                            </div>
                        )}


                        {/* =============================================
                            STATISTICS
                        ============================================= */}

                        <section>

                            <h2
                                style={{
                                    marginTop:
                                        "30px"
                                }}
                            >
                                <Icon name="analytics" /> Recruitment Overview
                            </h2>


                            <div
                                style={{
                                    display:
                                        "flex",

                                    flexWrap:
                                        "wrap",

                                    gap:
                                        "20px",

                                    marginTop:
                                        "15px"
                                }}
                            >

                                <StatCard
                                    icon={<Icon name="briefcase" size={20} />}
                                    title="Total Jobs"
                                    value={
                                        dashboard?.totalJobs ??
                                        0
                                    }
                                    description="All job postings"
                                />


                                <StatCard
                                    icon={<Icon name="success" size={20} />}
                                    title="Active Jobs"
                                    value={
                                        dashboard?.activeJobs ??
                                        0
                                    }
                                    description="Currently available jobs"
                                />


                                <StatCard
                                    icon={<Icon name="send" size={20} />}
                                    title="Applications"
                                    value={
                                        dashboard?.totalApplications ??
                                        0
                                    }
                                    description="Total applications received"
                                />


                                <StatCard
                                    icon={<Icon name="users" size={20} />}
                                    title="Candidates"
                                    value={
                                        dashboard?.totalCandidates ??
                                        0
                                    }
                                    description="Unique applicants"
                                />

                            </div>


                            <div
                                style={{
                                    display:
                                        "flex",

                                    flexWrap:
                                        "wrap",

                                    gap:
                                        "20px",

                                    marginTop:
                                        "20px"
                                }}
                            >

                                <StatCard
                                    icon={<Icon name="bot" size={20} />}
                                    title="AI Interviews"
                                    value={
                                        dashboard?.totalInterviews ??
                                        0
                                    }
                                    description="Completed AI interviews"
                                />


                                <StatCard
                                    icon={<Icon name="clock" size={20} />}
                                    title="Pending"
                                    value={
                                        dashboard?.pendingApplications ??
                                        0
                                    }
                                    description="Applications in progress"
                                />


                                <StatCard
                                    icon={<Icon name="trophy" size={20} />}
                                    title="Selected"
                                    value={
                                        dashboard?.selectedCandidates ??
                                        0
                                    }
                                    description="Selected applications"
                                />


                                <StatCard
                                    icon={<Icon name="error" size={20} />}
                                    title="Rejected"
                                    value={
                                        dashboard?.rejectedCandidates ??
                                        0
                                    }
                                    description="Rejected applications"
                                />

                            </div>

                        </section>


                        {/* =============================================
                            RECENT APPLICATIONS
                        ============================================= */}

                        <section
                            className="dashboard-card"
                            style={{
                                marginTop:
                                    "30px"
                            }}
                        >

                            <div
                                style={{
                                    display:
                                        "flex",

                                    justifyContent:
                                        "space-between",

                                    alignItems:
                                        "center",

                                    gap:
                                        "15px",

                                    flexWrap:
                                        "wrap"
                                }}
                            >

                                <div>

                                    <h2>
                                        <Icon name="send" /> Recent Applications
                                    </h2>

                                    <p>
                                        Latest candidates who
                                        applied to your jobs.
                                    </p>

                                </div>


                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate(
                                            "/recruiter/jobs"
                                        )
                                    }
                                >
                                    View My Jobs
                                </button>

                            </div>


                            {statsLoading && (

                                <p
                                    style={{
                                        marginTop:
                                            "20px"
                                    }}
                                >
                                    Loading applications...
                                </p>

                            )}


                            {!statsLoading &&
                                dashboard?.recentApplications
                                    ?.length === 0 && (

                                    <div
                                        className="empty-state"
                                        style={{
                                            marginTop:
                                                "20px"
                                        }}
                                    >

                                        <h3>
                                            No applications yet
                                        </h3>

                                        <p>
                                            Applications from
                                            candidates will
                                            appear here.
                                        </p>

                                    </div>
                                )
                            }


                            {!statsLoading &&
                                dashboard?.recentApplications
                                    ?.length > 0 && (

                                    <div
                                        style={{
                                            overflowX:
                                                "auto",

                                            marginTop:
                                                "20px"
                                        }}
                                    >

                                        <table
                                            style={{
                                                width:
                                                    "100%",

                                                borderCollapse:
                                                    "collapse",

                                                minWidth:
                                                    "700px"
                                            }}
                                        >

                                            <thead>

                                                <tr>

                                                    <th
                                                        style={{
                                                            textAlign:
                                                                "left",

                                                            padding:
                                                                "12px"
                                                        }}
                                                    >
                                                        Candidate
                                                    </th>


                                                    <th
                                                        style={{
                                                            textAlign:
                                                                "left",

                                                            padding:
                                                                "12px"
                                                        }}
                                                    >
                                                        Job
                                                    </th>


                                                    <th
                                                        style={{
                                                            textAlign:
                                                                "left",

                                                            padding:
                                                                "12px"
                                                        }}
                                                    >
                                                        Status
                                                    </th>


                                                    <th
                                                        style={{
                                                            textAlign:
                                                                "left",

                                                            padding:
                                                                "12px"
                                                        }}
                                                    >
                                                        Applied
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {dashboard
                                                    .recentApplications
                                                    .map(
                                                        (
                                                            application,
                                                            index
                                                        ) => (

                                                            <tr
                                                                key={
                                                                    application.applicationId ??
                                                                    application.id ??
                                                                    `${application.jobId}-${application.appliedAt ?? index}`
                                                                }
                                                            >

                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "12px"
                                                                    }}
                                                                >

                                                                    <strong>
                                                                        {
                                                                            application.candidateName ||
                                                                            "Candidate"
                                                                        }
                                                                    </strong>


                                                                    <br />


                                                                    <small>
                                                                        {
                                                                            application.candidateEmail ||
                                                                            ""
                                                                        }
                                                                    </small>

                                                                </td>


                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "12px"
                                                                    }}
                                                                >

                                                                    {
                                                                        application.jobTitle ||
                                                                        "Job"
                                                                    }

                                                                </td>


                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "12px"
                                                                    }}
                                                                >

                                                                    <span
                                                                        className={
                                                                            getStatusClass(
                                                                                application.status
                                                                            )
                                                                        }
                                                                        style={{
                                                                            display:
                                                                                "inline-block",

                                                                            padding:
                                                                                "5px 10px",

                                                                            borderRadius:
                                                                                "15px",

                                                                            fontSize:
                                                                                "12px"
                                                                        }}
                                                                    >

                                                                        {
                                                                            formatStatus(
                                                                                application.status
                                                                            )
                                                                        }

                                                                    </span>

                                                                </td>


                                                                <td
                                                                    style={{
                                                                        padding:
                                                                            "12px"
                                                                    }}
                                                                >

                                                                    {
                                                                        formatDate(
                                                                            application.appliedAt
                                                                        )
                                                                    }

                                                                </td>

                                                            </tr>
                                                        )
                                                    )}

                                            </tbody>

                                        </table>

                                    </div>
                                )
                            }

                        </section>


                        {/* =============================================
                            QUICK ACTIONS
                        ============================================= */}

                        <div
                            className="dashboard-card"
                        >

                            <h2>
                                <Icon name="lightning" /> Quick Actions
                            </h2>


                            <p>
                                Quickly access your recruiter
                                tools.
                            </p>


                            <div
                                style={{
                                    display:
                                        "flex",

                                    gap:
                                        "10px",

                                    flexWrap:
                                        "wrap",

                                    marginTop:
                                        "15px"
                                }}
                            >

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate(
                                            "/recruiter/company"
                                        )
                                    }
                                >
                                    <Icon name="building" /> Company
                                </button>


                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate(
                                            "/recruiter/jobs"
                                        )
                                    }
                                >
                                    <Icon name="briefcase" /> My Jobs
                                </button>


                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        navigate(
                                            "/notifications"
                                        )
                                    }
                                >
                                    <Icon name="bell" /> Notifications
                                </button>

                            </div>

                        </div>

                    </>
                )}

            </main>

        </div>
    );
}


export default RecruiterDashboard;