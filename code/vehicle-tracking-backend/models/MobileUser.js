const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const mobileUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: false, // We'll use compound index instead
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    driverId: {
      type: String,
      required: true,
      trim: true,
      // No unique constraint here, will use compound index
    },
    companyId: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["driver", "supervisor"],
      default: "driver",
    },
    deviceToken: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Create compound index for username and companyId
mobileUserSchema.index({ username: 1, companyId: 1 }, { unique: true });

// Create compound index for driverId and companyId
mobileUserSchema.index({ driverId: 1, companyId: 1 }, { unique: true });

// Pre-save hook to hash password
mobileUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password validity
mobileUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user by credentials
mobileUserSchema.statics.findByCredentials = async function (
  username,
  password,
  companyId
) {
  // First try to find the user with both username and companyId
  const user = await this.findOne({
    username,
    companyId,
    isActive: true,
  });

  if (!user) {
    throw new Error("Invalid username or company ID");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  return user;
};

module.exports = mongoose.model("MobileUser", mobileUserSchema);
