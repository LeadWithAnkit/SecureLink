import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';

dotenv.config();

// -Existing user- LOGIN --
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Please provide all required fields" });
  }

  try {
    // check existing user
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }

    // payload
    const payload = { id: user._id, username: user.username };

    // generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // optionally save in DB
    user.token = token;
    user.tokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    return res.status(httpStatus.OK).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong: ${error.message}` });
  }
};

//  REGISTER/ new user creation
const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Please provide all required fields" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      token: null,
      tokenExpiry: null,
    });

    await newUser.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong: ${error.message}` });
  }
};

export { login, register };
