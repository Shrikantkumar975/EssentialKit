import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    shortId: { type: String, required: true, unique: true },
    longUrl: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Link to User
    clicks: { type: Number, default: 0 }, // Added basic analytics
}, { timestamps: true });

const URL = mongoose.model("URL", urlSchema);
export default URL;
