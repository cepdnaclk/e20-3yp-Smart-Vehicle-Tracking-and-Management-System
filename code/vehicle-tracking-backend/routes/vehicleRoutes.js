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

module.exports = router;
