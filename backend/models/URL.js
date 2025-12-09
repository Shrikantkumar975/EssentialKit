import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    shortId: { type: String, required: true, unique: true },
    longUrl: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Link to User
    clicks: { type: Number, default: 0 }, // Added basic analytics
    expiresAt: { type: Date, default: null }, // Expiration date
    analytics: [
        {
            timestamp: { type: Date, default: Date.now },
            ip: String,
            userAgent: String,
        }
    ],
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
}, { timestamps: true });

const URL = mongoose.model("URL", urlSchema);
export default URL;
