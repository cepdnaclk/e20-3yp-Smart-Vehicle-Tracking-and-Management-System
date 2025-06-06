const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskNumber: {
      type: String,
      required: true,
      // Remove the unique: true constraint here
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
      required: true, // Changed to required to ensure tenant isolation
    },
  },
  { timestamps: true }
);

// Replace the simple index with a compound index for proper tenant isolation
// This makes taskNumber unique ONLY within the same companyId
taskSchema.index({ taskNumber: 1, companyId: 1 }, { unique: true });

// Add a separate index on just companyId for better query performance
taskSchema.index({ companyId: 1 });

module.exports = mongoose.model("Task", taskSchema);
