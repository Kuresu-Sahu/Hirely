import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Award, 
    ArrowLeft, 
    Mail, 
    Briefcase, 
    Calendar, 
    BrainCircuit, 
    CheckCircle2, 
    AlertCircle, 
    Layers, 
    BookOpen, 
    Code, 
    Target,
    BarChart2,
    Sparkles
} from "lucide-react";
import api from "../services/api";

function RecruiterInterviewResult() {
    const navigate = useNavigate();
    const { jobId, applicationId } = useParams();

    const [interview, setInterview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [resolvedJobId, setResolvedJobId] = useState(null);

    useEffect(() => {
        const loadInterview = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await api.get(`/api/interview-attempts/application/${applicationId}`);
                const data = response.data;
                if (!data) throw new Error("Interview data not found.");
                if (!data.resultJson) throw new Error("Interview result details not available.");

                let parsedResult;
                try {
                    parsedResult = JSON.parse(data.resultJson);
                } catch {
                    throw new Error("Saved interview result is invalid.");
                }

                const recoveredJobId = data?.jobId ?? data?.job?.jobId ?? parsedResult?.jobId ?? parsedResult?.job?.jobId ?? null;
                setResolvedJobId(
                    recoveredJobId !== null && recoveredJobId !== undefined && String(recoveredJobId).trim() !== ""
                        ? recoveredJobId
                        : null
                );
                setInterview(data);
                setResult(parsedResult);
            } catch (err) {
                console.error("Recruiter interview error:", err);
                const msg = err.response?.data?.message || err.response?.data || err.message || "Unable to load interview result.";
                setError(typeof msg === "string" ? msg : "Unable to load interview result.");
            } finally {
                setLoading(false);
            }
        };

        if (applicationId) {
            loadInterview();
        }
    }, [applicationId]);

    const handleBack = () => {
        const targetJobId = resolvedJobId ?? interview?.jobId ?? result?.jobId ?? result?.job?.jobId ?? jobId;
        if (targetJobId && String(targetJobId).trim() !== "" && String(targetJobId) !== "undefined" && String(targetJobId) !== "null") {
            navigate(`/recruiter/jobs/${targetJobId}/applicants`);
            return;
        }
        navigate(-1);
    };

    const formatDate = (date) => {
        if (!date) return "N/A";
        try {
            return new Date(date).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short"
            });
        } catch {
            return "N/A";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500">Loading interview performance...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-xs">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-slate-900">Result Unavailable</h2>
                    <p className="text-xs text-slate-500 mt-1 mb-6">{error}</p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all"
                    >
                        Back to Applicants
                    </button>
                </div>
            </div>
        );
    }

    const results = result?.results || [];
    const averageScore = interview?.averageScore !== null && interview?.averageScore !== undefined
        ? Number(interview.averageScore)
        : results.length > 0
            ? results.reduce((sum, item) => sum + Number(item.score || 0), 0) / results.length
            : 0;

    const percentage = interview?.percentage !== null && interview?.percentage !== undefined
        ? Number(interview.percentage)
        : Math.round(averageScore * 10);

    const overallRating = interview?.overallRating || result?.overallRating || "Evaluated";
    const strongAnswers = results.filter((item) => Number(item.score || 0) >= 7).length;
    const weakAnswers = results.filter((item) => Number(item.score || 0) < 5).length;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Back to applicants"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5 text-indigo-600" /> AI Interview Transcript & Analysis
                            </h1>
                            <p className="text-xs text-slate-500">Recruiter detailed review of candidate interview</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
                {/* Hero Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs text-center"
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                        {interview?.candidateName ? interview.candidateName.charAt(0).toUpperCase() : "C"}
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900">{interview?.candidateName || "Candidate"}</h2>

                    <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {interview?.candidateEmail || "No email"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {interview?.jobTitle || "Job Position"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Completed: {formatDate(interview?.completedAt)}
                        </span>
                    </div>

                    {/* Overall Score Badge */}
                    <div className="mt-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 max-w-md mx-auto shadow-lg">
                        <div className="text-5xl font-black mb-1">
                            {averageScore.toFixed(1)}
                            <span className="text-lg font-normal text-slate-400">/10</span>
                        </div>
                        <p className="text-sm font-bold text-indigo-300">{overallRating}</p>
                        <p className="text-xs text-slate-400 mt-1">Overall Percentage: <span className="text-white font-semibold">{percentage}%</span></p>
                    </div>
                </motion.div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 text-center shadow-xs">
                        <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Questions</span>
                        <span className="text-2xl font-black text-slate-900 mt-1 block">
                            {results.length || interview?.totalQuestions || 0}
                        </span>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 text-center shadow-xs">
                        <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Score</span>
                        <span className="text-2xl font-black text-blue-600 mt-1 block">
                            {percentage}%
                        </span>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 text-center shadow-xs">
                        <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Strong Answers</span>
                        <span className="text-2xl font-black text-emerald-600 mt-1 block">
                            {strongAnswers}
                        </span>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-slate-200/80 text-center shadow-xs">
                        <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">Weak Answers</span>
                        <span className="text-2xl font-black text-rose-500 mt-1 block">
                            {weakAnswers}
                        </span>
                    </div>
                </div>

                {/* Detailed Questions & Answers */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-600" /> Question-by-Question Breakdown
                    </h3>

                    {results.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs italic">
                            No individual question details recorded for this interview.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {results.map((item, idx) => (
                                <div key={item.questionId || idx} className="p-5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                            Question {idx + 1}
                                        </span>
                                        <div className="text-sm font-extrabold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                                            {item.score || 0}
                                            <span className="text-xs text-slate-400 font-normal">/10</span>
                                        </div>
                                    </div>

                                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                                        {item.question || "Question text not available"}
                                    </p>

                                    {/* Meta Tags */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {item.category && (
                                            <span className="px-2.5 py-0.5 rounded-full bg-blue-100/60 text-blue-700 text-[11px] font-medium flex items-center gap-1">
                                                <BookOpen className="w-3 h-3" /> {item.category}
                                            </span>
                                        )}
                                        {item.technology && (
                                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100/60 text-indigo-700 text-[11px] font-medium flex items-center gap-1">
                                                <Code className="w-3 h-3" /> {item.technology}
                                            </span>
                                        )}
                                        {item.difficulty && (
                                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100/60 text-amber-700 text-[11px] font-medium flex items-center gap-1">
                                                <Target className="w-3 h-3" /> {item.difficulty}
                                            </span>
                                        )}
                                    </div>

                                    {/* Candidate Answer */}
                                    {item.candidateAnswer && (
                                        <div className="bg-white rounded-lg p-3.5 border border-slate-200/60 mt-2">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Candidate Answer</span>
                                            <p className="text-xs text-slate-700 leading-relaxed italic">"{item.candidateAnswer}"</p>
                                        </div>
                                    )}

                                    {/* Evaluation Notes */}
                                    {item.feedback && (
                                        <div className="bg-blue-50/50 rounded-lg p-3.5 border border-blue-100/60 mt-2">
                                            <span className="text-[10px] font-bold uppercase text-blue-600 block mb-1">AI Evaluation Notes</span>
                                            <p className="text-xs text-blue-950 leading-relaxed">{item.feedback}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default RecruiterInterviewResult;