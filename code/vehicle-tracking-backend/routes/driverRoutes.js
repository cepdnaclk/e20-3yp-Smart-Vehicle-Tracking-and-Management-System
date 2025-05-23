const express = require("express");
const { body, validationResult } = require("express-validator");
const { Driver, Task } = require("../models/Driver"); // Import Task from Driver model instead of separate file
const router = express.Router();

// GET all drivers
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET driver by driverId
router.get("/:id", async (req, res) => {
  try {
    const driver = await Driver.findOne({ driverId: req.params.id });
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new driver
router.post(
  "/",
  [
    body("driverId")
      .notEmpty()
      .withMessage("Driver ID is required")
      .matches(/^DR\d{3}$/)
      .withMessage("Driver ID must be DR followed by 3 digits (e.g., DR001)")
      .custom(async (value) => {
        const driver = await Driver.findOne({ driverId: value.trim() });
        if (driver) {
          throw new Error("Driver ID already exists");
        }
        return true;
      }),
    body("fullName").notEmpty().withMessage("Full Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("licenseNumber").notEmpty().withMessage("License number is required"),
    body("joinDate")
      .notEmpty()
      .withMessage("Join date is required")
      .isISO8601()
      .withMessage("Join date must be a valid date"),
    body("employmentStatus")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Invalid employment status"),
    body("lastLocation").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        driverId,
        fullName,
        email,
        phone,
        licenseNumber,
        joinDate,
        employmentStatus,
        lastLocation,
      } = req.body;

      const newDriver = new Driver({
        driverId: driverId.trim(),
        fullName,
        email,
        phone,
        licenseNumber,
        joinDate: joinDate ? new Date(joinDate) : undefined,
        employmentStatus: employmentStatus || "active",
        lastLocation: lastLocation || "",
      });

      const savedDriver = await newDriver.save();
      res.status(201).json(savedDriver);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// PUT update a driver
router.put(
  "/:id",
  [
    body("fullName").notEmpty().withMessage("Full Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("licenseNumber").notEmpty().withMessage("License number is required"),
    body("joinDate")
      .notEmpty()
      .withMessage("Join date is required")
      .isISO8601()
      .withMessage("Join date must be a valid date"),
    body("employmentStatus")
      .optional()
      .isIn(["active", "inactive"])
      .withMessage("Invalid employment status"),
    body("lastLocation").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const driver = await Driver.findOne({ driverId: req.params.id });
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      const {
        fullName,
        email,
        phone,
        licenseNumber,
        joinDate,
        employmentStatus,
        lastLocation,
      } = req.body;

      driver.fullName = fullName;
      driver.email = email;
      driver.phone = phone;
      driver.licenseNumber = licenseNumber;
      driver.joinDate = joinDate ? new Date(joinDate) : driver.joinDate;
      driver.employmentStatus = employmentStatus || driver.employmentStatus;
      driver.lastLocation = lastLocation || driver.lastLocation;

      const updatedDriver = await driver.save();
      res.json(updatedDriver);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// DELETE driver by ID
router.delete("/:id", async (req, res) => {
  try {
    const driver = await Driver.findOne({ driverId: req.params.id });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Update tasks to set driverId to null instead of deleting them
    await Task.updateMany(
      { driverId: req.params.id },
      { $set: { driverId: null } }
    );

    await Driver.deleteOne({ driverId: req.params.id });
    res.json({ message: "Driver deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET tasks for a specific driver
router.get("/:id/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({ driverId: req.params.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new task for a specific driver
router.post(
  "/:id/tasks",
  [
    body("taskNumber").notEmpty().withMessage("Task number is required"),
    body("cargoType").notEmpty().withMessage("Cargo type is required"),
    body("weight").isNumeric().withMessage("Weight must be a number"),
    body("pickup").notEmpty().withMessage("Pickup location is required"),
    body("delivery").notEmpty().withMessage("Delivery location is required"),
    body("deliveryPhone").notEmpty().withMessage("Delivery phone is required"),
    body("expectedDelivery")
      .notEmpty()
      .withMessage("Expected delivery date is required")
      .isISO8601()
      .withMessage("Expected delivery must be a valid date"),
    body("licensePlate").notEmpty().withMessage("License plate is required"),
  ],
  async (req, res) => {
    try {
      // Check if driver exists
      const driver = await Driver.findOne({ driverId: req.params.id });
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      // Check if this task number already exists for this specific driver
      const existingTask = await Task.findOne({
        driverId: req.params.id,
        taskNumber: req.body.taskNumber,
      });

      if (existingTask) {
        return res.status(400).json({
          message: `Task number ${req.body.taskNumber} already exists for driver ${req.params.id}`,
        });
      }

      const newTask = new Task({
        taskNumber: req.body.taskNumber,
        cargoType: req.body.cargoType,
        weight: req.body.weight,
        pickup: req.body.pickup,
        delivery: req.body.delivery,
        deliveryPhone: req.body.deliveryPhone,
        expectedDelivery: new Date(req.body.expectedDelivery),
        additionalNotes: req.body.additionalNotes || "",
        licensePlate: req.body.licensePlate,
        driverId: req.params.id,
        status: "Pending",
      });

      const savedTask = await newTask.save();

      // Emit socket event if socketServer is available
      if (req.socketServer) {
        console.log(
          "Emitting task:assigned event from driver route for task:",
          savedTask.taskNumber
        );
        req.socketServer.emitTaskAssigned(savedTask);
      } else {
        console.warn(
          "Socket server not available, couldn't emit task:assigned event"
        );
      }

      res.status(201).json(savedTask);
    } catch (err) {
      console.error("Error creating task:", err);
      res.status(400).json({
        message: err.message || "Failed to create task",
        details: err.toString(),
      });
    }
  }
);

// Catch-all for missing/incorrect endpoints
router.use((req, res) => {
  res.status(404).json({ message: "Driver endpoint not found" });
});

module.exports = router;
