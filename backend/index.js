
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import validator from "validator";
import jwt from "jsonwebtoken";
import * as cheerio from "cheerio";

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

// API: Create Short URL (Optional Auth)
app.post("/shorten", optionalAuth, async (req, res) => {
  try {
    const { longUrl, customAlias, expiresAt } = req.body;
    console.log("Received /shorten request:", { longUrl, customAlias, expiresAt, user: req.user });

    if (!longUrl || !validator.isURL(longUrl)) {
      return res.status(400).json({ error: "Invalid URL provided" });
    }

    let shortId;
    let finalExpiresAt = expiresAt ? new Date(expiresAt) : null;

    // Feature Restrictions
    if (!req.user) {
      // GUEST USER
      // 1. Enforce 10-day expiration
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
      finalExpiresAt = tenDaysFromNow;

      // 2. Block Custom Alias
      if (customAlias) {
        return res.status(403).json({ error: "Login required for Custom Aliases" });
      }

      // 3. Block Custom Expiration (implied by enforcing 10 days, but good to be explicit if they tried to send one)
      if (expiresAt) {
        return res.status(403).json({ error: "Login required for Custom Expiration Dates" });
      }

      shortId = nanoid(6);
    } else {
      // LOGGED-IN USER
      if (customAlias) {
        // Validate custom alias
        const aliasRegex = /^[a-zA-Z0-9-_]+$/;
        if (!aliasRegex.test(customAlias)) {
          return res.status(400).json({ error: "Invalid alias format" });
        }
        // Check availability
        const existing = await URL.findOne({ shortId: customAlias });
        if (existing) {
          return res.status(400).json({ error: "Alias already in use" });
        }
        shortId = customAlias;
      } else {
        shortId = nanoid(6);
      }
    }

    // Create URL
    let ogTitle, ogDescription, ogImage;
    try {
      const response = await fetch(longUrl);
      const html = await response.text();
      const $ = cheerio.load(html);
      ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text();
      ogDescription = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
      ogImage = $('meta[property="og:image"]').attr('content');
    } catch (err) {
      console.error("Failed to fetch OG data:", err.message);
    }

    const newUrl = await URL.create({
      shortId,
      longUrl,
      user: req.user ? req.user._id : null,
      expiresAt: finalExpiresAt,
      ogTitle,
      ogDescription,
      ogImage
    });
    console.log("Created URL:", newUrl);

    res.json({ shortUrl: `${BASE_URL}/${shortId}` });
  } catch (error) {
    console.error("Error in /shorten:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Alias already in use" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API: Get Analytics (Protected)
app.get("/analytics/:shortId", optionalAuth, async (req, res) => {
  try {
    const data = await URL.findOne({ shortId: req.params.shortId });

    if (!data) return res.status(404).json({ error: "URL not found" });

    if (data.user && (!req.user || data.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: "Unauthorized to view analytics" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error in /analytics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Redirect
app.get("/:shortId", async (req, res) => {
  try {
    const data = await URL.findOne({ shortId: req.params.shortId });
    if (!data) return res.status(404).send("URL Not Found");

    // Check expiration
    if (data.expiresAt) {
      const now = new Date();
      if (now > data.expiresAt) {
        return res.status(410).send("This link has expired");
      }
    }

    // Bot Detection for Social Media Previews
    const userAgent = req.headers["user-agent"] || "";
    const isBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|discordbot|telegrambot/i.test(userAgent);

    if (isBot) {
      return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta property="og:title" content="${data.ogTitle || 'Shortened URL'}" />
                <meta property="og:description" content="${data.ogDescription || 'Click to visit the link.'}" />
                <meta property="og:image" content="${data.ogImage || ''}" />
                <meta property="og:url" content="${BASE_URL}/${data.shortId}" />
            </head>
            <body>
            </body>
            </html>
        `);
    }

    // Increment clicks (simple analytics)
    data.clicks++;

    // Detailed Analytics
    data.analytics.push({
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await data.save();

    res.redirect(data.longUrl);
  } catch (error) {
    console.error("Error in redirect:", error);
    res.status(500).send("Internal Server Error");
  }
});

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


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
