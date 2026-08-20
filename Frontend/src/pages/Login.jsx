import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";


function Login() {

    const navigate = useNavigate();


    const [email, setEmail] =
        useState("");


    const [password, setPassword] =
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
                    "/api/auth/login",
                    {
                        email:
                            email
                                .trim()
                                .toLowerCase(),

                        password
                    }
                );


                navigate(
                    `/verify-otp?email=${encodeURIComponent(
                        email.trim().toLowerCase()
                    )}&purpose=LOGIN`
                );


            } catch (error) {

                console.error(
                    "Login failed:",
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
                        "Login failed. Please check your email and password."
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
                    Login
                </h2>


                <p className="auth-subtitle">
                    Enter your credentials
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
                            Email
                        </label>


                        <input
                            type="email"
                            placeholder="Enter your email"
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


                    <div className="form-group">

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "8px"
                            }}
                        >

                            <label
                                style={{
                                    marginBottom: 0
                                }}
                            >
                                Password
                            </label>


                            <Link
                                to="/forgot-password"
                                style={{
                                    color: "#2563eb",
                                    fontSize: "12px",
                                    fontWeight: "700"
                                }}
                            >
                                Forgot Password?
                            </Link>

                        </div>


                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            autoComplete="current-password"
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
                            : "Continue"
                        }

                    </button>

                </form>


                <p className="auth-footer">

                    Don't have an account?{" "}

                    <Link to="/register">
                        Register here
                    </Link>

                </p>


                <p className="auth-footer">

                    Are you a recruiter?{" "}

                    <Link
                        to="/register/recruiter"
                    >
                        Register as Recruiter
                    </Link>

                </p>

            </div>

        </div>
    );
}


export default Login;