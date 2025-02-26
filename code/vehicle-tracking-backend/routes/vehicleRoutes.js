const express = require("express");
const Vehicle = require("../models/Vehicle");
const router = express.Router();

// GET all vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new vehicle
router.post("/", async (req, res) => {
  const {
    vehicleName,
    licensePlate,
    vehicleType,
    make,
    model,
    year,
    vin,
    color,
    fuelType,
    assignedDriver,
    deviceId,
    trackingEnabled,
    sensorEnabled,
    occupancyDetectionEnabled,
    notes,
  } = req.body;

  try {
    const newVehicle = new Vehicle({
      vehicleName,
      licensePlate,
      vehicleType,
      make,
      model,
      year,
      vin,
      color,
      fuelType,
      assignedDriver,
      deviceId,
      trackingEnabled,
      sensorEnabled,
      occupancyDetectionEnabled,
      notes,
    });

    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET total number of vehicles
router.get("/count", async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    res.json({ totalVehicles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET active vehicles
router.get("/", async (req, res) => {
  try {
    let filter = {};
    if (req.query.status === "active") {
      filter = { status: "active" }; // Assuming vehicles have a `status` field
    }
    const vehicles = await Vehicle.find(filter);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a vehicle by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
