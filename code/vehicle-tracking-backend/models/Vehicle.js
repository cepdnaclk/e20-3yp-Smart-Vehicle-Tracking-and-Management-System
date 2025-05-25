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
    vehicleId: { type: Number, unique: true },
    vehicleName: { type: String, required: true },
    licensePlate: { type: String, required: true, unique: true },
    vehicleType: {
      type: String,
      enum: ["car", "truck", "van", "bus", "motorcycle", "other"],
      default: "car",
    },
    year: { type: Number, min: 1900, max: 2100 },
    color: { type: String, default: "" },
    deviceId: { type: String, required: true },
    trackingEnabled: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    lastLocation: { type: String, default: "Not tracked yet" },
    assignedDriver: { type: String, default: "" },
    lastUpdated: { type: Date, default: Date.now },
    companyId: { type: String, default: "" }, // Add this field to store companyId
  },
  { timestamps: true }
);

// Pre-save hook to auto-increment vehicleId
vehicleSchema.pre("save", function (next) {
  const doc = this;
  if (doc.isNew) {
    Counter.findByIdAndUpdate(
      { _id: "vehicleId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )
      .then((counter) => {
        doc.vehicleId = counter.seq;
        next();
      })
      .catch((error) => {
        next(error);
      });
  } else {
    next();
  }
});

// Export the Vehicle model
module.exports = mongoose.model("Vehicle", vehicleSchema);
