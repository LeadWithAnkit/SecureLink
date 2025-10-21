import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            const token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            
            return res.status(httpStatus.OK).json({ 
                token: token,
                message: "Login successful"
            });
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" });
        }

    } catch (e) {
        console.error("Login error:", e);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ 
            message: "User registered successfully",
            user: { name, username }
        });

    } catch (e) {
        console.error("Registration error:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const meetings = await Meeting.find({ user_id: user.username });
        res.json(meetings);
    } catch (e) {
        console.error("Get history error:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    if (!token || !meeting_code) {
        return res.status(400).json({ message: "Token and meeting code are required" });
    }

    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added to meeting history" });
    } catch (e) {
        console.error("Add to history error:", e);
        res.status(500).json({ message: "Internal server error" });
    }
}

export { login, register, getUserHistory, addToHistory };