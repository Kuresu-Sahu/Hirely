import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function ApplyJob() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const submitLock = useRef(false);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await api.get(`/api/jobs/${id}`);
                setJob(response.data);
            } catch (err) {
                console.error("Error loading job:", err);
                setError(err.response?.data || "Unable to load job details.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchJob();
        else setLoading(false);
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitLock.current || submitting) return;

        setError("");
        setSuccess("");
        const trimmed = coverLetter.trim();

        if (trimmed.length < 20) {
            setError(`Your cover letter must contain at least 20 characters (currently ${trimmed.length}).`);
            return;
        }

        submitLock.current = true;
        setSubmitting(true);

        try {
            await api.post("/api/applications", {
                jobId: Number(id),
                coverLetter: trimmed
            });
            setSuccess("Application submitted successfully!");
            setCoverLetter("");
        } catch (err) {
            console.error("Application submission error:", err);
            if (err.response?.status === 409) {
                setError("You have already applied for this job.");
            } else {
                setError(err.response?.data?.message || err.response?.data || "Unable to submit application.");
            }
        } finally {
            submitLock.current = false;
            setSubmitting(false);
        }
    };

    const characterCount = coverLetter.trim().length;

    if (loading) {
        return (
            <div className="max-w-xl mx-auto py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Loading job details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <button
                onClick={() => navigate(`/jobs/${id}`)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
                <Icon name="left" size={14} />
                <span>Back to Job Specifications</span>
            </button>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6"
            >
                {/* HEADER */}
                <div className="border-b border-slate-100 pb-6">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        Job Application
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 mt-2">{job?.title}</h1>
                    <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-2">
                        <span><Icon name="building" size={14} /> {job?.company?.name || "Hirely Client"}</span>
                        <span>•</span>
                        <span><Icon name="pin" size={14} /> {job?.location || "Remote"}</span>
                    </p>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                        <Icon name="warning" size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-md">
                            ✓
                        </div>
                        <h2 className="text-xl font-black text-emerald-900">Application Submitted!</h2>
                        <p className="text-xs text-emerald-700 max-w-md mx-auto">
                            The hiring team and AI screening systems have received your application.
                        </p>

                        <div className="flex justify-center gap-3 pt-2">
                            <button
                                onClick={() => navigate("/my-applications")}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                            >
                                Track Applications
                            </button>
                            <button
                                onClick={() => navigate("/jobs")}
                                className="px-5 py-2.5 bg-white border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-100/50"
                            >
                                Explore More Jobs
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-extrabold uppercase text-slate-700">
                                    Cover Letter / Pitch
                                </label>
                                <span className={`text-xs font-bold ${characterCount < 20 ? "text-rose-600" : "text-emerald-600"}`}>
                                    {characterCount}/5000 chars
                                </span>
                            </div>

                            <textarea
                                rows={8}
                                placeholder="Explain why your background, technical skills, and experience make you an ideal candidate for this role..."
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                disabled={submitting}
                                required
                                minLength={20}
                                maxLength={5000}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                            />
                            {characterCount < 20 && (
                                <p className="text-[11px] font-semibold text-rose-600 mt-1">
                                    At least 20 characters required. ({20 - characterCount} more needed)
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate(`/jobs/${id}`)}
                                disabled={submitting}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={submitting || characterCount < 20}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
                            >
                                {submitting ? "Submitting..." : "Submit Application"}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}

export default ApplyJob;