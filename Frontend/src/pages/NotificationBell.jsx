import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Icon from "../components/Icon";


function NotificationBell() {

    const navigate = useNavigate();


    const [unreadCount, setUnreadCount] =
        useState(0);


    const [loading, setLoading] =
        useState(true);


    // ==========================================
    // LOAD UNREAD COUNT
    // ==========================================

    const loadUnreadCount = async () => {

        try {

            const response =
                await api.get(
                    "/api/notifications/unread-count"
                );


            const count =
                Number(response.data);


            setUnreadCount(
                Number.isNaN(count)
                    ? 0
                    : count
            );


        } catch (error) {

            console.error(
                "Unread notification count error:",
                error
            );

            setUnreadCount(0);

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // LOAD ON PAGE OPEN
    // ==========================================

    useEffect(() => {

        loadUnreadCount();

    }, []);


    // ==========================================
    // REFRESH COUNT
    // ==========================================

    useEffect(() => {

        const interval =
            setInterval(
                loadUnreadCount,
                30000
            );


        return () => {

            clearInterval(
                interval
            );

        };

    }, []);


    // ==========================================
    // OPEN NOTIFICATIONS
    // ==========================================

    const openNotifications = () => {

        navigate(
            "/notifications"
        );
    };


    return (

        <button
            type="button"
            className="notification-bell-button"
            onClick={
                openNotifications
            }
            title="Notifications"
        >

            <span className="notification-bell-icon">
                <Icon name="bell" />
            </span>


            {!loading &&
                unreadCount > 0 && (

                <span className="notification-badge">

                    {unreadCount > 99
                        ? "99+"
                        : unreadCount}

                </span>
            )}

        </button>
    );
}


export default NotificationBell;