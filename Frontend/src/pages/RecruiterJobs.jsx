import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function RecruiterJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.get("/api/jobs/my");
            setJobs(response.data);
        } catch (err) {
            console.error("Error loading jobs:", err);
            setError(err.response?.data || "Unable to load posted jobs.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job posting?")) return;

        setDeletingId(jobId);
        setError("");
        try {
            await api.delete(`/api/jobs/${jobId}`);
            setJobs((prev) => prev.filter((j) => j.id !== jobId));
        } catch (err) {
            console.error("Delete job error:", err);
            setError(err.response?.data || "Unable to delete the job.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-16 text-center">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Retrieving posted job listings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Icon name="briefcase" size={26} className="text-purple-600" />
                        Manage Job Openings
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                        View active job listings, review applicant submissions, and create new roles.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/recruiter/jobs/create")}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                    >
                        <Icon name="plus" size={15} />
                        <span>Post New Job</span>
                    </button>
                    <button
                        onClick={() => navigate("/recruiter/dashboard")}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                        <Icon name="left" size={14} />
                        <span>Dashboard</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {error}
                </div>
            )}

            {jobs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                    <Icon name="briefcase" size={40} className="mx-auto text-slate-300" />
                    <h3 className="text-base font-bold text-slate-800">No Job Listings Posted</h3>
                    <p className="text-xs text-slate-500">Create your company's first job opening to start attracting top talent.</p>
                    <button
                        onClick={() => navigate("/recruiter/jobs/create")}
                        className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
                    >
                        Create First Job
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <motion.div
                            key={job.id}
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                                        {job.company?.name ? job.company.name.charAt(0) : "C"}
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                                        {job.jobType || "Full Time"}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-1">
                                    <Icon name="pin" size={13} className="text-slate-400" />
                                    {job.location || "Remote"}
                                </p>

                                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                                    {job.description}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                                    className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs text-center transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Icon name="users" size={14} />
                                    <span>Applicants</span>
                                </button>

                                <button
                                    onClick={() => navigate(`/recruiter/jobs/edit/${job.id}`)}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                                    title="Edit Job"
                                >
                                    <Icon name="edit" size={15} />
                                </button>

                                <button
                                    onClick={() => handleDelete(job.id)}
                                    disabled={deletingId === job.id}
                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                                    title="Delete Job"
                                >
                                    <Icon name="delete" size={15} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RecruiterJobs;