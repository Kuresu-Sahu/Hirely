import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* LEFT: LOGO & COPYRIGHT */}
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                    <Link to="/" className="inline-block group">
                        <img
                            src="/logo-dark.png"
                            alt="Hirely"
                            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                    </Link>
                    <span className="hidden sm:inline text-slate-700">|</span>
                    <p className="text-xs text-slate-400 font-medium">
                        © {new Date().getFullYear()} Hirely Inc. All rights reserved.
                    </p>
                </div>

                {/* RIGHT: MINIMAL NAV LINKS */}
                <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
                    <Link to="/jobs" className="hover:text-white transition-colors">
                        Find Jobs
                    </Link>
                    <Link to="/resume" className="hover:text-white transition-colors">
                        AI Resume
                    </Link>
                    <Link to="/register/recruiter" className="hover:text-white transition-colors">
                        For Recruiters
                    </Link>
                    <span className="hover:text-slate-200 transition-colors cursor-pointer">
                        Privacy Policy
                    </span>
                    <span className="hover:text-slate-200 transition-colors cursor-pointer">
                        Terms of Service
                    </span>
                </nav>

            </div>
        </footer>
    );
}

export default Footer;
