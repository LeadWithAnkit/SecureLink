import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";

// Import routes
import userRoutes from "./routes/user.routes.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Server setup
const server = createServer(app);

// CORS configuration
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173",  "http://127.0.0.1:3000"], // Add your frontend URLs
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Routes
app.use("/api/v1/users", userRoutes);

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "Server is running!" });
});

// Socket.io setup
const io = connectToSocket(server);

const start = async () => {
    try {
        const connectionDb = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Mongo connected db host: ${connectionDb.connection.host}`);
        
        server.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

start();