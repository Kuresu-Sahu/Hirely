import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function InterviewResult() {
    const { jobId, attemptId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadResult = async () => {
            try {
                setLoading(true);
                setError("");

                if (attemptId) {
                    const response = await api.get(`/api/interview-attempts/${attemptId}`);
                    const attempt = response.data;
                    if (!attempt || !attempt.resultJson) throw new Error("Result data unavailable.");
                    const parsed = JSON.parse(attempt.resultJson);
                    setResult({
                        ...parsed,
                        attemptId: attempt.id,
                        jobId: attempt.jobId,
                        jobTitle: attempt.jobTitle,
                        averageScore: attempt.averageScore,
                        percentage: attempt.percentage,
                        overallRating: attempt.overallRating,
                        completedAt: attempt.completedAt
                    });
                    return;
                }

                const storedResult = sessionStorage.getItem("latestInterviewResult");
                if (!storedResult) throw new Error("No recent interview result found.");
                const parsed = JSON.parse(storedResult);
                setResult(parsed);
            } catch (err) {
                console.error("Result loading error:", err);
                setError(err.message || "Unable to load interview result.");
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, [jobId, attemptId]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Generating interview scorecard...</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
                <Icon name="warning" size={36} className="mx-auto text-rose-500 mb-3" />
                <h2 className="text-lg font-bold text-slate-900">{error || "Result not found"}</h2>
                <button
                    onClick={() => navigate("/candidate/interview/history")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                >
                    View Interview History
                </button>
            </div>
        );
    }

    const resultsList = result.results || [];
    const avgScore = Number(result.averageScore || 0);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate("/candidate/interview/history")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                    <Icon name="left" size={14} />
                    <span>View Interview History</span>
                </button>

                <button
                    onClick={() => navigate("/candidate/dashboard")}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                    Dashboard
                </button>
            </div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
                {/* HERO SCORE CARD */}
                <div className="text-center space-y-3 pb-6 border-b border-slate-100">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl font-black">
                        🏆
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">AI Evaluation Report</h1>
                    <p className="text-xs text-slate-500">{result.jobTitle || "Technical Role Assessment"}</p>

                    <div className="pt-4 flex justify-center items-center gap-6">
                        <div className="text-center">
                            <span className="text-4xl font-black text-emerald-600">{avgScore}</span>
                            <span className="text-xs text-slate-400 font-bold block">/10 Score</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200"></div>
                        <div className="text-center">
                            <span className="text-4xl font-black text-slate-900">{result.percentage || Math.round(avgScore * 10)}%</span>
                            <span className="text-xs text-slate-400 font-bold block">Percentage</span>
                        </div>
                    </div>

                    <span className="inline-block mt-2 text-xs font-extrabold uppercase px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {result.overallRating || "Good"}
                    </span>
                </div>

                {/* DETAILED QUESTION SCORES */}
                <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Individual Question Breakdown</h3>
                    <div className="space-y-4">
                        {resultsList.map((item, idx) => (
                            <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-bold text-blue-600">Question {idx + 1}</span>
                                    <span className="text-xs font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                        Score: {item.score}/10
                                    </span>
                                </div>

                                {item.feedback && (
                                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                                        <strong>AI Feedback:</strong> {item.feedback}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center gap-4 pt-4 border-t border-slate-100">
                    <button
                        onClick={() => navigate(`/candidate/interview/${result.jobId}`)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                        Retake Interview
                    </button>
                    <button
                        onClick={() => navigate("/jobs")}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                    >
                        Explore More Jobs
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default InterviewResult;