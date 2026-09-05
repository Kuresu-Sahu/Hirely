import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Icon from "../components/Icon";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/api/auth/forgot-password", {
                email: email.trim().toLowerCase()
            });
            navigate(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        } catch (error) {
            console.error("Forgot password request failed:", error);
            if (typeof error.response?.data === "string") {
                setError(error.response.data);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Unable to process the request. Please try again.");
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
                className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-200/80"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <img src="/logo.png" alt="Hirely" className="h-12 w-auto object-contain mb-3" />
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password?</h1>
                    <p className="text-sm text-slate-500 mt-1">Enter your registered email address</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                        <Icon name="warning" size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                            Email Address
                        </label>
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                    >
                        {loading ? "Sending..." : "Send Password Reset OTP"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <Link to="/login" className="text-xs font-bold text-blue-600 hover:underline">
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

export default ForgotPassword;