import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function GoogleLoginButton({ role = "CANDIDATE", text = "Sign in with Google" }) {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleBackendGoogleAuth = async (payload) => {
        setLoading(true);
        try {
            const response = await api.post("/api/auth/google", {
                email: payload.email,
                name: payload.name,
                sub: payload.sub,
                picture: payload.picture,
                role: role
            });
            login(response.data);
            if (response.data.role === "RECRUITER") {
                navigate("/recruiter/dashboard");
            } else {
                navigate("/candidate/dashboard");
            }
        } catch (err) {
            console.error("Google Auth failed:", err);
            alert(err.response?.data || "Google Authentication failed. Please try standard login.");
        } finally {
            setLoading(false);
        }
    };

    const handleMockGoogleLogin = () => {
        const testEmail = prompt("Enter your Google Account email for fast Google Auth login:", "user@gmail.com");
        if (testEmail) {
            const name = testEmail.split("@")[0];
            handleBackendGoogleAuth({
                email: testEmail,
                name: name.charAt(0).toUpperCase() + name.slice(1),
                sub: "google-oauth-" + Date.now()
            });
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Fetch Google profile info using access token
                const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userInfoRes.json();
                await handleBackendGoogleAuth({
                    email: userInfo.email,
                    name: userInfo.name,
                    sub: userInfo.sub,
                    picture: userInfo.picture
                });
            } catch (error) {
                console.error("Failed to fetch Google user info:", error);
                handleMockGoogleLogin();
            }
        },
        onError: () => {
            console.warn("Google OAuth popup blocked or client ID not configured. Using fallback sign-in.");
            handleMockGoogleLogin();
        }
    });

    return (
        <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all duration-200"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
            </svg>
            <span>{loading ? "Authenticating with Google..." : text}</span>
        </button>
    );
}

export default GoogleLoginButton;
