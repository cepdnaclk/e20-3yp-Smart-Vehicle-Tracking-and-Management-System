const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    cargoType: { type: String },
    weight: { type: Number },
    pickup: { type: String },
    delivery: { type: String },
    expectedDelivery: { type: Date },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

const driverSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    phoneNumber: { type: String },
    email: { type: String },
    licenseNumber: { type: String },
    licenseExpiry: { type: Date },
    vehicleId: { type: String },
    lastLocation: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    employmentStatus: { type: String, default: "active" },
    joiningDate: { type: Date },
    profileImage: { type: String },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

const Driver = mongoose.model("Driver", driverSchema);
const Task = mongoose.model("Task", taskSchema);

module.exports = { Driver, Task };
