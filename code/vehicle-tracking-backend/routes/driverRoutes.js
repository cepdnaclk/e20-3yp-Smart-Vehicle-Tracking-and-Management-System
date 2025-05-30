const express = require("express");
const { body, validationResult } = require("express-validator");
const Driver = require("../models/Driver");
const Task = require("../models/Task");
const auth = require("../middleware/auth"); // Assuming you have an auth middleware
const router = express.Router();

// Updated: GET all drivers (with tenant isolation)
router.get("/", auth, async (req, res) => {
  try {
    console.log("GET /api/drivers - User Context:", req.user);
    
    // If it's a mobile user, only return their own driver record
    if (req.user.userType === 'mobile') {
      const driver = await Driver.findOne({ 
        driverId: req.user.driverId,
        companyId: req.user.companyId 
      });
      
      if (!driver) {
        return res.status(404).json({ 
          success: false,
          message: "Driver not found" 
        });
      }
      
      return res.json([driver]);
    }
    
    // For admin users, return all drivers for their company
    const drivers = await Driver.find({ companyId: req.user.companyId });
    res.json(drivers);
  } catch (err) {
    console.error("Error fetching drivers:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

// GET driver by driverId - Updated with tenant isolation
router.get("/:id", auth, async (req, res) => {
  try {
    console.log(`GET /api/drivers/${req.params.id} called`);
    // Make sure to filter by companyId for proper tenant isolation
    const driver = await Driver.findOne({
      driverId: req.params.id,
      companyId: req.user.companyId,
    });

    if (!driver) {
      console.warn(`Driver not found for ID: ${req.params.id} (GET request)`);
      return res.status(404).json({ message: "Driver not found" });
    }

    console.log(`Successfully fetched driver ${driver.driverId}:`, driver);
    res.json(driver);
  } catch (err) {
    console.error(`Error fetching driver ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

// Updated: POST a new driver (with tenant isolation)
router.post(
  "/",
  auth, // First run the auth middleware to ensure req.user is available
  [
    body("driverId")
      .notEmpty()
      .withMessage("Driver ID is required")
      .matches(/^DR\d{3}$/)
      .withMessage("Driver ID must be DR followed by 3 digits (e.g., DR001)"),
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
      // Get the company ID from the authenticated user
      const companyId = req.user.companyId;
      console.log("Creating new driver with company ID:", companyId);

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

      // First check if driver ID exists within this company
      const existingDriver = await Driver.findOne({
        driverId: driverId.trim(),
        companyId: companyId,
      });

      if (existingDriver) {
        return res
          .status(400)
          .json({
            message: `Driver ID ${driverId} already exists in your company`,
          });
      }

      const newDriver = new Driver({
        driverId: driverId.trim(),
        fullName,
        email,
        phone,
        licenseNumber,
        joinDate: joinDate ? new Date(joinDate) : undefined,
        employmentStatus: employmentStatus || "active",
        lastLocation: lastLocation || "",
        companyId: companyId, // Set companyId from authenticated user
      });

      console.log("Saving new driver:", {
        ...newDriver.toObject(),
        companyId: companyId,
      });

      const savedDriver = await newDriver.save();
      console.log("Driver saved successfully with ID:", savedDriver._id);

      res.status(201).json(savedDriver);
    } catch (err) {
      console.error("Error creating driver:", err);

      // Better error handling for duplicate key errors
      if (err.code === 11000 && err.keyPattern && err.keyPattern.driverId) {
        return res
          .status(400)
          .json({
            message: `Driver ID ${req.body.driverId} already exists in your company`,
          });
      }

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
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors in PUT /api/drivers/:id:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log(`PUT /api/drivers/${req.params.id} called with body:`, req.body);
      const driver = await Driver.findOne({ driverId: req.params.id });
      if (!driver) {
        console.warn(`Driver not found for ID: ${req.params.id}`);
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
        assignedVehicle
      } = req.body;

      driver.fullName = fullName;
      driver.email = email;
      driver.phone = phone;
      driver.licenseNumber = licenseNumber;
      driver.joinDate = joinDate ? new Date(joinDate) : driver.joinDate;
      driver.employmentStatus = employmentStatus || driver.employmentStatus;
      driver.lastLocation = lastLocation || driver.lastLocation;
      // Update assignedVehicle if provided in the request body
      if (req.body.assignedVehicle !== undefined) {
        driver.assignedVehicle = req.body.assignedVehicle;
        console.log(`Updating assignedVehicle for driver ${driver.driverId} to: ${driver.assignedVehicle}`);
      }

      const updatedDriver = await driver.save();
      console.log(`Driver ${updatedDriver.driverId} updated successfully.`);
      res.json(updatedDriver);
    } catch (err) {
      console.error(`Error updating driver ${req.params.id}:`, err);
      res.status(400).json({ message: err.message });
    }
  }
);

// DELETE driver by ID
router.delete("/:id", auth, async (req, res) => {
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
  auth, // Add auth middleware to get companyId
  async (req, res) => {
    try {
      // Check if driver exists
      const driver = await Driver.findOne({
        driverId: req.params.id,
        companyId: req.user.companyId, // Ensure driver belongs to admin's company
      });

      if (!driver) {
        return res
          .status(404)
          .json({ message: "Driver not found or not authorized" });
      }

      // Check if this task number already exists for this specific company (not just driver)
      const existingTask = await Task.findOne({
        taskNumber: req.body.taskNumber,
        companyId: req.user.companyId,
      });

      if (existingTask) {
        return res.status(400).json({
          message: `Task number ${req.body.taskNumber} already exists for this company`,
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
        companyId: req.user.companyId, // Add the companyId from authenticated user
      });

      console.log("Creating new task with data:", {
        ...newTask.toObject(),
        companyId: req.user.companyId,
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

// POST task assignment to driver - fix this duplicate route
router.post(
  "/:driverId/tasks",
  auth, // Add auth middleware to get companyId
  async (req, res) => {
    try {
      const driverId = req.params.driverId;

      // Verify driver exists and belongs to admin's company
      const driver = await Driver.findOne({
        driverId,
        companyId: req.user.companyId,
      });

      if (!driver) {
        return res
          .status(404)
          .json({ message: "Driver not found or not authorized" });
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
        driverId: driverId,
        licensePlate: req.body.licensePlate || "Not assigned",
        status: "Pending",
        companyId: req.user.companyId, // Add the companyId from authenticated user
      });

      console.log("Creating new task with data:", {
        ...newTask.toObject(),
        companyId: req.user.companyId,
      });

      const savedTask = await newTask.save();

      // Emit socket event if socketServer is available
      if (req.socketServer) {
        console.log(
          "Emitting task:assigned event for new task:",
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
      console.error("Error assigning task:", err);
      res.status(400).json({
        message: err.message || "Failed to assign task",
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
