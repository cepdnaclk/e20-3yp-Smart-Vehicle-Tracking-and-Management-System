const express = require("express");
const { body, validationResult } = require("express-validator");
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
router.post(
  "/",
  [
    body("vehicleName").notEmpty().withMessage("Vehicle name is required"),
    body("licensePlate").notEmpty().withMessage("License plate is required"),
    body("vehicleType")
      .isIn(["car", "truck", "van", "bus", "motorcycle", "other"])
      .withMessage("Invalid vehicle type"),
    body("make").optional().isString(),
    body("model").optional().isString(),
    body("year")
      .optional()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Invalid year"),
    body("color").optional().isString(),
    body("deviceId").notEmpty().withMessage("Device ID is required"),
    body("trackingEnabled").optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      vehicleName,
      licensePlate,
      vehicleType,
      make,
      model,
      year,
      color,
      deviceId,
      trackingEnabled,
      status,
      lastLocation,
    } = req.body;

    try {
      const newVehicle = new Vehicle({
        vehicleName,
        licensePlate,
        vehicleType,
        make,
        model,
        year,
        color,
        deviceId,
        trackingEnabled,
        status: status || "active",
        lastLocation: lastLocation || "Not tracked yet",
      });

      const savedVehicle = await newVehicle.save();
      res.status(201).json(savedVehicle);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// PUT update a vehicle by ID
router.put(
  "/:id",
  [
    body("vehicleName").notEmpty().withMessage("Vehicle name is required"),
    body("licensePlate").notEmpty().withMessage("License plate is required"),
    body("vehicleType")
      .isIn(["car", "truck", "van", "bus", "motorcycle", "other"])
      .withMessage("Invalid vehicle type"),
    body("make").optional().isString(),
    body("model").optional().isString(),
    body("year")
      .optional()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Invalid year"),
    body("color").optional().isString(),
    body("deviceId").notEmpty().withMessage("Device ID is required"),
    body("trackingEnabled").optional().isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const vehicle = await Vehicle.findById(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const {
        vehicleName,
        licensePlate,
        vehicleType,
        make,
        model,
        year,
        color,
        deviceId,
        trackingEnabled,
        status,
        lastLocation,
      } = req.body;

      vehicle.vehicleName = vehicleName;
      vehicle.licensePlate = licensePlate;
      vehicle.vehicleType = vehicleType;
      vehicle.make = make || "";
      vehicle.model = model || "";
      vehicle.year = year;
      vehicle.color = color || "";
      vehicle.deviceId = deviceId;
      vehicle.trackingEnabled =
        trackingEnabled !== undefined
          ? trackingEnabled
          : vehicle.trackingEnabled;
      vehicle.status = status || vehicle.status;
      vehicle.lastLocation = lastLocation || vehicle.lastLocation;

      const updatedVehicle = await vehicle.save();
      res.json(updatedVehicle);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

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

// GET total number of vehicles
router.get("/count", async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    res.json({ totalVehicles });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
