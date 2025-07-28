import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// API for user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if the user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        const userData = {
            name,
            email,
            password: hashedPassword, // Store the hashed password
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();

        // creaate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token, // Return the token to the client
        });
    } catch (error) {
        console.error("Error during user registration:", error.message);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Create a token if the password matches
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" } // Token expires in 1 hour
            );

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token, // Return the token to the client
            });
        } else {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Error during user login:", error.message);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
};

// Api for get user profile data
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req; // pull from req.userId

        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user profile:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { registerUser, loginUser, getUserProfile };
