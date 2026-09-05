import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";
import NotificationBell from "../pages/NotificationBell";
import { motion } from "framer-motion";

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isCandidate = user?.role === "CANDIDATE";
    const isRecruiter = user?.role === "RECRUITER";

    const candidateLinks = [
        { path: "/candidate/dashboard", label: "Dashboard", icon: "analytics" },
        { path: "/jobs", label: "Find Jobs", icon: "briefcase" },
        { path: "/my-applications", label: "My Applications", icon: "clipboardCheck" },
        { path: "/resume", label: "AI Resume", icon: "fileSearch" },
        { path: "/candidate/interview/history", label: "AI Interviews", icon: "interview" },
    ];

    const recruiterLinks = [
        { path: "/recruiter/dashboard", label: "Dashboard", icon: "analytics" },
        { path: "/recruiter/jobs", label: "Manage Jobs", icon: "briefcase" },
        { path: "/recruiter/company", label: "Company Profile", icon: "building" },
    ];

    const currentLinks = isCandidate ? candidateLinks : isRecruiter ? recruiterLinks : [];

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-xs transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* BRAND LOGO */}
                    <Link to="/" className="flex items-center group">
                        <img
                            src="/logo.png"
                            alt="Hirely"
                            className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                    </Link>

                    {/* NAVIGATION LINKS */}
                    {isAuthenticated && (
                        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/60">
                            {currentLinks.map((link) => {
                                const isActive = location.pathname.startsWith(link.path);
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`relative px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
                                            isActive
                                                ? isRecruiter
                                                    ? "text-indigo-700 bg-white shadow-xs font-bold"
                                                    : "text-blue-700 bg-white shadow-xs font-bold"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                                        }`}
                                    >
                                        <Icon name={link.icon} size={15} />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    )}

                    {/* RIGHT SECTION: NOTIFICATIONS & USER PROFILE */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <NotificationBell />

                                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex flex-col text-right">
                                        <span className="text-xs font-bold text-slate-800 line-clamp-1">
                                            {user?.name || user?.email}
                                        </span>
                                        <span className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                            isRecruiter
                                                ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                                                : "bg-blue-100 text-blue-700 border border-blue-200"
                                        }`}>
                                            {isRecruiter ? "Recruiter" : "Candidate"}
                                        </span>
                                    </div>

                                    <div className={`w-9 h-9 rounded-full ${
                                        isRecruiter 
                                            ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                                            : "bg-gradient-to-br from-blue-500 to-indigo-600"
                                    } text-white font-bold flex items-center justify-center shadow-sm`}>
                                        {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        title="Sign out"
                                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                                    >
                                        <Icon name="logout" size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
