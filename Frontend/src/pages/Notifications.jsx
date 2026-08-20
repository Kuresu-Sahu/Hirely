import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";


function Notifications() {

    const navigate = useNavigate();


    const {
        user
    } = useAuth();


    // ==========================================
    // STATE
    // ==========================================

    const [notifications, setNotifications] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    // ==========================================
    // DASHBOARD ROUTE
    // ==========================================

    const dashboardRoute =
        user?.role === "RECRUITER"
            ? "/recruiter/dashboard"
            : "/candidate/dashboard";


    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    const loadNotifications = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get(
                    "/api/notifications"
                );


            setNotifications(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );


        } catch (error) {

            console.error(
                "Notification loading error:",
                error
            );


            setError(
                error.response?.data ||
                "Unable to load notifications."
            );


        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // LOAD PAGE
    // ==========================================

    useEffect(() => {

        loadNotifications();

    }, []);


    // ==========================================
    // MARK AS READ
    // ==========================================

    const markAsRead = async (
        notificationId
    ) => {

        try {

            const response =
                await api.put(
                    `/api/notifications/${notificationId}/read`
                );


            setNotifications(
                previous =>
                    previous.map(
                        notification =>
                            notification.id ===
                                notificationId

                                ? response.data

                                : notification
                    )
            );


            return response.data;


        } catch (error) {

            console.error(
                "Mark notification read error:",
                error
            );


            return null;
        }
    };


    // ==========================================
    // OPEN NOTIFICATION
    // ==========================================

    const handleNotificationClick = async (
        notification
    ) => {

        let updatedNotification =
            notification;


        // --------------------------------------
        // MARK READ
        // --------------------------------------

        if (!notification.read) {

            const response =
                await markAsRead(
                    notification.id
                );


            if (response) {

                updatedNotification =
                    response;
            }
        }


        // --------------------------------------
        // NAVIGATE
        // --------------------------------------

        if (
            updatedNotification.actionUrl
        ) {

            navigate(
                updatedNotification.actionUrl
            );

            return;
        }


        // --------------------------------------
        // FALLBACK
        // --------------------------------------

        if (
            updatedNotification.type ===
            "NEW_APPLICATION"
        ) {

            if (
                user?.role ===
                "RECRUITER"
            ) {

                navigate(
                    "/recruiter/jobs"
                );

                return;
            }
        }


        if (
            updatedNotification.type ===
            "APPLICATION" ||
            updatedNotification.type ===
            "SHORTLISTED" ||
            updatedNotification.type ===
            "INTERVIEW" ||
            updatedNotification.type ===
            "SELECTED" ||
            updatedNotification.type ===
            "REJECTED"
        ) {

            if (
                user?.role ===
                "CANDIDATE"
            ) {

                navigate(
                    "/my-applications"
                );

                return;
            }
        }

    };


    // ==========================================
    // MARK ALL AS READ
    // ==========================================

    const markAllAsRead = async () => {

        try {

            await api.put(
                "/api/notifications/read-all"
            );


            setNotifications(
                previous =>
                    previous.map(
                        notification => ({
                            ...notification,
                            read: true
                        })
                    )
            );


        } catch (error) {

            console.error(
                "Mark all notifications error:",
                error
            );


            setError(
                "Unable to mark notifications as read."
            );
        }
    };


    // ==========================================
    // DATE FORMAT
    // ==========================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "Just now";
        }


        try {

            return new Date(date)
                .toLocaleString(
                    "en-IN",
                    {
                        dateStyle: "medium",
                        timeStyle: "short"
                    }
                );

        } catch {

            return date;
        }
    };


    // ==========================================
    // ICON
    // ==========================================

    const getIcon = (
        type
    ) => {

        switch (type) {

            case "APPLICATION":
                return <Icon name="mail" size={18} />;

            case "NEW_APPLICATION":
                return <Icon name="user" size={18} />;

            case "SHORTLISTED":
                return <Icon name="trophy" size={18} />;

            case "INTERVIEW":
                return <Icon name="interview" size={18} />;

            case "SELECTED":
                return <Icon name="celebration" size={18} />;

            case "REJECTED":
                return <Icon name="error" size={18} />;

            default:
                return <Icon name="bell" size={18} />;
        }
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="page-center">

                <h2>
                    Loading notifications...
                </h2>

            </div>
        );
    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div>

            {/* ======================================
                NAVBAR
            ====================================== */}

            <nav className="navbar">

                {/* <h2>
                    JobPortal
                </h2> */}
                <div className="brand">
                    <img
                        src="/logo.png"
                        alt="Hirely"
                        className="brand-logo"
                    />
                </div>


                <button
                    className="secondary-button"
                    onClick={() =>
                        navigate(
                            dashboardRoute
                        )
                    }
                >
                    <Icon name="left" /> Dashboard
                </button>

            </nav>


            {/* ======================================
                MAIN
            ====================================== */}

            <main className="jobs-page">

                <div
                    className="jobs-header"
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                        gap: "20px",
                        flexWrap:
                            "wrap"
                    }}
                >

                    <div>

                        <h1>
                            <Icon name="bell" /> Notifications
                        </h1>


                        <p>
                            {user?.role ===
                                "RECRUITER"

                                ? "Stay updated about applications and recruitment activity."

                                : "Stay updated about your applications and interviews."
                            }
                        </p>

                    </div>


                    {notifications.some(
                        notification =>
                            !notification.read
                    ) && (

                            <button
                                className="secondary-button"
                                onClick={
                                    markAllAsRead
                                }
                            >
                                <Icon name="check" /> Mark All as Read
                            </button>
                        )}

                </div>


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="error-message">

                        {error}

                    </div>
                )}


                {/* ==================================
                    EMPTY
                ================================== */}

                {!error &&
                    notifications.length === 0 && (

                        <div className="empty-state">

                            <h2>
                                No notifications
                            </h2>

                            <p>
                                You are all caught up!
                            </p>

                        </div>
                    )}


                {/* ==================================
                    NOTIFICATIONS
                ================================== */}

                {notifications.length > 0 && (

                    <div
                        style={{
                            maxWidth:
                                "900px",
                            margin:
                                "0 auto"
                        }}
                    >

                        {notifications.map(
                            notification => (

                                <div
                                    key={
                                        notification.id
                                    }
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification
                                        )
                                    }
                                    style={{
                                        padding:
                                            "20px",
                                        marginBottom:
                                            "15px",
                                        border:
                                            "1px solid #ddd",
                                        borderRadius:
                                            "12px",
                                        background:
                                            notification.read
                                                ? "#ffffff"
                                                : "#f0f7ff",
                                        cursor:
                                            "pointer",
                                        boxShadow:
                                            "0 2px 8px rgba(0,0,0,0.05)",
                                        transition:
                                            "transform 0.15s ease"
                                    }}
                                >

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "flex-start",
                                            gap:
                                                "15px"
                                        }}
                                    >

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap:
                                                    "15px"
                                            }}
                                        >

                                            <div
                                                style={{
                                                    fontSize:
                                                        "30px"
                                                }}
                                            >
                                                {getIcon(
                                                    notification.type
                                                )}
                                            </div>


                                            <div>

                                                <h3
                                                    style={{
                                                        margin:
                                                            "0 0 6px"
                                                    }}
                                                >
                                                    {
                                                        notification.title
                                                    }
                                                </h3>


                                                <p
                                                    style={{
                                                        margin:
                                                            "0 0 8px"
                                                    }}
                                                >
                                                    {
                                                        notification.message
                                                    }
                                                </p>


                                                <small
                                                    style={{
                                                        opacity:
                                                            "0.6"
                                                    }}
                                                >
                                                    {formatDate(
                                                        notification.createdAt
                                                    )}
                                                </small>


                                                {notification.actionUrl && (

                                                    <div
                                                        style={{
                                                            marginTop:
                                                                "10px",
                                                            fontSize:
                                                                "13px",
                                                            fontWeight:
                                                                "600",
                                                            color:
                                                                "#2563eb"
                                                        }}
                                                    >
                                                        Click to open <Icon name="right" />
                                                    </div>

                                                )}

                                            </div>

                                        </div>


                                        {!notification.read && (

                                            <span
                                                style={{
                                                    background:
                                                        "#2563eb",
                                                    color:
                                                        "white",
                                                    padding:
                                                        "5px 9px",
                                                    borderRadius:
                                                        "20px",
                                                    fontSize:
                                                        "12px",
                                                    fontWeight:
                                                        "600"
                                                }}
                                            >
                                                NEW
                                            </span>

                                        )}

                                    </div>

                                </div>
                            ))}

                    </div>
                )}

            </main>

        </div>
    );
}


export default Notifications;