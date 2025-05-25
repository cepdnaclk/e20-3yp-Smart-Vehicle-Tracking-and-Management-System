const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const AdminUser = require("../models/AdminUser");
const auth = require("../middleware/auth");
const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Generate JWT token helper function
const generateToken = (userId) => {
  // Get user from database to include required fields
  return new Promise(async (resolve, reject) => {
    try {
      const user = await AdminUser.findById(userId);
      if (!user) {
        reject(new Error("User not found"));
        return;
      }

      // Make sure to include companyId in the token payload
      const payload = {
        userId: user._id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      };

      console.log("Generating token with payload:", payload);

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

      resolve(token);
    } catch (error) {
      reject(error);
    }
  });
};

// POST /api/admin/register - Register new admin user
router.post(
  "/register",
  [
    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address"),
    body("phone")
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please enter a valid phone number"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .withMessage(
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    body("companyId").trim().notEmpty().withMessage("Company ID is required"),
    body("role")
      .optional()
      .isIn(["owner", "admin", "manager"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    console.log("Register endpoint hit with data:", req.body);
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email, phone, password, companyId, role } =
        req.body;

      // Check if user already exists
      const existingUser = await AdminUser.findOne({
        email: email.toLowerCase(),
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Create new user
      const user = new AdminUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password,
        companyId: companyId.trim(),
        role: role || "owner",
      });

      await user.save();

      // Generate JWT token
      const token = await generateToken(user._id);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            companyId: user.companyId,
            role: user.role,
            fullName: user.fullName,
            createdAt: user.createdAt,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during registration",
      });
    }
  }
);

// POST /api/admin/login - User login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user and validate credentials
      const user = await AdminUser.findByCredentials(email, password);

      // Generate JWT token
      const token = await generateToken(user._id);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            companyId: user.companyId, // Make sure companyId is included in response
            role: user.role,
            fullName: user.fullName,
            lastLogin: user.lastLogin,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET /api/admin/profile - Get user profile (protected route)
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          companyId: user.companyId,
          role: user.role,
          fullName: user.fullName,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// PUT /api/admin/profile - Update user profile (protected route)
router.put(
  "/profile",
  auth,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("phone")
      .optional()
      .trim()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please enter a valid phone number"),
    body("companyId")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Company ID cannot be empty"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, phone, companyId } = req.body;

      const user = await AdminUser.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update fields if provided
      if (firstName) user.firstName = firstName.trim();
      if (lastName) user.lastName = lastName.trim();
      if (phone) user.phone = phone.trim();
      if (companyId) user.companyId = companyId.trim();

      await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            companyId: user.companyId,
            role: user.role,
            fullName: user.fullName,
          },
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// POST /api/admin/change-password - Change password (protected route)
router.post(
  "/change-password",
  auth,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .withMessage(
        "New password must contain uppercase, lowercase, number, and special character"
      ),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await AdminUser.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

// Updated GET /api/admin/users - Get all users by company (admin only)
router.get("/users", auth, async (req, res) => {
  try {
    // Check if user is admin or owner
    const currentUser = await AdminUser.findById(req.user.userId);
    if (currentUser.role !== "admin" && currentUser.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required.",
      });
    }

    // Find users from the same company - enforces tenant isolation
    const users = await AdminUser.find({
      companyId: currentUser.companyId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select("-password");

    res.json({
      success: true,
      data: {
        users,
        total: users.length,
      },
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Add a new route to get company info - for dashboard and other needs
router.get("/company", auth, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all users from the same company to count admins, etc.
    const companyUsers = await AdminUser.find({
      companyId: user.companyId,
      isActive: true,
    }).select("-password");

    res.json({
      success: true,
      data: {
        companyId: user.companyId,
        adminCount: companyUsers.length,
        // Add other company-related stats as needed
      },
    });
  } catch (error) {
    console.error("Company info fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/admin/logout - Logout (protected route)
router.post("/logout", auth, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success and let the frontend handle token removal
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
