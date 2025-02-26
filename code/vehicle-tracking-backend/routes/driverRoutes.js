const express = require("express");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const Driver = require("../models/Driver");
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });

// GET all drivers
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new driver
router.post(
  "/",
  upload.fields([
    { name: "profileImage", maxCount: 1 }, // Handle profile image upload
    { name: "licenseImage", maxCount: 1 }, // Handle license image upload
  ]),
  [
    // Validation rules
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("dateOfBirth").isDate().withMessage("Invalid date of birth"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("licenseNumber").notEmpty().withMessage("License number is required"),
    body("licenseExpiry").isDate().withMessage("Invalid license expiry date"),
    body("address").optional().isString(),
    body("city").optional().isString(),
    body("state").optional().isString(),
    body("zipCode").optional().isString(),
    body("employmentStatus")
      .isIn(["active", "onLeave", "suspended", "terminated"])
      .withMessage("Invalid employment status"),
    body("joiningDate").optional().isDate(),
    body("emergencyContact").optional().isString(),
    body("emergencyPhone").optional().isString(),
    body("driverNotes").optional().isString(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
      emergencyContact,
      emergencyPhone,
      driverNotes,
    } = req.body;

    try {
      const newDriver = new Driver({
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
        emergencyContact,
        emergencyPhone,
        driverNotes,
        profileImage: req.files["profileImage"]
          ? req.files["profileImage"][0].path
          : null, // Save file path
        licenseImage: req.files["licenseImage"]
          ? req.files["licenseImage"][0].path
          : null, // Save file path
      });

      const savedDriver = await newDriver.save();
      res.status(201).json(savedDriver);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// GET total number of drivers
router.get("/count", async (req, res) => {
  try {
    const totalDrivers = await Driver.countDocuments();
    res.json({ totalDrivers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET active drivers
router.get("/", async (req, res) => {
  try {
    let filter = {};
    if (req.query.status === "active") {
      filter = { status: "active" }; // Assuming drivers have a `status` field
    }
    const drivers = await Driver.find(filter);
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
