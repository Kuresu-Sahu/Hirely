import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function ResumeAnalysisHistoryDetail() {
    const { analysisId } = useParams();
    const navigate = useNavigate();

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadAnalysis = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await api.get(`/api/resume-analysis/${analysisId}`);
                setAnalysis(response.data);
            } catch (err) {
                console.error("Error loading resume analysis:", err);
                setError(err.response?.data?.message || err.response?.data || "Unable to load analysis.");
            } finally {
                setLoading(false);
            }
        };

        if (analysisId) loadAnalysis();
        else setLoading(false);
    }, [analysisId]);

    const safeArray = (val) => (Array.isArray(val) ? val.filter((i) => i && String(i).trim()) : []);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Retrieving saved analysis report...</p>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
                <Icon name="warning" size={36} className="mx-auto text-rose-500 mb-3" />
                <h2 className="text-lg font-bold text-slate-900">{error || "Analysis not found"}</h2>
                <button
                    onClick={() => navigate("/resume-analysis/history")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                >
                    Back to History
                </button>
            </div>
        );
    }

    const score = Number(analysis.atsScore || 0);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <button
                onClick={() => navigate("/resume-analysis/history")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
                <Icon name="left" size={14} />
                <span>Back to Analysis History</span>
            </button>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            Saved ATS Scan Report
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 mt-2">{analysis.jobTitle || "Job Analysis Report"}</h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Analyzed on {analysis.analyzedAt ? new Date(analysis.analyzedAt).toLocaleString() : "Date N/A"}
                        </p>
                    </div>

                    <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[100px]">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">ATS Score</span>
                        <span className="text-3xl font-black text-blue-600">{score}%</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase text-emerald-700">Matched Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {safeArray(analysis.matchedSkills).map((s, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                                    ✓ {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-xs font-extrabold uppercase text-amber-700">Missing Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {safeArray(analysis.missingSkills).map((s, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                                    + {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {safeArray(analysis.improvementTips || analysis.suggestions).length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                        <h3 className="text-xs font-extrabold uppercase text-slate-700">AI Recommendations</h3>
                        <div className="space-y-2">
                            {safeArray(analysis.improvementTips || analysis.suggestions).map((tip, idx) => (
                                <p key={idx} className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    • {tip}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default ResumeAnalysisHistoryDetail;