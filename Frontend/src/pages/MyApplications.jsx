import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function MyApplications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get("/api/applications/my");
                setApplications(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error loading applications:", err);
                setError(err.response?.data?.message || "Unable to load your applications.");
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const getStatusColor = (status) => {
        const s = String(status || "").toUpperCase();
        if (s.includes("SHORTLIST") || s.includes("HIRED") || s.includes("ACCEPTED")) {
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        }
        if (s.includes("INTERVIEW") || s.includes("SCHEDULED")) {
            return "bg-purple-50 text-purple-700 border-purple-200";
        }
        if (s.includes("REJECT")) {
            return "bg-rose-50 text-rose-700 border-rose-200";
        }
        return "bg-blue-50 text-blue-700 border-blue-200";
    };

    const filteredApplications = applications.filter((app) => {
        if (filterStatus === "ALL") return true;
        return String(app.status || "").toUpperCase() === filterStatus;
    });

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Retrieving application history...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Icon name="clipboardCheck" size={26} className="text-blue-600" />
                        My Applications Tracker
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Monitor recruitment status and reviewer responses in real-time.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/jobs")}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                    <Icon name="plus" size={15} />
                    <span>Apply to New Job</span>
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {error}
                </div>
            )}

            {/* FILTER TABS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {["ALL", "APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "REJECTED"].map((st) => (
                    <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all whitespace-nowrap ${
                            filterStatus === st
                                ? "bg-slate-900 text-white shadow-sm"
                                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                        }`}
                    >
                        {st.replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* APPLICATIONS LIST */}
            {filteredApplications.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                    <Icon name="clipboard" size={40} className="mx-auto text-slate-300" />
                    <h3 className="text-base font-bold text-slate-800">No applications found</h3>
                    <p className="text-xs text-slate-500">You currently have no job applications matching this filter.</p>
                    <button
                        onClick={() => navigate("/jobs")}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                    >
                        Explore Jobs
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredApplications.map((app, index) => (
                        <motion.div
                            key={app.applicationId || app.id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center">
                                        {app.companyName ? app.companyName.charAt(0) : "C"}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">{app.jobTitle || "Job Application"}</h3>
                                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                            <Icon name="building" size={14} className="text-slate-400" />
                                            {app.companyName || "Company"}
                                        </p>
                                    </div>
                                </div>

                                <span className={`self-start sm:self-auto text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${getStatusColor(app.status)}`}>
                                    {app.status || "APPLIED"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                                {app.appliedAt && (
                                    <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <Icon name="calendar" size={14} className="text-slate-400" />
                                        <span>Applied: <strong>{new Date(app.appliedAt).toLocaleDateString()}</strong></span>
                                    </div>
                                )}
                                {app.jobLocation && (
                                    <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <Icon name="pin" size={14} className="text-slate-400" />
                                        <span>Location: <strong>{app.jobLocation}</strong></span>
                                    </div>
                                )}
                            </div>

                            {app.coverLetter && (
                                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1">
                                    <p className="text-[11px] font-extrabold uppercase text-slate-400">Cover Letter</p>
                                    <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">{app.coverLetter}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2">
                                {app.jobId && (
                                    <button
                                        onClick={() => navigate(`/jobs/${app.jobId}`)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                                    >
                                        View Job Specifications
                                    </button>
                                )}
                                {app.jobId && (
                                    <button
                                        onClick={() => navigate(`/candidate/interview/${app.jobId}`)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                                    >
                                        <Icon name="interview" size={14} />
                                        <span>Practice AI Interview</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyApplications;