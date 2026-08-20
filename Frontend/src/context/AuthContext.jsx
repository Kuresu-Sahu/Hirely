import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {

    // ==========================================
    // LOAD TOKEN FROM LOCAL STORAGE
    // ==========================================

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );


    // ==========================================
    // LOAD USER FROM LOCAL STORAGE
    // ==========================================

    const [user, setUser] = useState(() => {

        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (error) {
                return null;
            }
        }

        return null;
    });


    // ==========================================
    // LOGIN
    // ==========================================

    const login = (loginResponse) => {

        /*
         * Backend LoginResponse:
         *
         * token
         * name
         * email
         * role
         */

        const receivedToken = loginResponse.token;


        if (!receivedToken) {

            throw new Error(
                "Login successful but JWT token was not received"
            );
        }


        // Create user object from backend response

        const loggedInUser = {
            name: loginResponse.name,
            email: loginResponse.email,
            role: loginResponse.role
        };


        // Save JWT

        localStorage.setItem(
            "token",
            receivedToken
        );


        // Save user information

        localStorage.setItem(
            "user",
            JSON.stringify(loggedInUser)
        );


        // Update React state

        setToken(receivedToken);

        setUser(loggedInUser);
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setToken(null);

        setUser(null);
    };


    // ==========================================
    // CONTEXT
    // ==========================================

    return (

        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout,
                isAuthenticated: !!token
            }}
        >

            {children}

        </AuthContext.Provider>
    );
};


// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAuth = () => {

    return useContext(AuthContext);
};