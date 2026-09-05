import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchJob = async () => {
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
        fetchJob();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Loading job specifications...</p>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
                <Icon name="warning" size={36} className="mx-auto text-rose-500 mb-3" />
                <h2 className="text-lg font-bold text-slate-900">{error || "Job not found"}</h2>
                <button
                    onClick={() => navigate("/jobs")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                >
                    Back to Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <button
                onClick={() => navigate("/jobs")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
                <Icon name="left" size={14} />
                <span>Back to Job Search</span>
            </button>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8"
            >
                {/* HEADER CARD */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                            {job.company?.name ? job.company.name.charAt(0) : "J"}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{job.title}</h1>
                            <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mt-1">
                                <Icon name="building" size={16} className="text-slate-400" />
                                {job.company?.name || "Hirely Client"}
                            </p>
                        </div>
                    </div>

                    <span className="self-start sm:self-auto text-xs font-extrabold uppercase px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {job.jobType || "Full Time"}
                    </span>
                </div>

                {/* HIGHLIGHT GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[11px] font-extrabold uppercase text-slate-400">Location</p>
                        <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                            <Icon name="pin" size={14} className="text-blue-600" />
                            {job.location || "Remote / Hybrid"}
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[11px] font-extrabold uppercase text-slate-400">Experience</p>
                        <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-1">
                            <Icon name="briefcase" size={14} className="text-indigo-600" />
                            {job.experience || "Not specified"}
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[11px] font-extrabold uppercase text-slate-400">Offered Salary</p>
                        <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1">
                            <Icon name="chart" size={14} />
                            {job.salaryMin || job.salaryMax
                                ? `₹${job.salaryMin?.toLocaleString("en-IN") || 0} - ₹${job.salaryMax?.toLocaleString("en-IN") || "Negotiable"}`
                                : "Competitive"}
                        </p>
                    </div>
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-3">
                    <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider text-xs">Job Description</h2>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                        {job.description}
                    </p>
                </div>

                {/* COMPANY BIO */}
                {job.company && (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 space-y-2">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Icon name="building" size={16} className="text-blue-600" />
                            About {job.company.name}
                        </h3>
                        {job.company.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">{job.company.description}</p>
                        )}
                        {job.company.website && (
                            <a
                                href={job.company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-2"
                            >
                                <Icon name="globe" size={14} />
                                <span>{job.company.website}</span>
                            </a>
                        )}
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4">
                    <button
                        onClick={() => navigate(`/jobs/${job.id}/apply`)}
                        className="flex-1 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 text-center transition-all hover:scale-[1.01]"
                    >
                        Apply for this Job
                    </button>

                    <button
                        onClick={() => navigate(`/resume-analysis/${job.id}`)}
                        className="py-3.5 px-5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm rounded-xl transition-colors flex items-center gap-2"
                    >
                        <Icon name="bot" size={18} />
                        <span>Scan ATS Match</span>
                    </button>

                    <button
                        onClick={() => navigate(`/candidate/interview/${job.id}`)}
                        className="py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        <Icon name="interview" size={18} />
                        <span>Take AI Interview</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default JobDetails;