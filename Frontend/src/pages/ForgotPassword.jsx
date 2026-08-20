import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";


function ForgotPassword() {

    const navigate = useNavigate();


    const [email, setEmail] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setError("");
            setLoading(true);


            try {

                await api.post(
                    "/api/auth/forgot-password",
                    {
                        email:
                            email
                                .trim()
                                .toLowerCase()
                    }
                );


                navigate(
                    `/reset-password?email=${encodeURIComponent(
                        email.trim().toLowerCase()
                    )}`
                );


            } catch (error) {

                console.error(
                    "Forgot password request failed:",
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
                        "Unable to process the request. Please try again."
                    );
                }

            } finally {

                setLoading(false);
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
                    Forgot Password?
                </h2>


                <p className="auth-subtitle">

                    Enter the email address associated
                    with your account.

                </p>


                {error && (

                    <div className="error-message">

                        {error}

                    </div>

                )}


                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div className="form-group">

                        <label>
                            Email Address
                        </label>


                        <input
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            autoComplete="email"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Sending OTP..."
                            : "Send Reset OTP"
                        }

                    </button>

                </form>


                <p className="auth-footer">

                    Remember your password?{" "}

                    <Link to="/login">
                        Back to Login
                    </Link>

                </p>

            </div>

        </div>
    );
}


export default ForgotPassword;