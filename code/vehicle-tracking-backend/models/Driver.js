const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    driverId: { type: String, unique: true, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    joinDate: { type: Date, required: true },
    employmentStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    lastLocation: { type: String, default: "" },
    assignedVehicle: { type: String, default: "" },
    companyId: {
      type: String,
      required: false, // Optional field to associate with a company
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
