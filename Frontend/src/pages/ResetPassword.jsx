import { useEffect, useState } from "react";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import api from "../services/api";


function ResetPassword() {

    const navigate = useNavigate();

    const location = useLocation();


    const queryParams =
        new URLSearchParams(
            location.search
        );


    const email =
        (
            queryParams.get("email") || ""
        )
            .trim()
            .toLowerCase();


    const [otp, setOtp] =
        useState("");


    const [newPassword, setNewPassword] =
        useState("");


    const [confirmPassword, setConfirmPassword] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const [resending, setResending] =
        useState(false);


    const [countdown, setCountdown] =
        useState(60);


    const [error, setError] =
        useState("");


    const [success, setSuccess] =
        useState("");


    // =========================================================
    // COUNTDOWN
    // =========================================================

    useEffect(() => {

        if (
            countdown <= 0
        ) {

            return;
        }


        const timer =
            setInterval(() => {

                setCountdown(
                    previous =>
                        previous - 1
                );

            }, 1000);


        return () => {

            clearInterval(
                timer
            );

        };

    }, [countdown]);


    // =========================================================
    // VALIDATE EMAIL
    // =========================================================

    useEffect(() => {

        if (!email) {

            setError(
                "Email address is missing."
            );
        }

    }, [email]);


    // =========================================================
    // SUBMIT RESET
    // =========================================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setError("");
            setSuccess("");


            if (!email) {

                setError(
                    "Email address is missing."
                );

                return;
            }


            if (
                !/^\d{6}$/.test(
                    otp
                )
            ) {

                setError(
                    "Please enter the 6-digit OTP."
                );

                return;
            }


            if (
                newPassword.length < 6
            ) {

                setError(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            if (
                newPassword !==
                confirmPassword
            ) {

                setError(
                    "Passwords do not match."
                );

                return;
            }


            setLoading(true);


            try {

                await api.post(
                    "/api/auth/reset-password",
                    {
                        email,

                        otp,

                        newPassword
                    }
                );


                setSuccess(
                    "Password reset successfully. Redirecting to login..."
                );


                setTimeout(() => {

                    navigate(
                        "/login",
                        {
                            replace: true
                        }
                    );

                }, 1500);


            } catch (error) {

                console.error(
                    "Password reset failed:",
                    error.response?.status ||
                    "Network error"
                );


                if (
                    typeof error.response?.data ===
                    "string"
                ) {

                    setError(
                        error.response.data
                    );

                } else if (
                    error.response?.data?.message
                ) {

                    setError(
                        error.response.data.message
                    );

                } else {

                    setError(
                        "Password reset failed. Please try again."
                    );
                }

            } finally {

                setLoading(false);
            }
        };


    // =========================================================
    // RESEND RESET OTP
    // =========================================================

    const handleResend =
        async () => {

            if (
                countdown > 0 ||
                resending
            ) {

                return;
            }


            setError("");
            setSuccess("");
            setResending(true);


            try {

                await api.post(
                    "/api/auth/resend-otp",
                    {
                        email,

                        purpose:
                            "PASSWORD_RESET"
                    }
                );


                setSuccess(
                    "A new password reset OTP has been sent."
                );


                setCountdown(
                    60
                );


            } catch (error) {

                if (
                    typeof error.response?.data ===
                    "string"
                ) {

                    setError(
                        error.response.data
                    );

                } else if (
                    error.response?.data?.message
                ) {

                    setError(
                        error.response.data.message
                    );

                } else {

                    setError(
                        "Unable to resend OTP."
                    );
                }

            } finally {

                setResending(false);
            }
        };


    return (

        <div className="auth-page">

            <div className="auth-card">

                {/* <h1>
                    Job Portal
                </h1> */}
                <div className="brand">
                    <img
                        src="/logo.png"
                        alt="Hirely"
                        className="brand-logo"
                    />
                </div>


                <h2>
                    Reset Password
                </h2>


                <p className="auth-subtitle">

                    Enter the OTP sent to:

                </p>


                <p
                    style={{
                        textAlign: "center",
                        fontWeight: "700",
                        marginBottom: "24px",
                        wordBreak: "break-word"
                    }}
                >
                    {email}
                </p>


                {error && (

                    <div className="error-message">

                        {error}

                    </div>

                )}


                {success && (

                    <div className="success-message">

                        {success}

                    </div>

                )}


                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="form-group">

                        <label>
                            6-Digit OTP
                        </label>


                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength="6"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(event) => {

                                setOtp(
                                    event.target.value
                                        .replace(
                                            /\D/g,
                                            ""
                                        )
                                        .slice(
                                            0,
                                            6
                                        )
                                );

                            }}
                            autoComplete="one-time-code"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            New Password
                        </label>


                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(
                                    event.target.value
                                )
                            }
                            minLength="6"
                            maxLength="100"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Confirm New Password
                        </label>


                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(
                                    event.target.value
                                )
                            }
                            minLength="6"
                            maxLength="100"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            loading ||
                            otp.length !== 6 ||
                            newPassword.length < 6 ||
                            confirmPassword.length < 6
                        }
                    >

                        {loading
                            ? "Resetting Password..."
                            : "Reset Password"
                        }

                    </button>

                </form>


                <button
                    type="button"
                    onClick={
                        handleResend
                    }
                    disabled={
                        countdown > 0 ||
                        resending
                    }
                    style={{
                        width: "100%",
                        marginTop: "12px",
                        padding: "10px",
                        background: "transparent",
                        border: "none",
                        cursor:
                            countdown > 0
                                ? "not-allowed"
                                : "pointer"
                    }}
                >

                    {resending
                        ? "Sending..."
                        : countdown > 0
                            ? `Resend OTP in ${countdown}s`
                            : "Resend OTP"
                    }

                </button>


                <p className="auth-footer">

                    <Link to="/login">
                        Back to Login
                    </Link>

                </p>

            </div>

        </div>
    );
}


export default ResetPassword;