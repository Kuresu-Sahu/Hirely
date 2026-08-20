import axios from "axios";

/*
 * =========================================================
 * API BASE URL
 * =========================================================
 *
 * Development:
 * VITE_API_URL=http://localhost:8080
 *
 * Production:
 * VITE_API_URL=https://your-backend-domain.com
 *
 * If VITE_API_URL is not configured, localhost is used
 * so local development continues to work.
 */

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080";


const api = axios.create({
    baseURL: API_BASE_URL,

    headers: {
        "Content-Type": "application/json",
    },

    timeout: 30000,
});


/*
 * =========================================================
 * ADD JWT TOKEN TO EVERY REQUEST
 * =========================================================
 */

api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem("token");

        if (token) {

            config.headers = config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {

        return Promise.reject(error);
    }
);


/*
 * =========================================================
 * HANDLE AUTHENTICATION ERRORS
 * =========================================================
 *
 * Only redirect when:
 *
 * 1. The server actually returned 401
 * 2. The user currently has a token
 *
 * This prevents unnecessary redirects for normal
 * unauthenticated requests.
 */

api.interceptors.response.use(

    (response) => {

        return response;
    },

    (error) => {

        if (error.response?.status === 401) {

            const token =
                localStorage.getItem("token");

            if (token) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                if (
                    window.location.pathname !==
                    "/login"
                ) {

                    window.location.href =
                        "/login";
                }
            }
        }

        return Promise.reject(error);
    }
);


export default api;