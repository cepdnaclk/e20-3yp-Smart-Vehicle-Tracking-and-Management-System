const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const MobileUser = require("../models/MobileUser");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Check if token starts with 'Bearer '
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Try to find user in both AdminUser and MobileUser collections
    let user = await AdminUser.findById(decoded.userId);
    let userType = 'admin';

    if (!user) {
      user = await MobileUser.findById(decoded.userId);
      userType = 'mobile';
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not found or inactive.",
      });
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      role: user.role,
      email: user.email,
      companyId: user.companyId,
      userType: userType,
      // Add mobile-specific fields if it's a mobile user
      ...(userType === 'mobile' && {
        driverId: user.driverId,
        username: user.username
      })
    };

    console.log("Auth middleware set user context:", req.user);
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token expired.",
      });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = auth;
