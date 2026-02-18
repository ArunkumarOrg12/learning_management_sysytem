const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect middleware — reads accessToken cookie, verifies JWT,
 * then validates the sessionToken claim against the DB to enforce single-session.
 */
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, please login",
      });
    }

    // Verify JWT signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access token expired",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }

    // Load user with sessionToken for single-session check
    const user = await User.findById(decoded.id).select("+sessionToken");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Single-session enforcement: if sessionToken in DB doesn't match the one in the JWT,
    // this session has been superseded by a newer login.
    if (user.sessionToken !== decoded.sessionToken) {
      return res.status(401).json({
        success: false,
        message: "Session invalidated. Another device has logged in.",
        code: "SESSION_INVALIDATED",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

/**
 * Admin-only middleware — must be used after protect.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }
};

module.exports = { protect, isAdmin };
