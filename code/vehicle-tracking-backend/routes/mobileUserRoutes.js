const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const MobileUser = require("../models/MobileUser");
const Driver = require("../models/Driver");
const auth = require("../middleware/auth");
const router = express.Router();

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-mobile-jwt-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

// Helper function to generate token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
      driverId: user.driverId,
      companyId: user.companyId,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Register a new mobile user
router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Username must be at least 4 characters"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
    // Remove fullName validation since we'll get it from the driver record
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("driverId")
      .trim()
      .notEmpty()
      .withMessage("Driver ID is required")
      .matches(/^DR\d{3}$/)
      .withMessage(
        "Driver ID must be in format DR followed by 3 digits (e.g., DR001)"
      ),
    body("companyId").trim().notEmpty().withMessage("Company ID is required"),
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        username,
        password,
        email,
        phone,
        driverId,
        companyId,
        deviceToken,
      } = req.body;

      // 1. First check if company exists
      const AdminUser = require("../models/AdminUser");
      const companyExists = await AdminUser.findOne({ companyId });

      if (!companyExists) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Company ID. This company is not registered in the system.",
        });
      }

      // 2. Check if driver exists and belongs to the specified company
      const driverExists = await Driver.findOne({
        driverId,
        companyId,
      });

      if (!driverExists) {
        return res.status(400).json({
          success: false,
          message:
            "Driver ID not found for this company. Please verify both Driver ID and Company ID.",
        });
      }

      // 3. Check if user already exists with this username and company
      const existingUser = await MobileUser.findOne({
        username,
        companyId,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already exists for this company",
        });
      }

      // 4. Check if driverId is already registered
      const driverRegistered = await MobileUser.findOne({
        driverId,
        companyId,
      });

      if (driverRegistered) {
        return res.status(400).json({
          success: false,
          message: "This driver is already registered in the system",
        });
      }

      // Create new mobile user with the validated driver information
      const newUser = new MobileUser({
        username,
        password,
        fullName: driverExists.fullName, // Use the fullName from the driver record
        email,
        phone,
        driverId,
        companyId,
        deviceToken: deviceToken || null,
        role: "driver", // Default role
        isActive: true,
      });

      // Save the user
      await newUser.save();

      // Generate JWT token
      const token = generateToken(newUser);

      // Return success response
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: newUser._id,
            username: newUser.username,
            fullName: newUser.fullName,
            email: newUser.email,
            phone: newUser.phone,
            driverId: newUser.driverId,
            companyId: newUser.companyId,
            role: newUser.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during registration",
        error: error.message,
      });
    }
  }
);

// Login mobile user - modified to not require companyId
router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    // Remove companyId validation
  ],
  async (req, res) => {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { username, password, deviceToken } = req.body;

      // Find user by username only, not requiring companyId
      const user = await MobileUser.findOne({
        username,
        isActive: true,
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password",
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      // Update device token if provided
      if (deviceToken) {
        user.deviceToken = deviceToken;
        await user.save();
      }

      // Update last login time
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = generateToken(user);

      // Return success response
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            username: user.username,
            fullName: user.fullName || user.username, // Default to username if no fullName
            email: user.email,
            phone: user.phone,
            driverId: user.driverId,
            companyId: user.companyId,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({
        success: false,
        message: error.message || "Invalid login credentials",
      });
    }
  }
);

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await MobileUser.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
});

// Update user profile
router.put(
  "/profile",
  auth,
  [
    body("fullName").optional().trim(),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("phone").optional(),
    body("deviceToken").optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { fullName, email, phone, deviceToken } = req.body;

      const user = await MobileUser.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update fields if provided
      if (fullName) user.fullName = fullName;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (deviceToken) user.deviceToken = deviceToken;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: {
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            driverId: user.driverId,
            companyId: user.companyId,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating profile",
      });
    }
  }
);

// Change password
router.post(
  "/change-password",
  auth,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await MobileUser.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while changing password",
      });
    }
  }
);

// Logout - Just for API completeness, actual logout happens on client
router.post("/logout", auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
