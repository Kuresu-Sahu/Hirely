import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";
import Icon from "../components/Icon";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", {
                email: email.trim().toLowerCase(),
                password
            });

            // Direct login success - store auth and navigate to dashboard!
            login(response.data);

            if (response.data.role === "RECRUITER") {
                navigate("/recruiter/dashboard");
            } else {
                navigate("/candidate/dashboard");
            }
        } catch (error) {
            console.error("Login failed:", error);
            if (typeof error.response?.data === "string") {
                setError(error.response.data);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-200/80"
            >
                {/* BRAND LOGO HEADER */}
                <div className="flex flex-col items-center text-center mb-8">
                    <img src="/logo.png" alt="Hirely" className="h-12 w-auto object-contain mb-3" />
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
                    <p className="text-sm text-slate-500 mt-1">Sign in to your Hirely AI account</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                    >
                        <Icon name="warning" size={16} />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* GOOGLE SIGN IN */}
                <div className="mb-6">
                    <GoogleLoginButton text="Sign in with Google" />
                </div>

                <div className="relative flex items-center justify-center mb-6">
                    <div className="border-t border-slate-200 w-full"></div>
                    <span className="bg-white px-3 text-xs uppercase font-bold text-slate-400 absolute">or</span>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-1.5">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                                Password
                            </label>
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                {/* FOOTER */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
                    <p className="text-xs text-slate-600">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-bold text-blue-600 hover:underline">
                            Register as Candidate
                        </Link>
                    </p>
                    <p className="text-xs text-slate-500">
                        Hiring talent?{" "}
                        <Link to="/register/recruiter" className="font-bold text-indigo-600 hover:underline">
                            Register as Recruiter
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;