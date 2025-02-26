const mongoose = require("mongoose");

// Counter schema for auto-increment ID
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

// Vehicle schema
const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: Number, unique: true }, // Auto-increment ID
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

// Pre-save hook to auto-increment vehicleId
vehicleSchema.pre("save", function (next) {
  const doc = this;
  Counter.findByIdAndUpdate(
    { _id: "vehicleId" }, // The ID to track the sequence
    { $inc: { seq: 1 } }, // Increment the sequence by 1
    { new: true, upsert: true } // Create the document if it doesn't exist
  )
    .then((counter) => {
      doc.vehicleId = counter.seq; // Set the vehicleId to the incremented value
      next();
    })
    .catch((error) => {
      next(error);
    });
});

// Export the Vehicle model
module.exports = mongoose.model("Vehicle", vehicleSchema);
