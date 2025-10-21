import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

// Create axios instance - use relative path for Vite proxy
const client = axios.create({
    baseURL: server ? `${server}/api/v1/users` : '/api/v1/users',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState({});
    const navigate = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            console.log("🎯 Starting registration...");
            
            const request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            });

            if (request.status === httpStatus.CREATED) {
                console.log("🎉 Registration successful!");
                return request.data.message;
            }
        } catch (err) {
            console.error("💥 Registration failed:", err);
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            console.log("🎯 Starting login...");
            
            const request = await client.post("/login", {
                username: username,
                password: password
            });

            if (request.status === httpStatus.OK && request.data.token) {
                localStorage.setItem("token", request.data.token);
                console.log("🎉 Login successful!");
                navigate("/home");
                return request.data;
            }
        } catch (err) {
            console.error("💥 Login failed:", err);
            throw err;
        }
    }

    const getHistoryOfUser = async () => {
        try {
            const request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data;
        } catch (err) {
            console.error("Get history error:", err);
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            const request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request;
        } catch (e) {
            console.error("Add to history error:", e);
            throw e;
        }
    }

    const data = {
        userData, 
        setUserData, 
        addToUserHistory, 
        getHistoryOfUser, 
        handleRegister, 
        handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
}