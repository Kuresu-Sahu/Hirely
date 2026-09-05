import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function Interview() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [evaluationProgress, setEvaluationProgress] = useState(0);

    useEffect(() => {
        const loadInterview = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await api.get(`/api/interview/job/${jobId}`);
                const qList = Array.isArray(response.data)
                    ? response.data
                    : response.data?.questions || [];
                setQuestions(qList);
            } catch (err) {
                console.error("Interview loading error:", err);
                setError(err.response?.data?.message || err.response?.data || "Unable to load interview questions.");
            } finally {
                setLoading(false);
            }
        };

        if (jobId) loadInterview();
    }, [jobId]);

    const handleAnswerChange = (val) => {
        setAnswers((prev) => ({ ...prev, [currentQuestion]: val }));
        setError("");
    };

    const handleNext = () => {
        const currentAnswer = answers[currentQuestion] || "";
        if (!currentAnswer.trim() || currentAnswer.trim().length < 10) {
            setError("Please provide a detailed answer (at least 10 characters).");
            return;
        }
        setError("");
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        setError("");
        if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
    };

    const handleFinish = async () => {
        setError("");
        const unanswered = questions.filter((_, idx) => !answers[idx] || !answers[idx].trim());
        if (unanswered.length > 0) {
            setError(`Please answer all questions before submitting.`);
            return;
        }

        if (!window.confirm("Submit your answers for AI Evaluation?")) return;

        try {
            setSubmitting(true);
            setEvaluationProgress(0);
            const evaluationResults = [];

            for (let idx = 0; idx < questions.length; idx++) {
                const q = questions[idx];
                const ans = answers[idx];
                const res = await api.post("/api/interview/evaluate", {
                    questionId: q.id,
                    answer: ans.trim()
                });
                evaluationResults.push(res.data);
                setEvaluationProgress(Math.round(((idx + 1) / questions.length) * 100));
            }

            const totalScore = evaluationResults.reduce((sum, i) => sum + Number(i.score || 0), 0);
            const avgScore = evaluationResults.length > 0 ? totalScore / evaluationResults.length : 0;
            const percentage = Math.round(avgScore * 10);

            let rating = "Needs Improvement";
            if (avgScore >= 8.5) rating = "Excellent";
            else if (avgScore >= 7) rating = "Good";

            const interviewResult = {
                jobId: Number(jobId),
                completedAt: new Date().toISOString(),
                results: evaluationResults
            };

            const saveRes = await api.post("/api/interview-attempts", {
                jobId: Number(jobId),
                totalQuestions: evaluationResults.length,
                averageScore: Number(avgScore.toFixed(2)),
                percentage,
                overallRating: rating,
                resultJson: JSON.stringify(interviewResult)
            });

            sessionStorage.setItem("latestInterviewResult", JSON.stringify({
                ...interviewResult,
                attemptId: saveRes.data?.id,
                averageScore: Number(avgScore.toFixed(2)),
                percentage,
                overallRating: rating
            }));

            navigate(`/candidate/interview/result/${jobId}`);
        } catch (err) {
            console.error("Submission error:", err);
            setError(err.response?.data?.message || err.message || "Failed to complete evaluation.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Initializing AI Technical Interviewer...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center">
                <Icon name="interview" size={40} className="mx-auto text-slate-300 mb-3" />
                <h2 className="text-lg font-bold text-slate-800">No Questions Found</h2>
                <p className="text-xs text-slate-500 mt-1">There are no AI interview questions configured for this position.</p>
                <button onClick={() => navigate("/jobs")} className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
                    Back to Jobs
                </button>
            </div>
        );
    }

    if (!interviewStarted) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl text-center space-y-6">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                        <Icon name="interview" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ready for your AI Technical Interview?</h1>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                        You will be asked <strong>{questions.length} question(s)</strong> tailored to this job role. You can type detailed answers and receive instant scoring and feedback.
                    </p>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-2 max-w-md mx-auto">
                        <div className="font-extrabold text-slate-900 uppercase">Interview Tips</div>
                        <p>• Provide structured explanations with real-world context.</p>
                        <p>• Answer all questions before submitting for evaluation.</p>
                    </div>

                    <button
                        onClick={() => setInterviewStarted(true)}
                        className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
                    >
                        Begin AI Interview
                    </button>
                </motion.div>
            </div>
        );
    }

    if (submitting) {
        return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h2 className="text-lg font-black text-slate-900">Evaluating Answers...</h2>
                <p className="text-xs text-slate-500">AI is scoring your responses and generating feedback report.</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${evaluationProgress}%` }}></div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* STEP BAR */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-extrabold text-slate-700">
                    Question {currentQuestion + 1} of {questions.length}
                </span>

                <div className="flex gap-1.5">
                    {questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-3 h-3 rounded-full transition-colors ${
                                idx === currentQuestion
                                    ? "bg-blue-600 ring-2 ring-blue-200"
                                    : answers[idx]
                                    ? "bg-emerald-500"
                                    : "bg-slate-200"
                            }`}
                        ></div>
                    ))}
                </div>
            </div>

            {/* QUESTION CARD */}
            <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        Technical Question
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">
                        {currentQ?.questionText || currentQ?.question || "Describe your approach..."}
                    </h2>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase text-slate-700">
                        Your Technical Response
                    </label>
                    <textarea
                        rows={7}
                        placeholder="Type your explanation clearly..."
                        value={answers[currentQuestion] || ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-40 transition-colors"
                    >
                        Previous
                    </button>

                    {currentQuestion < questions.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                            Next Question
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
                        >
                            Complete & Submit Interview
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default Interview;