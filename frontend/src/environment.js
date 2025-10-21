// environment.js - FIXED VERSION
const server = import.meta.env.MODE === 'development' 
    ? "http://localhost:8000" // ✅ Explicitly connect to backend port 8000
    : "https://securelink-backend.onrender.com"; // Production URL

export default server;