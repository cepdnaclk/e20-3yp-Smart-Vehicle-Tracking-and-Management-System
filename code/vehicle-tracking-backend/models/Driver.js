const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date, required: true },
    licenseImage: { type: String }, // Store file path or URL
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    employmentStatus: {
      type: String,
      enum: ["active", "onLeave", "suspended", "terminated"],
      default: "active",
    },
    joiningDate: { type: Date },
    emergencyContact: { type: String },
    emergencyPhone: { type: String },
    driverNotes: { type: String },
    profileImage: { type: String }, // Store file path or URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
