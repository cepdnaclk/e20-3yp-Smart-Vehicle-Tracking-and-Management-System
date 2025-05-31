const express = require("express");
const { body, validationResult } = require("express-validator");
const Task = require("../models/Task");
const Driver = require("../models/Driver");
const auth = require("../middleware/auth"); // Add auth middleware
const router = express.Router();

// GET all tasks - now with tenant isolation
router.get("/", auth, async (req, res) => {
  try {
    console.log("GET /api/tasks - User Context:", req.user);

    // Filter tasks by companyId for tenant isolation
    const tasks = await Task.find({ companyId: req.user.companyId }).sort({
      createdAt: -1,
    });
    console.log(
      `Found ${tasks.length} tasks for company ${req.user.companyId}`
    );

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET tasks by driver ID - with tenant isolation
router.get("/driver/:driverId", auth, async (req, res) => {
  try {
    // First verify this driver belongs to the admin's company
    const driver = await Driver.findOne({
      driverId: req.params.driverId,
      companyId: req.user.companyId,
    });

    if (!driver) {
      return res
        .status(404)
        .json({ message: "Driver not found or not authorized" });
    }

    // Then fetch tasks for this driver
    const tasks = await Task.find({
      driverId: req.params.driverId,
      companyId: req.user.companyId,
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching driver tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET task by ID - with tenant isolation
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId, // Ensure task belongs to admin's company
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ message: err.message });
  }
});

// Generate next task number (sequential numbering for company)
router.get("/next-number/:driverId", auth, async (req, res) => {
  try {
    // Verify this driver belongs to the admin's company
    const driver = await Driver.findOne({
      driverId: req.params.driverId,
      companyId: req.user.companyId,
    });

    if (!driver) {
      return res
        .status(404)
        .json({ message: "Driver not found or not authorized" });
    }

    // Find the latest task number for this company specifically
    const latestTask = await Task.findOne({ companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .select("taskNumber");

    let nextNumber = "TSK0001";

    if (latestTask && latestTask.taskNumber) {
      // Extract the number part and increment it
      const numberPart = latestTask.taskNumber.substring(3);
      const currentNum = parseInt(numberPart, 10);
      if (!isNaN(currentNum)) {
        const nextNum = currentNum + 1;
        nextNumber = `TSK${nextNum.toString().padStart(4, "0")}`;
      }
    }

    // Check if this task number already exists for this company
    // This is a safety check to avoid conflicts even with the compound index
    const existingTask = await Task.findOne({
      taskNumber: nextNumber,
      companyId: req.user.companyId,
    });

    // If it exists (somehow), increment the number until we find an unused one
    if (existingTask) {
      console.log(
        `Task number ${nextNumber} already exists, generating a new one`
      );
      let num = parseInt(nextNumber.substring(3), 10);
      let isUnique = false;

      // Try up to 100 times to find a unique number
      for (let i = 0; i < 100; i++) {
        num++;
        const candidateNumber = `TSK${num.toString().padStart(4, "0")}`;
        const exists = await Task.findOne({
          taskNumber: candidateNumber,
          companyId: req.user.companyId,
        });

        if (!exists) {
          nextNumber = candidateNumber;
          isUnique = true;
          break;
        }
      }

      if (!isUnique) {
        return res.status(500).json({
          message:
            "Failed to generate a unique task number after multiple attempts",
        });
      }
    }

    console.log(
      `Generated next task number: ${nextNumber} for company ${req.user.companyId}`
    );
    res.json({ nextTaskNumber: nextNumber });
  } catch (err) {
    console.error("Error generating task number:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST a new task (with tenant isolation)
router.post(
  "/",
  auth,
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
    body("driverId").notEmpty().withMessage("Driver ID is required"),
    body("licensePlate").notEmpty().withMessage("License plate is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log("Creating new task with company ID:", req.user.companyId);

      // Get the companyId from the authenticated user
      const companyId = req.user.companyId;

      // Check if driver exists and belongs to the same company
      if (req.body.driverId) {
        const driver = await Driver.findOne({
          driverId: req.body.driverId,
          companyId: companyId,
        });

        if (!driver) {
          return res.status(400).json({
            message: "Driver not found or doesn't belong to your company",
          });
        }

        // If license plate is not provided, get it from the driver's assigned vehicle
        if (!req.body.licensePlate || req.body.licensePlate === 'Not assigned') {
          if (driver.assignedVehicle) {
            req.body.licensePlate = driver.assignedVehicle;
          } else {
            return res.status(400).json({
              message: "Driver has no assigned vehicle. Please assign a vehicle first.",
            });
          }
        }
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
        driverId: req.body.driverId,
        licensePlate: req.body.licensePlate,
        status: req.body.status || "Pending",
        companyId: companyId,
      });

      console.log("Saving new task:", newTask);
      const savedTask = await newTask.save();
      console.log("Task saved successfully with ID:", savedTask._id);

      // Emit socket event if socketServer is available
      if (req.socketServer) {
        console.log("Emitting task:assigned event for new task");
        req.socketServer.emitTaskAssigned(savedTask);
      }

      res.status(201).json(savedTask);
    } catch (err) {
      console.error("Error creating task:", err);
      res.status(400).json({ message: err.message });
    }
  }
);

// PUT (update) a task - with tenant isolation
router.put("/:id", auth, async (req, res) => {
  try {
    // First verify this task belongs to admin's company
    const existingTask = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!existingTask) {
      return res
        .status(404)
        .json({ message: "Task not found or not authorized" });
    }

    // If driverId is changing, verify new driver belongs to admin's company
    if (req.body.driverId && req.body.driverId !== existingTask.driverId) {
      const driver = await Driver.findOne({
        driverId: req.body.driverId,
        companyId: req.user.companyId,
      });

      if (!driver) {
        return res.status(400).json({
          message: "Driver not found or not authorized for this company",
        });
      }
    }

    // Don't allow changing the companyId
    const updateData = { ...req.body };
    delete updateData.companyId; // Prevent changing companyId

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    // Emit socket event if socketServer is available
    if (req.socketServer) {
      console.log("Emitting task:updated event for task:", task.taskNumber);
      req.socketServer.emitTaskUpdated(task);
    } else {
      console.warn(
        "Socket server not available, couldn't emit task:updated event"
      );
    }

    res.json(task);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(400).json({ message: err.message });
  }
});

// PATCH task status only (for mobile app) - with tenant isolation
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    console.log('Updating task status:', { taskId: req.params.id, status });

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // First verify this task belongs to admin's company
    const existingTask = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!existingTask) {
      console.log('Task not found or not authorized:', { taskId: req.params.id, companyId: req.user.companyId });
      return res.status(404).json({ message: "Task not found or not authorized" });
    }

    console.log('Found existing task:', { 
      taskNumber: existingTask.taskNumber,
      currentStatus: existingTask.status,
      newStatus: status 
    });

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    console.log('Task updated successfully:', { 
      taskNumber: task.taskNumber,
      newStatus: task.status 
    });

    // Emit socket event if socketServer is available
    if (req.socketServer) {
      console.log("Emitting task:updated event for status change:", task.taskNumber);
      req.socketServer.emitTaskUpdated(task);
    } else {
      console.warn("Socket server not available, couldn't emit task:updated event");
    }

    res.json(task);
  } catch (err) {
    console.error("Error updating task status:", err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE a task - with tenant isolation
router.delete("/:id", auth, async (req, res) => {
  try {
    // First verify this task belongs to admin's company
    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
    });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or not authorized" });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Emit socket event if socketServer is available
    if (req.socketServer) {
      console.log("Emitting task:deleted event for task:", task.taskNumber);
      req.socketServer.emitTaskDeleted(task);
    } else {
      console.warn(
        "Socket server not available, couldn't emit task:deleted event"
      );
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET tasks by vehicle license plate - with tenant isolation
router.get("/vehicle/:licensePlate", auth, async (req, res) => {
  try {
    // Find tasks for this vehicle that belong to the admin's company
    const tasks = await Task.find({
      licensePlate: req.params.licensePlate,
      companyId: req.user.companyId,
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching vehicle tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
