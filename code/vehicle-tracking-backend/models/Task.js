const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskNumber: {
      type: String,
      required: true,
      unique: true,
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
    driverId: {
      type: String,
      ref: "Driver",
      required: false, // Allow null for when driver is deleted
      default: null,
    },
    companyId: {
      type: String,
      required: false, // Optional field to associate with a company
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
