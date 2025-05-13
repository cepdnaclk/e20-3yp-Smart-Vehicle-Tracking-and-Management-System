const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        cargoType: { type: String, required: true },
        weight: { type: Number, required: true },
        pickup: { type: String, required: true },
        delivery: { type: String, required: true },
        expectedDelivery: { type: Date, required: true },
        status: {
            type: String,
            enum: ["Pending", "In Progress", "Completed"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

const driverSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dateOfBirth: { type: Date },
        phoneNumber: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        licenseNumber: { type: String, required: true, unique: true },
        licenseExpiry: { type: Date, required: true },
        vehicleId: { type: String, required: true },
        lastLocation: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        employmentStatus: {
            type: String,
            enum: ["active", "onLeave", "suspended", "terminated"],
            default: "active",
        },
        joiningDate: { type: Date },
        profileImage: { type: String },
        tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    },
    { timestamps: true }
);

const Driver = mongoose.model("Driver", driverSchema);
const Task = mongoose.model("Task", taskSchema);

module.exports = { Driver, Task };
