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
        licensePlate: req.body.licensePlate,
        driverId: req.body.driverId,
        status: req.body.status || "Pending",
      });

      const savedTask = await newTask.save();
      res.status(201).json(savedTask);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// PUT update a task
router.put(
  "/:id",
  [
    body("cargoType").notEmpty().withMessage("Cargo type is required"),
    body("weight").isNumeric().withMessage("Weight must be a number"),
    body("pickup").notEmpty().withMessage("Pickup location is required"),
    body("delivery").notEmpty().withMessage("Delivery location is required"),
    body("deliveryPhone").notEmpty().withMessage("Delivery phone is required"),
    body("expectedDelivery")
      .notEmpty()
      .withMessage("Expected delivery date is required"),
    body("status")
      .isIn(["Pending", "In Progress", "Completed", "Cancelled"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      task.cargoType = req.body.cargoType;
      task.weight = req.body.weight;
      task.pickup = req.body.pickup;
      task.delivery = req.body.delivery;
      task.deliveryPhone = req.body.deliveryPhone;
      task.expectedDelivery = new Date(req.body.expectedDelivery);
      task.additionalNotes = req.body.additionalNotes || task.additionalNotes;
      task.status = req.body.status;

      const updatedTask = await task.save();
      res.json(updatedTask);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// DELETE a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
