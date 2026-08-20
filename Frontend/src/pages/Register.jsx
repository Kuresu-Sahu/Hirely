import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import api from "../services/api";


function Register() {

    const navigate = useNavigate();


    const [name, setName] =
        useState("");


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
                    "/api/auth/register",
                    {
                        name:
                            name.trim(),

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
                    )}&purpose=REGISTER`
                );


            } catch (error) {

                console.error(
                    "Registration failed:",
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
                        "Registration failed."
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
                    Candidate Registration
                </h2>


                <p className="auth-subtitle">
                    Verify your email to create your account
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
                            Full Name
                        </label>


                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            minLength="2"
                            maxLength="100"
                            autoComplete="name"
                            required
                        />

                    </div>


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
                            maxLength="150"
                            autoComplete="email"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Password
                        </label>


                        <input
                            type="password"
                            placeholder="Create password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
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
                        disabled={loading}
                    >

                        {loading
                            ? "Sending OTP..."
                            : "Continue"}

                    </button>

                </form>


                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        borderTop: "1px solid #e5e7eb",
                        textAlign: "center"
                    }}
                >

                    <p>
                        Are you hiring candidates?
                    </p>


                    <Link
                        to="/register/recruiter"
                        className="secondary-button"
                        style={{
                            display: "inline-block",
                            textDecoration: "none"
                        }}
                    >
                        Register as Recruiter
                    </Link>

                </div>


                <p className="auth-footer">

                    Already have an account?{" "}

                    <Link to="/login">
                        Login here
                    </Link>

                </p>

            </div>

        </div>
    );
}


export default Register;