const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    cargoType: { type: String },
    weight: { type: Number },
    pickup: { type: String },
    delivery: { type: String },
    expectedDelivery: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    vehicle: { type: String },
  },
  { timestamps: true }
);

const driverSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, unique: true }, // New manual driverId field
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: Date },
    phoneNumber: { type: String },
    email: { type: String },
    licenseNumber: { type: String },
    licenseExpiry: { type: Date },
    vehicleNumber: { type: String },
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
