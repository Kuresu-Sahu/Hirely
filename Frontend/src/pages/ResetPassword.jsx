import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Lock, 
    KeyRound, 
    ArrowLeft, 
    AlertCircle, 
    CheckCircle2, 
    RefreshCw,
    ShieldCheck
} from "lucide-react";
import api from "../services/api";

function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const email = (queryParams.get("email") || "").trim().toLowerCase();

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    useEffect(() => {
        if (!email) {
            setError("Email address is missing from request.");
        }
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email) {
            setError("Email address is missing.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter a valid 6-digit OTP code.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/api/auth/reset-password", {
                email,
                otp,
                newPassword
            });

            setSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1500);
        } catch (err) {
            console.error("Password reset failed:", err);
            const msg = err.response?.data?.message || err.response?.data || "Password reset failed. Please try again.";
            setError(typeof msg === "string" ? msg : "Password reset failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || resending) return;
        setError("");
        setSuccess("");
        setResending(true);

        try {
            await api.post("/api/auth/resend-otp", {
                email,
                purpose: "PASSWORD_RESET"
            });
            setSuccess("A new password reset OTP code has been sent.");
            setCountdown(60);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Unable to resend OTP.";
            setError(typeof msg === "string" ? msg : "Unable to resend OTP.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl shadow-slate-200/50">
                    <div className="text-center mb-8">
                        <img src="/logo.png" alt="Hirely" className="h-12 w-auto object-contain mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                        <p className="text-xs text-slate-500 mt-1">Enter the 6-digit OTP code sent to:</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5 break-all">{email}</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-xs">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                6-Digit OTP Code
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength="6"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                autoComplete="one-time-code"
                                required
                                className="w-full text-center tracking-widest text-lg font-mono px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength="6"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    placeholder="Re-enter new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength="6"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6 || newPassword.length < 6 || confirmPassword.length < 6}
                            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    <span>Resetting Password...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Reset Password</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={countdown > 0 || resending}
                            className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                            <span>
                                {resending ? "Resending..." : countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP Code"}
                            </span>
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                        <Link to="/login" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default ResetPassword;