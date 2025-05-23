const express = require("express");
const { body, validationResult } = require("express-validator");
const { Task, Driver, DriverTaskCounter } = require("../models/Driver");
const router = express.Router();

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET tasks by driver ID
router.get("/driver/:driverId", async (req, res) => {
  try {
    const tasks = await Task.find({ driverId: req.params.driverId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate next task number (simple sequential numbering for all drivers)
router.get("/next-number/:driverId", async (req, res) => {
  try {
    // Find the latest task number regardless of driver
    const latestTask = await Task.findOne()
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

    res.json({ nextTaskNumber: nextNumber });
  } catch (err) {
    console.error("Error generating task number:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST a new task
router.post(
  "/",
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
        status: "Pending",
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
      console.error("Error creating task:", err);
      res.status(400).json({ message: err.message });
    }
  }
);

// PUT (update) a task
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

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
    res.status(400).json({ message: err.message });
  }
});

// DELETE a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
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
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
