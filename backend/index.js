import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import validator from "validator";
import jwt from "jsonwebtoken";

import User from "./models/User.js";
import URL from "./models/URL.js";
import { optionalAuth } from "./middleware/auth.js";

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/urlshortener";
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// MongoDB connect
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- Auth Routes ---

// Register
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// --- URL Routes ---

// API: Create Short URL (Optional Auth)
app.post("/shorten", optionalAuth, async (req, res) => {
  try {
    const { longUrl } = req.body;

    if (!longUrl || !validator.isURL(longUrl)) {
      return res.status(400).json({ error: "Invalid URL provided" });
    }

    const shortId = nanoid(6);

    // Create URL with user ID if logged in
    await URL.create({
      shortId,
      longUrl,
      user: req.user ? req.user._id : null
    });

    res.json({ shortUrl: `${BASE_URL}/${shortId}` });
  } catch (error) {
    console.error("Error in /shorten:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Redirect
app.get("/:shortId", async (req, res) => {
  try {
    const data = await URL.findOne({ shortId: req.params.shortId });
    if (!data) return res.status(404).send("URL Not Found");

    // Increment clicks (simple analytics)
    data.clicks++;
    await data.save();

    res.redirect(data.longUrl);
  } catch (error) {
    console.error("Error in redirect:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
