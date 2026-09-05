import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Bell, 
    ArrowLeft, 
    CheckCheck, 
    Mail, 
    User, 
    Award, 
    Sparkles, 
    PartyPopper, 
    XCircle, 
    AlertCircle, 
    ChevronRight,
    BrainCircuit
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Notifications() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const dashboardRoute = user?.role === "RECRUITER" ? "/recruiter/dashboard" : "/candidate/dashboard";

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/api/notifications");
            setNotifications(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Notification loading error:", err);
            setError(err.response?.data || "Unable to load notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            const response = await api.put(`/api/notifications/${notificationId}/read`);
            setNotifications((prev) =>
                prev.map((item) => (item.id === notificationId ? response.data : item))
            );
            return response.data;
        } catch (err) {
            console.error("Mark notification read error:", err);
            return null;
        }
    };

    const handleNotificationClick = async (notification) => {
        let updatedNotification = notification;
        if (!notification.read) {
            const res = await markAsRead(notification.id);
            if (res) updatedNotification = res;
        }

        if (updatedNotification.actionUrl) {
            navigate(updatedNotification.actionUrl);
            return;
        }

        if (updatedNotification.type === "NEW_APPLICATION" && user?.role === "RECRUITER") {
            navigate("/recruiter/jobs");
            return;
        }

        if (
            ["APPLICATION", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"].includes(updatedNotification.type) &&
            user?.role === "CANDIDATE"
        ) {
            navigate("/my-applications");
            return;
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put("/api/notifications/read-all");
            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
        } catch (err) {
            console.error("Mark all notifications error:", err);
            setError("Unable to mark notifications as read.");
        }
    };

    const formatDate = (date) => {
        if (!date) return "Just now";
        try {
            return new Date(date).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return date;
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case "APPLICATION":
                return <Mail className="w-5 h-5 text-blue-600" />;
            case "NEW_APPLICATION":
                return <User className="w-5 h-5 text-indigo-600" />;
            case "SHORTLISTED":
                return <Award className="w-5 h-5 text-amber-600" />;
            case "INTERVIEW":
                return <BrainCircuit className="w-5 h-5 text-blue-600" />;
            case "SELECTED":
                return <PartyPopper className="w-5 h-5 text-emerald-600" />;
            case "REJECTED":
                return <XCircle className="w-5 h-5 text-rose-500" />;
            default:
                return <Bell className="w-5 h-5 text-slate-500" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-medium text-slate-500">Loading notifications...</p>
                </div>
            </div>
        );
    }

    const hasUnread = notifications.some((n) => !n.read);

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-xs">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(dashboardRoute)}
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Back to dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-blue-600" /> Notifications
                            </h1>
                            <p className="text-xs text-slate-500">
                                {user?.role === "RECRUITER"
                                    ? "Recruitment events, applications, and updates"
                                    : "Application status updates and interview notifications"}
                            </p>
                        </div>
                    </div>

                    {hasUnread && (
                        <button
                            onClick={markAllAsRead}
                            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                        >
                            <CheckCheck className="w-4 h-4" />
                            <span>Mark All Read</span>
                        </button>
                    )}
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                        <span>{error}</span>
                    </div>
                )}

                {!error && notifications.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h2 className="text-lg font-bold text-slate-800">No notifications</h2>
                        <p className="text-sm text-slate-500 mt-1">You're all caught up! Check back later for updates.</p>
                    </div>
                )}

                {notifications.length > 0 && (
                    <div className="space-y-3">
                        {notifications.map((n, idx) => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: idx * 0.03 }}
                                onClick={() => handleNotificationClick(n)}
                                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                                    n.read
                                        ? "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                                        : "bg-gradient-to-r from-blue-50/90 via-white to-blue-50/40 border-blue-200/90 shadow-xs"
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                        {getIcon(n.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                                            {!n.read && (
                                                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                                        <span className="text-[11px] font-medium text-slate-400 block mt-2">
                                            {formatDate(n.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 self-center" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Notifications;