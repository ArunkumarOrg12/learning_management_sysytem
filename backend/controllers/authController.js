const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// ─── Token Generators ────────────────────────────────────────────────────────

/**
 * Generate a short-lived access token (15 min).
 * Embeds userId + sessionToken so middleware can verify the session is still valid.
 */
const generateAccessToken = (userId, sessionToken) => {
  return jwt.sign(
    { id: userId, sessionToken },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m" }
  );
};

/**
 * Generate a long-lived refresh token (7 days).
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d" }
  );
};

// ─── Cookie Options ───────────────────────────────────────────────────────────

const accessCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: "/",
});

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
});

// ─── Shared Login Logic ───────────────────────────────────────────────────────

const performLogin = async (req, res, requiredRole) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  // Find user with password + session fields
  const user = await User.findOne({ email }).select("+password +sessionToken +refreshToken");
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Role gate — wrong portal
  if (user.role !== requiredRole) {
    const portalName = requiredRole === "admin" ? "admin portal" : "student portal";
    return res.status(403).json({
      success: false,
      message: `This account is not a ${requiredRole} account. Please use the ${portalName}.`,
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Generate new session token (UUID) — invalidates any previous session
  const sessionToken = crypto.randomUUID();

  // Generate tokens
  const accessToken = generateAccessToken(user._id, sessionToken);
  const refreshToken = generateRefreshToken(user._id);

  // Hash and store refresh token + new session token in DB
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  user.sessionToken = sessionToken;
  user.refreshToken = hashedRefreshToken;
  await user.save({ validateBeforeSave: false });

  // Set cookies
  res.cookie("accessToken", accessToken, accessCookieOptions());
  res.cookie("refreshToken", refreshToken, refreshCookieOptions());

  return res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      subscription: user.subscription,
      enrolledCourses: user.enrolledCourses,
    },
  });
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    Register student
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Registrations are always students
    const user = await User.create({ name, email, password, role: "student" });

    // Auto-login after register
    const sessionToken = crypto.randomUUID();
    const accessToken = generateAccessToken(user._id, sessionToken);
    const refreshToken = generateRefreshToken(user._id);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await User.findByIdAndUpdate(user._id, {
      sessionToken,
      refreshToken: hashedRefreshToken,
    });

    res.cookie("accessToken", accessToken, accessCookieOptions());
    res.cookie("refreshToken", refreshToken, refreshCookieOptions());

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Student login (rejects admins)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    await performLogin(req, res, "student");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin login (rejects students)
// @route   POST /api/auth/admin/login
exports.adminLogin = async (req, res) => {
  try {
    await performLogin(req, res, "admin");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh access token using refresh token cookie
// @route   POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }

    // Verify JWT signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    // Find user with stored refresh token
    const user = await User.findById(decoded.id).select("+refreshToken +sessionToken");
    if (!user || !user.refreshToken) {
      return res.status(401).json({ success: false, message: "Session not found, please login again" });
    }

    // Validate stored refresh token matches
    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Refresh token mismatch, please login again" });
    }

    // Issue new access token (keep same sessionToken — no rotation needed here)
    const newAccessToken = generateAccessToken(user._id, user.sessionToken);
    res.cookie("accessToken", newAccessToken, accessCookieOptions());

    res.json({ success: true, message: "Token refreshed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout — clear cookies and invalidate DB session
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    // Invalidate session in DB if user is identified
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        sessionToken: null,
        refreshToken: null,
      });
    }

    const clearOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    res.cookie("accessToken", "", { ...clearOptions, expires: new Date(0) });
    res.cookie("refreshToken", "", { ...clearOptions, expires: new Date(0) });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("enrolledCourses");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
