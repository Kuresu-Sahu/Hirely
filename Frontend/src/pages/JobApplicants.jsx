import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Users, 
    ArrowLeft, 
    User, 
    Mail, 
    Calendar, 
    FileText, 
    Download, 
    ExternalLink, 
    Sparkles, 
    Award, 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    Send,
    ChevronDown,
    BrainCircuit
} from "lucide-react";
import api from "../services/api";

function JobApplicants() {
    const navigate = useNavigate();
    const { jobId } = useParams();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [resumeLoadingId, setResumeLoadingId] = useState(null);
    const [downloadLoadingId, setDownloadLoadingId] = useState(null);

    useEffect(() => {
        const loadApplicants = async () => {
            try {
                setLoading(true);
                setError("");

                if (!jobId || String(jobId).trim() === "" || String(jobId) === "undefined" || String(jobId) === "null") {
                    setApplications([]);
                    setError("Job ID is missing. Unable to load applicants.");
                    return;
                }

                const response = await api.get(`/api/applications/job/${jobId}`);
                setApplications(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error loading applicants:", err);
                const msg = err.response?.data?.message || err.response?.data || "Unable to load job applicants.";
                setError(typeof msg === "string" ? msg : "Unable to load applicants.");
            } finally {
                setLoading(false);
            }
        };

        loadApplicants();
    }, [jobId]);

    const handleStatusChange = async (applicationId, newStatus) => {
        setUpdatingId(applicationId);
        setError("");

        try {
            const response = await api.put(`/api/applications/${applicationId}/status`, {
                status: newStatus
            });

            setApplications((prev) =>
                prev.map((app) => (app.applicationId === applicationId ? response.data : app))
            );
        } catch (err) {
            console.error("Status update error:", err);
            const msg = err.response?.data?.message || err.response?.data || "Unable to update application status.";
            setError(typeof msg === "string" ? msg : "Status update failed.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleViewEvaluation = (applicationId) => {
        navigate(`/recruiter/applications/${applicationId}/evaluation`);
    };

    const handleViewInterview = (applicationId) => {
        navigate(`/recruiter/interview/${applicationId}`);
    };

    const handleViewResume = async (applicationId) => {
        setResumeLoadingId(applicationId);
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
            setError("Unable to open resume file.");
        } finally {
            setResumeLoadingId(null);
        }
    };

    const handleDownloadResume = async (applicationId, candidateName) => {
        setDownloadLoadingId(applicationId);
        setError("");

        try {
            const response = await api.get(`/api/applications/${applicationId}/resume/download`, {
                responseType: "blob"
            });
            const contentType = response.headers["content-type"] || "application/pdf";
            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const safeName = candidateName ? candidateName.replace(/[^a-z0-9]/gi, "_") : "candidate";
            link.download = `${safeName}_resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => window.URL.revokeObjectURL(url), 60000);
        } catch (err) {
            console.error("Resume download error:", err);
            setError("Unable to download resume file.");
        } finally {
            setDownloadLoadingId(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        try {
            return new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
        } catch {
            return "N/A";
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "SHORTLISTED":
                return "bg-amber-50 text-amber-700 border-amber-200/80";
            case "INTERVIEW":
                return "bg-blue-50 text-blue-700 border-blue-200/80";
            case "SELECTED":
                return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
            case "REJECTED":
                return "bg-rose-50 text-rose-700 border-rose-200/80";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500">Loading applicants...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Sub-nav */}
            <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/recruiter/jobs")}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Back to my jobs"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" /> Job Applicants
                            </h1>
                            <p className="text-xs text-slate-500">
                                Total {applications.length} candidate{applications.length !== 1 ? "s" : ""} applied
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                        <span>{error}</span>
                    </div>
                )}

                {!error && applications.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h2 className="text-lg font-bold text-slate-800">No applicants yet</h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                            Candidates who submit applications for this job posting will appear here automatically.
                        </p>
                    </div>
                )}

                {applications.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((app, idx) => (
                            <motion.div
                                key={app.applicationId}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: idx * 0.05 }}
                                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    {/* Candidate Header */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                                                {app.candidateName ? app.candidateName.charAt(0).toUpperCase() : "C"}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                                                    {app.candidateName || "Anonymous Candidate"}
                                                </h3>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="truncate max-w-[180px]">{app.candidateEmail || "No email"}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(app.status)} shrink-0`}>
                                            {app.status || "APPLIED"}
                                        </span>
                                    </div>

                                    {/* Application Meta */}
                                    <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5 text-xs text-slate-600">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Applied Date</span>
                                            <span className="font-medium text-slate-700">{formatDate(app.appliedAt)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400">Application ID</span>
                                            <span className="font-mono text-slate-700">#{app.applicationId}</span>
                                        </div>
                                    </div>

                                    {/* Cover Letter excerpt */}
                                    {app.coverLetter && (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Cover Note</p>
                                            <p className="text-xs text-slate-600 bg-blue-50/40 p-3 rounded-xl border border-blue-100/50 italic line-clamp-3">
                                                "{app.coverLetter}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Quick evaluation CTA */}
                                    <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl p-3.5 border border-blue-100/80 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <BrainCircuit className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-bold text-slate-800">Candidate Hub</span>
                                            </div>
                                            <button
                                                onClick={() => handleViewEvaluation(app.applicationId)}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                <span>Full Evaluation</span>
                                                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-2 mb-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            {app.resumeAvailable ? (
                                                <>
                                                    <button
                                                        onClick={() => handleViewResume(app.applicationId)}
                                                        disabled={resumeLoadingId === app.applicationId}
                                                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                                    >
                                                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>{resumeLoadingId === app.applicationId ? "Opening..." : "View Resume"}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadResume(app.applicationId, app.candidateName)}
                                                        disabled={downloadLoadingId === app.applicationId}
                                                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                                                    >
                                                        <Download className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>{downloadLoadingId === app.applicationId ? "..." : "Download"}</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="col-span-2 text-center py-2 bg-slate-50 rounded-xl text-xs text-slate-400 italic">
                                                    No resume uploaded
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleViewInterview(app.applicationId)}
                                            className="w-full px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                            <span>View AI Interview Results</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Change Status Footer */}
                                <div className="pt-3 border-t border-slate-100">
                                    <div className="flex items-center justify-between gap-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                                            Status:
                                        </label>
                                        <div className="relative flex-1">
                                            <select
                                                value={app.status || "APPLIED"}
                                                disabled={updatingId === app.applicationId}
                                                onChange={(e) => handleStatusChange(app.applicationId, e.target.value)}
                                                className="w-full pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none cursor-pointer"
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
                                    {updatingId === app.applicationId && (
                                        <span className="text-[10px] text-blue-600 font-medium block text-right mt-1">Updating...</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default JobApplicants;