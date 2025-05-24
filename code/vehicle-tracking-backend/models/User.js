const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true, // This already creates an index, so we don't need the explicit index below
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "manager"],
      default: "owner",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance - removed duplicate email index
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Static method to find user by email and validate password
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({
    email: email.toLowerCase(),
    isActive: true,
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const lockTimeRemaining = Math.ceil(
      (user.lockUntil - Date.now()) / (1000 * 60)
    );
    throw new Error(
      `Account is locked. Try again in ${lockTimeRemaining} minutes`
    );
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    // Increment login attempts
    user.loginAttempts += 1;

    // Lock account after 5 failed attempts for 15 minutes
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }

    await user.save();
    throw new Error("Invalid email or password");
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = null;
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return user;
};

// Static method for password validation
userSchema.statics.validatePassword = function (password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Static method for email validation
userSchema.statics.validateEmail = function (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Static method for phone validation
userSchema.statics.validatePhone = function (phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
};

module.exports = mongoose.model("User", userSchema);
