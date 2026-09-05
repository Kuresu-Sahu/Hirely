import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    User, 
    Mail, 
    Briefcase, 
    Calendar, 
    FileText, 
    Download, 
    ArrowLeft, 
    Award, 
    CheckCircle2, 
    XCircle, 
    Sparkles, 
    BrainCircuit, 
    AlertCircle, 
    Send, 
    ChevronDown,
    Building2,
    BarChart3
} from "lucide-react";
import api from "../services/api";

function RecruiterCandidateEvaluation() {
    const navigate = useNavigate();
    const { applicationId } = useParams();

    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [resumeLoading, setResumeLoading] = useState(false);
    const [resumeDownloadLoading, setResumeDownloadLoading] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        const loadEvaluation = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await api.get(`/api/recruiter/evaluations/application/${applicationId}`);
                setEvaluation(response.data);
            } catch (err) {
                console.error("Evaluation loading error:", err);
                const msg = err?.response?.data?.message || err?.response?.data || "Unable to load candidate evaluation.";
                setError(typeof msg === "string" ? msg : "Failed to load candidate evaluation.");
            } finally {
                setLoading(false);
            }
        };

        if (applicationId) {
            loadEvaluation();
        }
    }, [applicationId]);

    const handleViewResume = async () => {
        setResumeLoading(true);
        setError("");
        try {
            const response = await api.get(`/api/applications/${applicationId}/resume`, {
                responseType: "blob"
            });
            const contentType = response.headers["content-type"] || "application/pdf";
            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => window.URL.revokeObjectURL(url), 60000);
        } catch (err) {
            console.error("Resume view error:", err);
            setError("Unable to open candidate resume.");
        } finally {
            setResumeLoading(false);
        }
    };

    const handleDownloadResume = async () => {
        setResumeDownloadLoading(true);
        setError("");
        try {
            const response = await api.get(`/api/applications/${applicationId}/resume/download`, {
                responseType: "blob"
            });
            const blob = new Blob([response.data], {
                type: response.headers["content-type"] || "application/pdf"
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const candidateName = evaluation?.application?.candidateName || "candidate";
            const safeName = candidateName.replace(/[^a-z0-9]/gi, "_");
            link.download = `${safeName}_resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(url), 60000);
        } catch (err) {
            console.error("Resume download error:", err);
            setError("Unable to download candidate resume.");
        } finally {
            setResumeDownloadLoading(false);
        }
    };

    const handleEmailCandidate = () => {
        const candidateEmail = evaluation?.application?.candidateEmail?.trim();
        if (!candidateEmail) {
            setError("Candidate email address is not available.");
            return;
        }

        const candidateName = evaluation?.application?.candidateName || "Candidate";
        const jobTitle = evaluation?.application?.jobTitle || "your job application";
        const subject = `Regarding your application for ${jobTitle}`;
        const body = `Dear ${candidateName},\n\nWe are contacting you regarding your application for ${jobTitle}.\n\nRegards,\nHirely Recruitment Team`;

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidateEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        const emailWindow = window.open(gmailUrl, "_blank", "noopener,noreferrer");
        if (!emailWindow) {
            window.location.href = `mailto:${encodeURIComponent(candidateEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    };

    const handleStatusChange = async (newStatus) => {
        setStatusUpdating(true);
        setError("");
        try {
            const response = await api.put(`/api/applications/${applicationId}/status`, {
                status: newStatus
            });
            setEvaluation((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    application: {
                        ...prev.application,
                        ...response.data
                    }
                };
            });
        } catch (err) {
            console.error("Status update error:", err);
            const msg = err?.response?.data?.message || err?.response?.data || "Unable to update status.";
            setError(typeof msg === "string" ? msg : "Status update failed.");
        } finally {
            setStatusUpdating(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not available";
        try {
            return new Date(date).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short"
            });
        } catch {
            return "Not available";
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "SHORTLISTED":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "INTERVIEW":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "SELECTED":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "REJECTED":
                return "bg-rose-50 text-rose-700 border-rose-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const parseInterviewResult = () => {
        const resultJson = evaluation?.interview?.resultJson;
        if (!resultJson) return null;
        if (typeof resultJson === "object") return resultJson;
        if (typeof resultJson !== "string") return null;
        try {
            return JSON.parse(resultJson);
        } catch {
            return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500">Preparing candidate profile & evaluation...</p>
                </div>
            </div>
        );
    }

    if (error && !evaluation) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-xs">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-900">Evaluation Unavailable</h2>
                    <p className="text-xs text-slate-500 mt-1 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const application = evaluation?.application;
    const analysis = evaluation?.resumeAnalysis;
    const interview = evaluation?.interview;
    const interviewResult = parseInterviewResult();

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(application?.jobId ? `/recruiter/jobs/${application.jobId}/applicants` : -1)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Back to applicants"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5 text-blue-600" /> Candidate Evaluation Hub
                            </h1>
                            <p className="text-xs text-slate-500">Comprehensive AI Match, Resume Analysis & Interview Feedback</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleEmailCandidate}
                            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>Contact</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Candidate Overview Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
                >
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg border border-white/20">
                                {application?.candidateName ? application.candidateName.charAt(0).toUpperCase() : "C"}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h2 className="text-2xl font-bold">{application?.candidateName || "Candidate"}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(application?.status)}`}>
                                        {application?.status || "APPLIED"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-300 mt-2 flex-wrap">
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                                        {application?.candidateEmail || "No email"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                                        {application?.jobTitle || "Job Position"}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        Applied: {formatDate(application?.appliedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status update controller */}
                        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 w-full md:w-auto">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                                Application Decision Status
                            </label>
                            <div className="relative">
                                <select
                                    value={application?.status || "APPLIED"}
                                    disabled={statusUpdating}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="w-full md:w-48 pl-3 pr-8 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                >
                                    <option value="APPLIED">Applied</option>
                                    <option value="SHORTLISTED">Shortlisted</option>
                                    <option value="INTERVIEW">Interview</option>
                                    <option value="SELECTED">Selected</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main 2-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Resume & Match Score */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* AI Resume Match Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-600" /> AI Resume Match & Skills
                                </h3>
                                {analysis?.matchPercentage !== undefined && (
                                    <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                                        {analysis.matchPercentage}% Match Score
                                    </div>
                                )}
                            </div>

                            {analysis ? (
                                <div className="space-y-6">
                                    {/* Score Meter */}
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-slate-600">Job Fit Score</span>
                                            <span className="text-blue-600">{analysis.matchPercentage || 0}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${analysis.matchPercentage || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Matched Skills */}
                                    {analysis.matchedSkills && analysis.matchedSkills.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched Required Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.matchedSkills.map((skill, i) => (
                                                    <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-lg text-xs font-medium">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Missing Skills */}
                                    {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <XCircle className="w-4 h-4 text-rose-500" /> Missing / Desired Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.missingSkills.map((skill, i) => (
                                                    <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200/60 rounded-lg text-xs font-medium">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Feedback Summary */}
                                    {analysis.summary && (
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                                            <h4 className="text-xs font-semibold text-slate-700 mb-1.5">AI Executive Summary</h4>
                                            <p className="text-xs text-slate-600 leading-relaxed">{analysis.summary}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs italic">
                                    No AI resume analysis generated for this candidate.
                                </div>
                            )}
                        </div>

                        {/* AI Interview Breakdown Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-indigo-600" /> AI Mock Interview Performance
                                </h3>
                                {interview && (
                                    <button
                                        onClick={() => navigate(`/recruiter/interview/${applicationId}`)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <span>Full Transcript & Details</span>
                                        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                                    </button>
                                )}
                            </div>

                            {interview ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-200/60">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Average Score</span>
                                            <span className="text-xl font-extrabold text-slate-900">
                                                {interview.averageScore ? Number(interview.averageScore).toFixed(1) : "0"}/10
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-200/60">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Overall Rating</span>
                                            <span className="text-sm font-bold text-indigo-600 mt-1 block">
                                                {interview.overallRating || "N/A"}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-200/60">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Questions</span>
                                            <span className="text-xl font-extrabold text-slate-900">
                                                {interview.totalQuestions || 0}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-200/60">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Percentage</span>
                                            <span className="text-xl font-extrabold text-emerald-600">
                                                {interview.percentage || 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs italic">
                                    Candidate has not taken an AI screening interview yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Resume & Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-700" /> Resume Document
                            </h3>

                            {application?.resumeAvailable ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleViewResume}
                                        disabled={resumeLoading}
                                        className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>{resumeLoading ? "Opening Resume..." : "View Resume PDF"}</span>
                                    </button>

                                    <button
                                        onClick={handleDownloadResume}
                                        disabled={resumeDownloadLoading}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                                    >
                                        <Download className="w-4 h-4 text-slate-500" />
                                        <span>{resumeDownloadLoading ? "Downloading..." : "Download File"}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-800 text-xs">
                                    No resume file uploaded for this application.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default RecruiterCandidateEvaluation;