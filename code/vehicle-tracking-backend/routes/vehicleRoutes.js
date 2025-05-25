const express = require("express");
const { body, validationResult } = require("express-validator");
const Vehicle = require("../models/Vehicle");
const AdminUser = require("../models/AdminUser"); // Update this if User is being imported
const auth = require("../middleware/auth"); // Import the auth middleware
const router = express.Router();

// Updated: GET all vehicles (with tenant isolation)
router.get("/", auth, async (req, res) => {
  try {
    // Only return vehicles for the current admin's company
    const vehicles = await Vehicle.find({ companyId: req.user.companyId });
    res.json(vehicles);
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

// GET vehicle by license plate
router.get("/license/:licensePlate", async (req, res) => {
  const { licensePlate } = req.params;

  if (!licensePlate) {
    return res.status(400).json({ message: "License plate is required" });
  }

  try {
    console.log("License plate query:", licensePlate.trim().toUpperCase());
    const vehicle = await Vehicle.findOne({
      licensePlate: licensePlate.trim().toUpperCase(),
    });

    if (!vehicle) {
      console.log("License plate not found:", licensePlate);
      return res.status(404).json({
        message: "Vehicle not found",
        exists: false,
      });
    }

    console.log(
      "License plate found:",
      licensePlate,
      "- Vehicle ID:",
      vehicle._id
    );
    res.json({
      exists: true,
      vehicle: {
        _id: vehicle._id,
        licensePlate: vehicle.licensePlate,
        vehicleName: vehicle.vehicleName,
        vehicleType: vehicle.vehicleType,
        status: vehicle.status,
        trackingEnabled: vehicle.trackingEnabled,
        assignedDriver: vehicle.assignedDriver,
      },
    });
  } catch (err) {
    console.error("Error finding vehicle by license plate:", err);
    res.status(500).json({ message: err.message });
  }
});

// Updated: POST a new vehicle (with tenant isolation)
router.post(
  "/",
  [
    body("vehicleName").notEmpty().withMessage("Vehicle name is required"),
    body("licensePlate")
      .notEmpty()
      .withMessage("License plate is required")
      .custom(async (value) => {
        const vehicle = await Vehicle.findOne({
          licensePlate: value.trim().toUpperCase(),
        });
        if (vehicle) {
          throw new Error("License plate already exists");
        }
        return true;
      }),
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
    body("status").optional().isIn(["active", "inactive", "maintenance"]),
    body("driver").optional().isString(),
    body("lastLocation").optional().isString(),
    body("lastUpdated").optional().isISO8601(),
    body("companyId").optional(), // Make optional in validation since we'll set it from auth
  ],
  auth,
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
      driver,
      lastUpdated,
    } = req.body;

    try {
      const newVehicle = new Vehicle({
        vehicleName,
        licensePlate: licensePlate.trim().toUpperCase(),
        vehicleType,
        make,
        model,
        year,
        color,
        deviceId,
        trackingEnabled,
        status: status || "active",
        lastLocation: lastLocation || "Not tracked yet",
        driver: driver || "",
        lastUpdated: lastUpdated || Date.now(),
        companyId: req.user.companyId, // Set companyId from authenticated user
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
    body("licensePlate")
      .notEmpty()
      .withMessage("License plate is required")
      .custom(async (value, { req }) => {
        const vehicle = await Vehicle.findOne({
          licensePlate: value.trim().toUpperCase(),
          _id: { $ne: req.params.id },
        });
        if (vehicle) {
          throw new Error("License plate already exists");
        }
        return true;
      }),
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
    body("status").optional().isIn(["active", "inactive", "maintenance"]),
    body("driver").optional().isString(),
    body("lastLocation").optional().isString(),
    body("lastUpdated").optional().isISO8601(),
  ],
  auth,
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

      // Check if the vehicle belongs to the user's company
      if (vehicle.companyId.toString() !== req.user.companyId) {
        return res.status(403).json({ message: "Access denied" });
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
        driver,
        lastUpdated,
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
      vehicle.driver = driver || vehicle.driver;
      vehicle.lastUpdated = lastUpdated || Date.now();

      const updatedVehicle = await vehicle.save();
      res.json(updatedVehicle);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// DELETE a vehicle by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Check if the vehicle belongs to the user's company
    if (vehicle.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
