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
        vehicleId,
        lastLocation,
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
        vehicleId,
        lastLocation,
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
        vehicleId,
        lastLocation,
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
      driver.vehicleId = vehicleId || driver.vehicleId;
      driver.lastLocation = lastLocation || driver.lastLocation;
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

router.get("/:driverId/tasks/report", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId).populate("tasks");
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const dateRange = parseInt(req.query.dateRange) || 7;
    const statuses = req.query.statuses ? req.query.statuses.split(",") : null;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - dateRange);

    let filteredTasks = driver.tasks.filter((task) => {
      const taskDate = new Date(task.expectedDelivery);
      return taskDate >= startDate && taskDate <= endDate;
    });

    if (statuses) {
      filteredTasks = filteredTasks.filter((task) =>
        statuses.includes(task.status)
      );
    }

    const tasks = filteredTasks.map((task) => ({
      _id: task._id,
      cargoType: task.cargoType,
      pickup: task.pickup,
      delivery: task.delivery,
      expectedDelivery: task.expectedDelivery,
      status: task.status,
    }));

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/:driverId/tasks", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const { cargoType, weight, pickup, delivery, expectedDelivery, status } =
      req.body;

    const newTask = new Task({
      cargoType,
      weight: weight ? parseFloat(weight) : undefined,
      pickup,
      delivery,
      expectedDelivery: expectedDelivery
        ? new Date(expectedDelivery)
        : undefined,
      status,
    });

    const savedTask = await newTask.save();
    driver.tasks.push(savedTask._id);
    await driver.save();

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

    const { cargoType, weight, pickup, delivery, expectedDelivery, status } =
      req.body;

    task.cargoType = cargoType || task.cargoType;
    task.weight = weight ? parseFloat(weight) : task.weight;
    task.pickup = pickup || task.pickup;
    task.delivery = delivery || task.delivery;
    task.expectedDelivery = expectedDelivery
      ? new Date(expectedDelivery)
      : task.expectedDelivery;
    task.status = status || task.status;

    const updatedTask = await task.save();
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

module.exports = router;
