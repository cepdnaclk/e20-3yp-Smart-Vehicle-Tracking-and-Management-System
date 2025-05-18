const express = require("express");
const multer = require("multer");
const { Driver, Task } = require("../models/Driver");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    console.error("Error fetching drivers:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const totalDrivers = await Driver.countDocuments();
    res.json({ totalDrivers });
  } catch (err) {
    console.error("Error counting drivers:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/count/active", async (req, res) => {
  try {
    const activeDriversCount = await Driver.countDocuments({
      employmentStatus: "active",
    });
    res.json({ activeDriversCount });
  } catch (err) {
    console.error("Error counting active drivers:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/",
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        email,
        licenseNumber,
        licenseExpiry,
        address,
        city,
        state,
        zipCode,
        employmentStatus,
        joiningDate,
      } = req.body;

      const newDriver = new Driver({
        firstName,
        lastName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        phoneNumber,
        email,
        licenseNumber,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        address,
        city,
        state,
        zipCode,
        employmentStatus,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        profileImage: req.files["profileImage"]
          ? req.files["profileImage"][0].path
          : null,
      });

      const savedDriver = await newDriver.save();
      res.status(201).json(savedDriver);
    } catch (err) {
      console.error("Error creating driver:", err);
      res.status(400).json({ message: err.message });
    }
  }
);

router.put(
  "/:id",
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  async (req, res) => {
    try {
      const driver = await Driver.findById(req.params.id);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }

      const {
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        email,
        licenseNumber,
        licenseExpiry,
        vehicleNumber,
        address,
        city,
        state,
        zipCode,
        employmentStatus,
        joiningDate,
      } = req.body;

      driver.firstName = firstName || driver.firstName;
      driver.lastName = lastName || driver.lastName;
      driver.dateOfBirth = dateOfBirth
        ? new Date(dateOfBirth)
        : driver.dateOfBirth;
      driver.phoneNumber = phoneNumber || driver.phoneNumber;
      driver.email = email || driver.email;
      driver.licenseNumber = licenseNumber || driver.licenseNumber;
      driver.licenseExpiry = licenseExpiry
        ? new Date(licenseExpiry)
        : driver.licenseExpiry;
      driver.vehicleNumber = vehicleNumber || driver.vehicleNumber;
      driver.address = address || driver.address;
      driver.city = city || driver.city;
      driver.state = state || driver.state;
      driver.zipCode = zipCode || driver.zipCode;
      driver.employmentStatus = employmentStatus || driver.employmentStatus;
      driver.joiningDate = joiningDate
        ? new Date(joiningDate)
        : driver.joiningDate;
      if (req.files["profileImage"]) {
        driver.profileImage = req.files["profileImage"][0].path;
      }

      const updatedDriver = await driver.save();
      res.json(updatedDriver);
    } catch (err) {
      console.error("Error updating driver:", err);
      res.status(400).json({ message: err.message });
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    await Task.deleteMany({ _id: { $in: driver.tasks } });
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: "Driver and associated tasks deleted successfully" });
  } catch (err) {
    console.error("Error deleting driver:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/:driverId/tasks", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId).populate("tasks");
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json(driver.tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/:driverId/tasks/:taskId", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId).populate("tasks");
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const task = driver.tasks.find(
      (task) => task._id.toString() === req.params.taskId
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/:driverId/tasks", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const { cargoType, weight, pickup, delivery, expectedDelivery, vehicle } =
      req.body;

    const newTask = new Task({
      cargoType,
      weight: weight ? parseFloat(weight) : undefined,
      pickup,
      delivery,
      expectedDelivery: expectedDelivery
        ? new Date(expectedDelivery)
        : undefined,
      vehicle,
      status: "Pending",
    });

    const savedTask = await newTask.save();
    driver.tasks.push(savedTask._id);
    await driver.save();

    req.io.emit("taskNotification", {
      driverId: req.params.driverId,
      title: "New Task Assigned",
      message: `A new task (${cargoType}) has been assigned to you for vehicle ${vehicle}.`,
    });

    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(400).json({ message: err.message });
  }
});

router.put("/:driverId/tasks/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { cargoType, weight, pickup, delivery, expectedDelivery, vehicle } =
      req.body;

    task.cargoType = cargoType || task.cargoType;
    task.weight = weight ? parseFloat(weight) : task.weight;
    task.pickup = pickup || task.pickup;
    task.delivery = delivery || task.delivery;
    task.expectedDelivery = expectedDelivery
      ? new Date(expectedDelivery)
      : task.expectedDelivery;
    task.vehicle = vehicle || task.vehicle;

    const updatedTask = await task.save();

    req.io.emit("taskNotification", {
      driverId: req.params.driverId,
      title: "Task Updated",
      message: `Your task (${task.cargoType}) has been updated.`,
    });

    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:driverId/tasks/:taskId", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    driver.tasks = driver.tasks.filter(
      (taskId) => taskId.toString() !== req.params.taskId
    );
    await driver.save();

    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:driverId/tasks/:taskId/start", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId).populate("tasks");
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const activeTask = driver.tasks.find(
      (t) => t.status === "In Progress" && t._id.toString() !== task._id
    );
    if (activeTask) {
      return res
        .status(400)
        .json({ message: "Another task is already in progress." });
    }

    task.status = "In Progress";
    await task.save();

    req.io.emit("taskNotification", {
      driverId: req.params.driverId,
      title: "Task Started",
      message: `Task (${task.cargoType}) has been started.`,
    });

    res.json(task);
  } catch (err) {
    console.error("Error starting task:", err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:driverId/tasks/:taskId/complete", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = "Completed";
    await task.save();

    req.io.emit("taskNotification", {
      driverId: req.params.driverId,
      title: "Task Completed",
      message: `Task (${task.cargoType}) has been completed.`,
    });

    res.json(task);
  } catch (err) {
    console.error("Error completing task:", err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/:driverId/tasks/:taskId/cancel", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = "Cancelled";
    await task.save();

    req.io.emit("taskNotification", {
      driverId: req.params.driverId,
      title: "Task Cancelled",
      message: `Task (${task.cargoType}) has been cancelled.`,
    });

    res.json(task);
  } catch (err) {
    console.error("Error cancelling task:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
