import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function VerifyOtp() {

    const navigate = useNavigate();

    const location = useLocation();

    const { login } = useAuth();


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


    const purpose =
        (
            queryParams.get("purpose") ||
            "REGISTER"
        )
            .trim()
            .toUpperCase();


    const [otp, setOtp] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const [resending, setResending] =
        useState(false);


    const [error, setError] =
        useState("");


    const [success, setSuccess] =
        useState("");


    const [countdown, setCountdown] =
        useState(60);


    // =========================================================
    // COUNTDOWN
    // =========================================================

    useEffect(() => {

        if (countdown <= 0) {

            return;
        }


        const timer =
            setInterval(() => {

                setCountdown(
                    (previous) =>
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
    // VALIDATE EMAIL / PURPOSE
    // =========================================================

    useEffect(() => {

        if (!email) {

            setError(
                "Verification email is missing."
            );

            return;
        }


        if (
            purpose !== "REGISTER" &&
            purpose !== "LOGIN"
        ) {

            setError(
                "Invalid verification request."
            );
        }

    }, [email, purpose]);


    // =========================================================
    // VERIFY OTP
    // =========================================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setError("");
            setSuccess("");


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


            setLoading(true);


            try {

                if (
                    purpose ===
                    "REGISTER"
                ) {

                    await api.post(
                        "/api/auth/verify-registration",
                        {
                            email,
                            otp,
                            purpose
                        }
                    );


                    setSuccess(
                        "Email verified successfully. Redirecting to login..."
                    );


                    setTimeout(() => {

                        navigate(
                            "/login"
                        );

                    }, 1200);


                } else {

                    const response =
                        await api.post(
                            "/api/auth/verify-login",
                            {
                                email,
                                otp,
                                purpose
                            }
                        );


                    login(
                        response.data
                    );


                    if (
                        response.data.role ===
                        "RECRUITER"
                    ) {

                        navigate(
                            "/recruiter/dashboard",
                            {
                                replace: true
                            }
                        );

                    } else {

                        navigate(
                            "/candidate/dashboard",
                            {
                                replace: true
                            }
                        );
                    }
                }

            } catch (error) {

                console.error(
                    "OTP verification failed:",
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
                        "OTP verification failed. Please try again."
                    );
                }

            } finally {

                setLoading(false);
            }
        };


    // =========================================================
    // RESEND OTP
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
                        purpose
                    }
                );


                setSuccess(
                    "A new OTP has been sent to your email."
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


    // =========================================================
    // PAGE
    // =========================================================

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
                    Verify Your Email
                </h2>


                <p className="auth-subtitle">

                    Enter the 6-digit verification code
                    sent to:

                </p>


                <p
                    style={{
                        fontWeight: "600",
                        marginBottom: "20px",
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
                            Verification Code
                        </label>


                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength="6"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(event) => {

                                const value =
                                    event.target.value
                                        .replace(
                                            /\D/g,
                                            ""
                                        )
                                        .slice(
                                            0,
                                            6
                                        );

                                setOtp(
                                    value
                                );

                            }}
                            autoComplete="one-time-code"
                            autoFocus
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            loading ||
                            otp.length !== 6
                        }
                    >

                        {loading
                            ? "Verifying..."
                            : "Verify OTP"
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

                    Wrong email?{" "}

                    <Link
                        to={
                            purpose ===
                                "LOGIN"
                                ? "/login"
                                : "/register"
                        }
                    >
                        Go back
                    </Link>

                </p>

            </div>

        </div>
    );
}


export default VerifyOtp;