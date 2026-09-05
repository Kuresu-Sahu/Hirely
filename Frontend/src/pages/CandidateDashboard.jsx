import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Icon from "../components/Icon";

function CandidateDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        applicationsCount: 0,
        interviewsCount: 0,
        analysesCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [appsRes, interviewsRes, analysisRes] = await Promise.allSettled([
                    api.get("/api/applications/my"),
                    api.get("/api/interview-attempts/my"),
                    api.get("/api/resume-analysis/my")
                ]);

                setStats({
                    applicationsCount: appsRes.status === "fulfilled" && Array.isArray(appsRes.value.data) ? appsRes.value.data.length : 0,
                    interviewsCount: interviewsRes.status === "fulfilled" && Array.isArray(interviewsRes.value.data) ? interviewsRes.value.data.length : 0,
                    analysesCount: analysisRes.status === "fulfilled" && Array.isArray(analysisRes.value.data) ? analysisRes.value.data.length : 0
                });
            } catch (err) {
                console.error("Error loading candidate dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const cards = [
        {
            title: "Find Jobs",
            description: "Browse AI-matched job openings and apply with 1-click.",
            icon: "search",
            badge: "Explore",
            color: "from-blue-500 to-cyan-500",
            route: "/jobs"
        },
        {
            title: "My Resume",
            description: "Upload, preview, and update your master resume document.",
            icon: "file",
            badge: "CV Profile",
            color: "from-indigo-500 to-purple-500",
            route: "/resume"
        },
        {
            title: "AI Resume Matcher",
            description: "Get real-time ATS match scores and keyword optimization tips.",
            icon: "bot",
            badge: "AI Powered",
            color: "from-emerald-500 to-teal-500",
            route: "/resume-analysis/history"
        },
        {
            title: "My Applications",
            description: "Track status updates across all your job applications.",
            icon: "clipboardCheck",
            badge: `${stats.applicationsCount} Active`,
            color: "from-amber-500 to-orange-500",
            route: "/my-applications"
        },
        {
            title: "AI Mock Interviews",
            description: "Practice AI-driven technical interviews with instant feedback.",
            icon: "interview",
            badge: "Simulator",
            color: "from-rose-500 to-pink-500",
            route: "/candidate/interview/history"
        },
        {
            title: "Notifications Hub",
            description: "View recruiter responses, interview invites, and match alerts.",
            icon: "bell",
            badge: "Updates",
            color: "from-sky-500 to-blue-600",
            route: "/notifications"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* HERO SECTION */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-10 text-white shadow-xl"
            >
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{user?.name || "Candidate"}</span>!
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                        Ready to accelerate your career? Explore job matches, run AI ATS resume scans, and practice mock interviews in real-time.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate("/jobs")}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-105"
                        >
                            <Icon name="search" size={16} />
                            <span>Browse Open Positions</span>
                        </button>
                        <button
                            onClick={() => navigate("/resume")}
                            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold flex items-center gap-2 backdrop-blur-md transition-all"
                        >
                            <Icon name="upload" size={16} />
                            <span>Upload Resume</span>
                        </button>
                    </div>
                </div>

                {/* BACKGROUND DECORATION */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
            </motion.div>

            {/* QUICK STATS METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <motion.div
                    whileHover={{ y: -3 }}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Icon name="clipboardCheck" size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Applications</p>
                        <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.applicationsCount}</p>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -3 }}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Icon name="interview" size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Interviews</p>
                        <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.interviewsCount}</p>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -3 }}
                    className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Icon name="bot" size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ATS Scans</p>
                        <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.analysesCount}</p>
                    </div>
                </motion.div>
            </div>

            {/* DASHBOARD CARDS GRID */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Icon name="sparkles" size={18} className="text-blue-600" />
                    <span>Candidate Services</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -4 }}
                            onClick={() => navigate(card.route)}
                            className="group cursor-pointer p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-110 transition-transform`}>
                                        <Icon name={card.icon} size={22} />
                                    </div>
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {card.badge}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                    {card.description}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-blue-600">
                                <span>Open Hub</span>
                                <Icon name="right" size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CandidateDashboard;