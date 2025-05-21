const express = require("express");
const { body, validationResult } = require("express-validator");
const { Driver } = require("../models/Driver");
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

// DELETE a driver
router.delete("/:id", async (req, res) => {
  try {
    const driver = await Driver.findOneAndDelete({ driverId: req.params.id });
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    res.json({ message: "Driver deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Catch-all for missing/incorrect endpoints
router.use((req, res) => {
  res.status(404).json({ message: "Driver endpoint not found" });
});

module.exports = router;
