
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;

if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing from the .env file.");
    process.exit(1);
}

mongoose.set("strictQuery", true);

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Please log in."
        });
    }

    jwt.verify(token, JWT_SECRET, (error, decodedUser) => {
        if (error) {
            return res.status(403).json({
                message: "Invalid or expired token. Please log in again."
            });
        }

        req.user = decodedUser;
        next();
    });
}

// Threat Schema
const threatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    severity: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Medium"
    }
}, { timestamps: true });

const Threat = mongoose.model("Threat", threatSchema);

// Home API
app.get("/", (req, res) => {
    res.json({
        message: "CyberShield API is running successfully!"
    });
});

// READ: Get all threats (public)
app.get("/api/threats", async (req, res) => {
    try {
        const threats = await Threat.find().sort({ createdAt: -1 });
        res.json(threats);
    } catch (error) {
        console.error("Fetch threats error:", error.message);
        res.status(500).json({
            message: "Failed to fetch threats."
        });
    }
});

// CREATE: Add a threat (login required)
app.post("/api/threats", authenticateToken, async (req, res) => {
    try {
        const { name, description, severity } = req.body;

        if (
            typeof name !== "string" ||
            typeof description !== "string" ||
            !name.trim() ||
            !description.trim()
        ) {
            return res.status(400).json({
                message: "Name and description are required."
            });
        }

        const threat = await Threat.create({
            name: name.trim(),
            description: description.trim(),
            severity
        });

        res.status(201).json(threat);
    } catch (error) {
        res.status(400).json({
            message: error.message || "Failed to create threat."
        });
    }
});

// UPDATE: Edit a threat (login required)
app.put("/api/threats/:id", authenticateToken, async (req, res) => {
    try {
        const { name, description, severity } = req.body;

        if (
            typeof name !== "string" ||
            typeof description !== "string" ||
            !name.trim() ||
            !description.trim()
        ) {
            return res.status(400).json({
                message: "Name and description are required."
            });
        }

        const threat = await Threat.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                description: description.trim(),
                severity
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!threat) {
            return res.status(404).json({
                message: "Threat not found."
            });
        }

        res.json(threat);
    } catch (error) {
        res.status(400).json({
            message: "Invalid threat data or ID."
        });
    }
});

// DELETE: Remove a threat (login required)
app.delete("/api/threats/:id", authenticateToken, async (req, res) => {
    try {
        const threat = await Threat.findByIdAndDelete(req.params.id);

        if (!threat) {
            return res.status(404).json({
                message: "Threat not found."
            });
        }

        res.json({
            message: "Threat deleted successfully."
        });
    } catch (error) {
        res.status(400).json({
            message: "Invalid threat ID."
        });
    }
});

// USER SIGNUP
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            password.length < 8
        ) {
            return res.status(400).json({
                message: "Enter a valid name, email, and password of at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = jwt.sign(
            { id: user._id.toString() },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(201).json({
            message: "Account created successfully!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        console.error("Signup error:", error.message);
        res.status(500).json({
            message: "Signup failed."
        });
    }
});

// USER LOGIN
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            { id: user._id.toString() },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            message: "Login failed."
        });
    }
});

// START SERVER
async function startServer() {
    try {
        await mongoose.connect(
            process.env.MONGO_URI ||
            "mongodb://127.0.0.1:27017/cybershield"
        );

        console.log("MongoDB connected successfully!");

        const count = await Threat.countDocuments();

        if (count === 0) {
            await Threat.insertMany([
                {
                    name: "Phishing",
                    description: "Fake messages designed to steal personal information.",
                    severity: "High"
                },
                {
                    name: "Ransomware",
                    description: "Malware that locks files and demands payment.",
                    severity: "Critical"
                },
                {
                    name: "Malware",
                    description: "Software designed to harm or compromise a system.",
                    severity: "High"
                },
                {
                    name: "Password Attacks",
                    description: "Attempts to guess or steal account passwords.",
                    severity: "Medium"
                }
            ]);

            console.log("Default threats added.");
        }

        app.listen(PORT, () => {
            console.log(`CyberShield server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
    }
}

startServer();
