import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Icon from "../components/Icon";

function RecruiterDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [company, setCompany] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCompany = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await api.get("/api/companies/my");
                setCompany(response.data);
            } catch (err) {
                if (err.response?.status === 400) {
                    setCompany(null);
                } else {
                    console.error("Company loading error:", err);
                    setError("Unable to load company information.");
                }
            } finally {
                setLoading(false);
            }
        };
        loadCompany();
    }, []);

    useEffect(() => {
        const loadStatistics = async () => {
            if (loading || !company) return;
            setStatsLoading(true);
            try {
                const response = await api.get("/api/recruiter/dashboard/stats");
                setDashboard(response.data);
            } catch (err) {
                console.error("Dashboard statistics error:", err);
            } finally {
                setStatsLoading(false);
            }
        };
        loadStatistics();
    }, [company, loading]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-16 text-center">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Initializing Recruiter Portal...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* HERO SECTION */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-8 sm:p-10 text-white shadow-xl"
            >
                <div className="relative z-10 max-w-2xl space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">{user?.name || "Recruiter"}</span>!
                    </h1>
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {company ? `Managing talent pipelines for ${company.name}` : "Set up your company profile to post jobs and screen talent with AI."}
                    </p>

                    <div className="pt-3 flex flex-wrap gap-3">
                        {company ? (
                            <>
                                <button
                                    onClick={() => navigate("/recruiter/jobs/create")}
                                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105"
                                >
                                    <Icon name="plus" size={16} />
                                    <span>Post New Job</span>
                                </button>
                                <button
                                    onClick={() => navigate("/recruiter/jobs")}
                                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl flex items-center gap-2 backdrop-blur-md transition-all"
                                >
                                    <Icon name="briefcase" size={16} />
                                    <span>Manage Jobs</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate("/recruiter/company")}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
                            >
                                <Icon name="building" size={16} />
                                <span>Create Company Profile</span>
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* NO COMPANY NOTICE */}
            {!company && (
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Icon name="warning" size={24} className="text-amber-600 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-bold">Company Profile Required</h3>
                            <p className="text-xs text-amber-700 mt-0.5">Complete your company information to unlock applicant tracking and job posting.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/recruiter/company")}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-xs"
                    >
                        Create Company Now
                    </button>
                </div>
            )}

            {/* STATS OVERVIEW */}
            {company && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-400">Total Posted Jobs</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{statsLoading ? "..." : dashboard?.totalJobs ?? 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            <Icon name="briefcase" size={24} />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-400">Active Job Postings</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{statsLoading ? "..." : dashboard?.activeJobs ?? 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <Icon name="check" size={24} />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-400">Total Applicants</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{statsLoading ? "..." : dashboard?.totalApplications ?? 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Icon name="users" size={24} />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase text-slate-400">Shortlisted Talent</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">{statsLoading ? "..." : dashboard?.shortlistedApplications ?? 0}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <Icon name="trophy" size={24} />
                        </div>
                    </div>
                </div>
            )}

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => navigate("/recruiter/jobs/create")}
                    className="cursor-pointer p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon name="plus" size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">Post a Job Opening</h3>
                    <p className="text-xs text-slate-500 mt-1">Create a new job listing with custom AI evaluation prompts.</p>
                </div>

                <div
                    onClick={() => navigate("/recruiter/jobs")}
                    className="cursor-pointer p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon name="briefcase" size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Manage Job Pipeline</h3>
                    <p className="text-xs text-slate-500 mt-1">Review active applicants, evaluate scores, and update statuses.</p>
                </div>

                <div
                    onClick={() => navigate("/recruiter/company")}
                    className="cursor-pointer p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon name="building" size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Company Brand Profile</h3>
                    <p className="text-xs text-slate-500 mt-1">Update website links, location, and corporate description.</p>
                </div>
            </div>
        </div>
    );
}

export default RecruiterDashboard;