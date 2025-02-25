const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    vehicleType: {
      type: String,
      enum: ["car", "truck", "van", "bus", "motorcycle", "other"],
      default: "car",
    },
    make: { type: String, default: "" },
    model: { type: String, default: "" },
    year: { type: Number, min: 1900, max: 2100 },
    vin: { type: String, default: "" },
    color: { type: String, default: "" },
    fuelType: {
      type: String,
      enum: ["gasoline", "diesel", "electric", "hybrid", "cng", "lpg"],
      default: "gasoline",
    },
    assignedDriver: { type: String, default: "" },
    deviceId: { type: String, required: true },
    trackingEnabled: { type: Boolean, default: true },
    sensorEnabled: { type: Boolean, default: true },
    occupancyDetectionEnabled: { type: Boolean, default: true },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    lastLocation: { type: String, default: "Not tracked yet" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
