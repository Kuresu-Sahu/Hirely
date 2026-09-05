import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Icon from "../components/Icon";

function NotificationBell() {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadUnreadCount = async () => {
        try {
            const response = await api.get("/api/notifications/unread-count");
            const count = Number(response.data);
            setUnreadCount(Number.isNaN(count) ? 0 : count);
        } catch (error) {
            console.error("Unread notification count error:", error);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <button
            type="button"
            className="relative p-2.5 rounded-full text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-all focus:outline-none"
            onClick={() => navigate("/notifications")}
            title="Notifications"
        >
            <Icon name="bell" size={20} />
            {!loading && unreadCount > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </button>
    );
}

export default NotificationBell;