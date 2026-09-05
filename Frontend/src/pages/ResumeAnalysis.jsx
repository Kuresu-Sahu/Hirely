import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function ResumeAnalysis() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [resume, setResume] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError("");
            try {
                const [jobRes, resumeRes] = await Promise.all([
                    api.get(`/api/jobs/${jobId}`),
                    api.get("/api/resumes/my")
                ]);
                setJob(jobRes.data);
                setResume(resumeRes.data);
            } catch (err) {
                console.error("Error loading resume analysis page:", err);
                setError(err.response?.data || "Unable to load job or resume information.");
            } finally {
                setLoading(false);
            }
        };

        if (jobId) loadData();
        else {
            setError("No job selected.");
            setLoading(false);
        }
    }, [jobId]);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setError("");
        setAnalysis(null);
        try {
            const response = await api.post(`/api/ai/analyze/${jobId}`);
            setAnalysis(response.data);
        } catch (err) {
            console.error("Resume analysis error:", err);
            setError(err.response?.data?.message || err.response?.data || "Unable to analyze resume.");
        } finally {
            setAnalyzing(false);
        }
    };

    const getScoreBadge = (score) => {
        if (score >= 85) return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Excellent Match" };
        if (score >= 70) return { bg: "bg-blue-50 text-blue-700 border-blue-200", label: "Good Match" };
        if (score >= 50) return { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "Moderate Match" };
        return { bg: "bg-rose-50 text-rose-700 border-rose-200", label: "Needs Tailoring" };
    };

    const safeArray = (val) => (Array.isArray(val) ? val.filter((i) => i && String(i).trim()) : []);

    const summary = useMemo(() => {
        if (!analysis) return { matched: 0, missing: 0, total: 0, coverage: 0 };
        const matched = safeArray(analysis.matchedSkills);
        const missing = safeArray(analysis.missingSkills);
        const total = matched.length + missing.length;
        return {
            matched: matched.length,
            missing: missing.length,
            total,
            coverage: total > 0 ? Math.round((matched.length / total) * 100) : 0
        };
    }, [analysis]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Initializing AI ATS Scanner...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
                <Icon name="warning" size={36} className="mx-auto text-rose-500 mb-3" />
                <h2 className="text-lg font-bold text-slate-900">{error || "Job not found"}</h2>
                <button onClick={() => navigate("/jobs")} className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
                    Back to Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <button
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
                <Icon name="left" size={14} />
                <span>Back to {job.title}</span>
            </button>

            {/* HEADER */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-extrabold mb-2">
                        <Icon name="bot" size={14} />
                        <span>AI ATS Match Engine</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">{job.title}</h1>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                        {job.company?.name || "Company"} • {job.location || "Location Flexible"}
                    </p>
                </div>

                {resume ? (
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        <Icon name="sparkles" size={16} />
                        <span>{analyzing ? "Scanning Resume..." : "Run AI Resume Scan"}</span>
                    </button>
                ) : (
                    <button
                        onClick={() => navigate("/resume")}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                    >
                        Upload Resume First
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {error}
                </div>
            )}

            {/* ANALYSIS RESULTS */}
            {analysis && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    {/* SCORE OVERVIEW */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                            <span className="text-[11px] font-extrabold uppercase text-slate-400">Match Score</span>
                            <div className="text-4xl font-black text-slate-900 mt-1">{analysis.atsScore || analysis.matchPercentage || 0}%</div>
                            <span className={`mt-2 text-xs font-extrabold px-3 py-1 rounded-full border ${getScoreBadge(analysis.atsScore || analysis.matchPercentage || 0).bg}`}>
                                {getScoreBadge(analysis.atsScore || analysis.matchPercentage || 0).label}
                            </span>
                        </div>

                        <div className="sm:col-span-2 space-y-3">
                            <h3 className="text-xs font-extrabold uppercase text-slate-500">Skill Alignment Coverage</h3>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${summary.coverage}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-600 font-bold">
                                <span>{summary.matched} Matched Skills</span>
                                <span>{summary.missing} Missing Skills</span>
                            </div>
                        </div>
                    </div>

                    {/* SKILLS BREAKDOWN GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* MATCHED SKILLS */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                            <h3 className="text-sm font-black text-emerald-900 flex items-center gap-2">
                                <Icon name="check" size={18} className="text-emerald-600" />
                                Matched Qualifications & Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {safeArray(analysis.matchedSkills).length > 0 ? (
                                    safeArray(analysis.matchedSkills).map((s, idx) => (
                                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
                                            ✓ {s}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400">No explicit matching keywords detected.</p>
                                )}
                            </div>
                        </div>

                        {/* MISSING SKILLS */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                            <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
                                <Icon name="warning" size={18} className="text-amber-600" />
                                Missing / Recommended Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {safeArray(analysis.missingSkills).length > 0 ? (
                                    safeArray(analysis.missingSkills).map((s, idx) => (
                                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/60">
                                            + {s}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-emerald-600 font-bold">Great job! All required skills matched.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI RECOMMENDATIONS */}
                    {safeArray(analysis.improvementTips || analysis.suggestions).length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <Icon name="sparkles" size={18} className="text-blue-600" />
                                AI Resume Optimization Suggestions
                            </h3>
                            <ul className="space-y-2.5">
                                {safeArray(analysis.improvementTips || analysis.suggestions).map((tip, idx) => (
                                    <li key={idx} className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5 leading-relaxed">
                                        <span className="text-blue-600 font-bold">•</span>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

export default ResumeAnalysis;