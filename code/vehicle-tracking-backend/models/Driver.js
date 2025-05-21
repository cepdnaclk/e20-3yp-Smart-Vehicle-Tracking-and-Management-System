const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskNumber: {
      type: String,
      required: true,
      unique: true, // Make taskNumber unique across all drivers
    },
    cargoType: { type: String, required: true },
    weight: { type: Number, required: true, min: 0 },
    pickup: { type: String, required: true },
    delivery: { type: String, required: true },
    deliveryPhone: { type: String, required: true },
    expectedDelivery: { type: Date, required: true },
    additionalNotes: { type: String },
    licensePlate: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    driverId: { type: String, required: true, ref: "Driver" },
  },
  { timestamps: true }
);

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
  },
  { timestamps: true }
);

module.exports = {
  Driver: mongoose.model("Driver", driverSchema),
  Task: mongoose.model("Task", taskSchema),
};
