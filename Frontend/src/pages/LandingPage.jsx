import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Sparkles, 
    Briefcase, 
    BrainCircuit, 
    FileText, 
    Users, 
    ArrowRight, 
    ShieldCheck, 
    CheckCircle2, 
    Star, 
    TrendingUp, 
    Building2, 
    Zap,
    Search,
    UserCheck,
    Lock
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    // If authenticated, redirect to appropriate dashboard
    if (isAuthenticated) {
        if (user?.role === "RECRUITER") {
            return <Navigate to="/recruiter/dashboard" replace />;
        }
        return <Navigate to="/candidate/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
            {/* Background Glow Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none"></div>

            {/* HERO SECTION */}
            <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-3xl mx-auto space-y-6"
                >
                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                        Smarter Hiring & Effortless Job Matching <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                            Powered by AI
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
                        Hirely connects ambitious candidates with top employers. Evaluate resumes instantly, conduct interactive AI mock interviews, and hire 10x faster.
                    </p>

                    {/* Primary Call-to-Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => navigate("/register")}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2.5 group"
                        >
                            <span>Find Your Dream Job</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => navigate("/register/recruiter")}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-base hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2.5"
                        >
                            <Building2 className="w-5 h-5 text-indigo-600" />
                            <span>Post a Job (Recruiter)</span>
                        </button>
                    </div>

                    {/* Quick Login Link */}
                    <div className="pt-2">
                        <p className="text-xs text-slate-500 font-medium">
                            Already have an account?{" "}
                            <Link to="/login" className="text-blue-600 font-bold hover:underline">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Hero Feature Badges */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                >
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 text-center shadow-2xs">
                        <div className="text-2xl font-black text-blue-600">98%</div>
                        <div className="text-xs font-semibold text-slate-600 mt-1">AI Match Accuracy</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 text-center shadow-2xs">
                        <div className="text-2xl font-black text-indigo-600">10x</div>
                        <div className="text-xs font-semibold text-slate-600 mt-1">Faster Screening</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 text-center shadow-2xs">
                        <div className="text-2xl font-black text-emerald-600">100%</div>
                        <div className="text-xs font-semibold text-slate-600 mt-1">Direct Google Auth</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 text-center shadow-2xs">
                        <div className="text-2xl font-black text-amber-600">24/7</div>
                        <div className="text-xs font-semibold text-slate-600 mt-1">AI Mock Interviews</div>
                    </div>
                </motion.div>
            </section>

            {/* FEATURES GRID SECTION */}
            <section className="py-16 bg-white border-y border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Platform Capabilities</h2>
                        <p className="text-3xl font-extrabold text-slate-900">Built for Next-Level Talent Acquisition</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-slate-50/80 rounded-2xl p-8 border border-slate-200/80 hover:border-blue-300 transition-all hover:shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-6">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart AI Resume Analysis</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Instantly compare candidate resumes against detailed job descriptions to calculate match percentages, identified skills, and gap insights.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-50/80 rounded-2xl p-8 border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mb-6">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Automated AI Interviews</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Practice real-time technical questions evaluated by AI models with quantitative scores, candidate feedback, and transcript breakdowns.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-slate-50/80 rounded-2xl p-8 border border-slate-200/80 hover:border-emerald-300 transition-all hover:shadow-md">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-6">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Recruiter Evaluation Hub</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Single dashboard for recruiters to post jobs, manage applicant pipelines, review AI candidate reports, and track status transitions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROLE DUAL SECTIONS */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Candidate Box */}
                    <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4">
                                <UserCheck className="w-4 h-4" /> For Job Seekers
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Accelerate Your Career Path</h3>
                            <p className="text-xs text-slate-300 leading-relaxed mb-6">
                                Apply to curated roles, upload your resume for automated evaluation, and take AI mock interviews to practice your skills before real rounds.
                            </p>
                            <ul className="space-y-2.5 text-xs text-slate-200 mb-8">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> Free resume match diagnosis
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> Interactive AI practice interviews
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400" /> One-click Google Sign-Up
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => navigate("/register")}
                            className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <span>Create Candidate Account</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Recruiter Box */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-slate-900 shadow-xl flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-4">
                                <Building2 className="w-4 h-4" /> For Employers & Recruiters
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Hire Top Candidates Faster</h3>
                            <p className="text-xs text-slate-500 leading-relaxed mb-6">
                                Post open positions, manage job applicants seamlessly, and review structured candidate evaluations with automated resume and interview scoring.
                            </p>
                            <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Centralized applicant tracking dashboard
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Instant candidate match analysis
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Direct contact & email integrations
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => navigate("/register/recruiter")}
                            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <span>Create Recruiter Account</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;
