import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import RecruiterRegister from "./pages/RecruiterRegister";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterJobs from "./pages/RecruiterJobs";
import Company from "./pages/Company";
import Interview from "./pages/Interview";
import RecruiterInterviewResult from "./pages/RecruiterInterviewResult";
import InterviewResult from "./pages/InterviewResult";
import InterviewHistory from "./pages/InterviewHistory";
import CreateCompany from "./pages/CreateCompany";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import ApplyJob from "./pages/ApplyJob";
import Resume from "./pages/Resume";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import ResumeAnalysisHistory from "./pages/ResumeAnalysisHistory";
import ResumeAnalysisHistoryDetail from "./pages/ResumeAnalysisHistoryDetail";
import MyApplications from "./pages/MyApplications";
import CreateJob from "./pages/CreateJob";
import EditJob from "./pages/EditJob";
import JobApplicants from "./pages/JobApplicants";
import RecruiterCandidateEvaluation from "./pages/RecruiterCandidateEvaluation";
import Notifications from "./pages/Notifications";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./context/ThemeContext";


function ProtectedRoute({
    children,
    allowedRole
}) {

    const {
        isAuthenticated,
        user
    } = useAuth();


    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    if (
        allowedRole &&
        user?.role !== allowedRole
    ) {

        if (
            user?.role === "RECRUITER"
        ) {

            return (
                <Navigate
                    to="/recruiter/dashboard"
                    replace
                />
            );
        }


        return (
            <Navigate
                to="/candidate/dashboard"
                replace
            />
        );
    }


    return children;
}


function Home() {

    const {
        isAuthenticated,
        user
    } = useAuth();


    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    if (
        user?.role === "RECRUITER"
    ) {

        return (
            <Navigate
                to="/recruiter/dashboard"
                replace
            />
        );
    }


    return (
        <Navigate
            to="/candidate/dashboard"
            replace
        />
    );
}


function App() {

    return (

        <ThemeProvider>

            <BrowserRouter>

                <ThemeToggle />

                <Routes>

                    {/* =================================================
                    AUTH
                ================================================= */}

                    <Route
                        path="/"
                        element={<Home />}
                    />


                    <Route
                        path="/login"
                        element={<Login />}
                    />


                    <Route
                        path="/register"
                        element={<Register />}
                    />


                    <Route
                        path="/register/recruiter"
                        element={<RecruiterRegister />}
                    />


                    <Route
                        path="/verify-otp"
                        element={<VerifyOtp />}
                    />


                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />


                    <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                    />


                    {/* =================================================
                    CANDIDATE
                ================================================= */}

                    <Route
                        path="/candidate/dashboard"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <CandidateDashboard />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/jobs"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <Jobs />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/jobs/:id"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <JobDetails />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/jobs/:id/apply"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <ApplyJob />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                    RESUME
                ================================================= */}

                    <Route
                        path="/resume"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <Resume />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/resume-analysis/:jobId"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <ResumeAnalysis />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/resume-analysis/history"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <ResumeAnalysisHistory />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/resume-analysis/history/:analysisId"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <ResumeAnalysisHistoryDetail />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/my-applications"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <MyApplications />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                    INTERVIEW
                ================================================= */}

                    <Route
                        path="/candidate/interview/:jobId"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <Interview />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/candidate/interview/result/:jobId"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <InterviewResult />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/candidate/interview/history"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <InterviewHistory />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/candidate/interview/history/:attemptId"
                        element={
                            <ProtectedRoute
                                allowedRole="CANDIDATE"
                            >
                                <InterviewResult />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                    RECRUITER
                ================================================= */}

                    <Route
                        path="/recruiter/dashboard"
                        element={
                            <ProtectedRoute
                                allowedRole="RECRUITER"
                            >
                                <RecruiterDashboard />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/recruiter/jobs"
                        element={
                            <ProtectedRoute
                                allowedRole="RECRUITER"
                            >
                                <RecruiterJobs />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/recruiter/jobs/create"
                        element={
                            <ProtectedRoute
                                allowedRole="RECRUITER"
                            >
                                <CreateJob />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/recruiter/jobs/edit/:id"
                        element={
                            <ProtectedRoute
                                allowedRole="RECRUITER"
                            >
                                <EditJob />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/recruiter/jobs/:jobId/applicants"
                        element={
                            <ProtectedRoute
                                allowedRole="RECRUITER"
                            >
                                <JobApplicants />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/recruiter/company"
                        element={
                            <ProtectedRoute
                                allowedRole="RECRUITER"
                            >
                                <Company />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/recruiter/company/create"
                        element={
                            <ProtectedRoute
                                allowedRole="RECRUITER"
                            >
                                <CreateCompany />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/recruiter/interview/:applicationId"
                        element={
                            <ProtectedRoute
                                allowedRole="RECRUITER"
                            >
                                <RecruiterInterviewResult />
                            </ProtectedRoute>
                        }
                    />


                    <Route
                        path="/recruiter/applications/:applicationId/evaluation"
                        element={
                            <ProtectedRoute
                                allowedRole="RECRUITER"
                            >
                                <RecruiterCandidateEvaluation />
                            </ProtectedRoute>
                        }
                    />


                    {/* =================================================
                    FALLBACK
                ================================================= */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>

            </BrowserRouter>

        </ThemeProvider>
    );
}


export default App;