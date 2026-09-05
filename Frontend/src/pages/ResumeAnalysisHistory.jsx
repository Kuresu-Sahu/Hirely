import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function ResumeAnalysisHistory() {
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadHistory = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await api.get("/api/resume-analysis/my");
                setAnalyses(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error loading resume analysis history:", err);
                setError(err.response?.data?.message || "Unable to load analysis history.");
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const getScoreBadge = (score) => {
        const s = Number(score || 0);
        if (s >= 85) return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Excellent" };
        if (s >= 70) return { bg: "bg-blue-50 text-blue-700 border-blue-200", label: "Good Match" };
        if (s >= 50) return { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "Moderate" };
        return { bg: "bg-rose-50 text-rose-700 border-rose-200", label: "Needs Work" };
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Retrieving ATS scan history...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Icon name="history" size={26} className="text-blue-600" />
                        ATS Analysis History
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Review your previous AI resume scans, matched keywords, and improvement reports.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/candidate/dashboard")}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                    <Icon name="left" size={14} />
                    <span>Dashboard</span>
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {error}
                </div>
            )}

            {analyses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                    <Icon name="fileSearch" size={40} className="mx-auto text-slate-300" />
                    <h3 className="text-base font-bold text-slate-800">No ATS Scans Recorded</h3>
                    <p className="text-xs text-slate-500">Run an AI scan from any job page to track keyword matches here.</p>
                    <button
                        onClick={() => navigate("/jobs")}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                    >
                        Browse Jobs
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analyses.map((item) => {
                        const score = Number(item.atsScore || 0);
                        const badge = getScoreBadge(score);

                        return (
                            <motion.div
                                key={item.analysisId}
                                whileHover={{ y: -4 }}
                                onClick={() => navigate(`/resume-analysis/history/${item.analysisId}`)}
                                className="cursor-pointer bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                            <Icon name="fileSearch" size={20} />
                                        </div>
                                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${badge.bg}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                                        {item.jobTitle || "Job ATS Analysis"}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {item.analyzedAt ? new Date(item.analyzedAt).toLocaleDateString() : "Date N/A"}
                                    </p>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500">ATS Score</span>
                                        <span className="text-xl font-black text-slate-900">{score}%</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                                    <span>Full Report</span>
                                    <Icon name="right" size={14} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ResumeAnalysisHistory;