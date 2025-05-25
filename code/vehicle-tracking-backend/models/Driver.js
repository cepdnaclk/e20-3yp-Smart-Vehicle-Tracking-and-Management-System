const mongoose = require("mongoose");

// Drop any existing schema for Driver if it exists
mongoose.models = {};
mongoose.modelSchemas = {};

const driverSchema = new mongoose.Schema(
  {
    driverId: {
      type: String,
      required: true,
      // Make sure there's NO unique: true here
    },
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
      required: true, // Changed to required to ensure tenant isolation
    },
  },
  { timestamps: true }
);

// IMPORTANT: Do not create any index here that would interfere with our manual compound index
// We'll create the indexes manually after model definition

const Driver = mongoose.model("Driver", driverSchema);

// Now create the proper indexes manually
Driver.collection.createIndex(
  { driverId: 1, companyId: 1 },
  { unique: true, background: true }
);

Driver.collection.createIndex({ companyId: 1 }, { background: true });

module.exports = Driver;
