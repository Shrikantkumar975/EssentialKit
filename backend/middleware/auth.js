import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: "Not authorized, token failed" });
        }
    }

    if (!token) {
        // Optional: Allow anonymous access but don't set req.user
        // For now, we'll make it strict for protected routes
        res.status(401).json({ error: "Not authorized, no token" });
    }
};

// Optional: Middleware for optional auth (if we want to allow anonymous shortening still)
export const optionalAuth = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
            req.user = await User.findById(decoded.id).select("-password");
        } catch (error) {
            console.error("Token verification failed, proceeding as anonymous");
        }
    }
    next();
};
