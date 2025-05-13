const express = require("express");
const multer = require("multer");
const { body, query, validationResult } = require("express-validator");
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
        res.status(500).json({ message: err.message });
    }
});

router.post(
    "/",
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    [
        body("firstName").notEmpty().withMessage("First name is required"),
        body("lastName").notEmpty().withMessage("Last name is required"),
        body("dateOfBirth").optional().isDate().withMessage("Invalid date of birth"),
        body("phoneNumber").notEmpty().withMessage("Phone number is required"),
        body("email").isEmail().withMessage("Invalid email address"),
        body("licenseNumber").notEmpty().withMessage("License number is required"),
        body("licenseExpiry").isDate().withMessage("Invalid license expiry date"),
        body("vehicleId").notEmpty().withMessage("Vehicle ID is required"),
        body("lastLocation").optional().isString(),
        body("address").optional().isString(),
        body("city").optional().isString(),
        body("state").optional().isString(),
        body("zipCode").optional().isString(),
        body("employmentStatus")
            .isIn(["active", "onLeave", "suspended", "terminated"])
            .withMessage("Invalid employment status"),
        body("joiningDate").optional().isDate().withMessage("Invalid joining date"),
    ],
    async (req, res) => {
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
            vehicleId,
            lastLocation,
            address,
            city,
            state,
            zipCode,
            employmentStatus,
            joiningDate,
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
                vehicleId,
                lastLocation,
                address,
                city,
                state,
                zipCode,
                employmentStatus,
                joiningDate,
                profileImage: req.files["profileImage"] ? req.files["profileImage"][0].path : null,
            });

            const savedDriver = await newDriver.save();
            res.status(201).json(savedDriver);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
);

router.put(
    "/:id",
    upload.fields([{ name: "profileImage", maxCount: 1 }]),
    [
        body("firstName").notEmpty().withMessage("First name is required"),
        body("lastName").notEmpty().withMessage("Last name is required"),
        body("dateOfBirth").optional().isDate().withMessage("Invalid date of birth"),
        body("phoneNumber").notEmpty().withMessage("Phone number is required"),
        body("email").isEmail().withMessage("Invalid email address"),
        body("licenseNumber").notEmpty().withMessage("License number is required"),
        body("licenseExpiry").isDate().withMessage("Invalid license expiry date"),
        body("vehicleId").notEmpty().withMessage("Vehicle ID is required"),
        body("lastLocation").optional().isString(),
        body("address").optional().isString(),
        body("city").optional().isString(),
        body("state").optional().isString(),
        body("zipCode").optional().isString(),
        body("employmentStatus")
            .isIn(["active", "onLeave", "suspended", "terminated"])
            .withMessage("Invalid employment status"),
        body("joiningDate").optional().isDate().withMessage("Invalid joining date"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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

            driver.firstName = firstName;
            driver.lastName = lastName;
            driver.dateOfBirth = dateOfBirth || driver.dateOfBirth;
            driver.phoneNumber = phoneNumber;
            driver.email = email;
            driver.licenseNumber = licenseNumber;
            driver.licenseExpiry = licenseExpiry;
            driver.vehicleId = vehicleId;
            driver.lastLocation = lastLocation || driver.lastLocation;
            driver.address = address || driver.address;
            driver.city = city || driver.city;
            driver.state = state || driver.state;
            driver.zipCode = zipCode || driver.zipCode;
            driver.employmentStatus = employmentStatus || driver.employmentStatus;
            driver.joiningDate = joiningDate || driver.joiningDate;
            if (req.files["profileImage"]) {
                driver.profileImage = req.files["profileImage"][0].path;
            }

            const updatedDriver = await driver.save();
            res.json(updatedDriver);
        } catch (err) {
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
        res.status(500).json({ message: err.message });
    }
});

router.get("/count", async (req, res) => {
    try {
        const totalDrivers = await Driver.countDocuments();
        res.json({ totalDrivers });
    } catch (err) {
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
        res.status(500).json({ message: err.message });
    }
});

router.get(
    "/:driverId/tasks/report",
    [
        query("dateRange")
            .isInt({ min: 1 })
            .isIn(['1', '7', '30'])
            .withMessage("Date range must be 1, 7, or 30 days"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const driver = await Driver.findById(req.params.driverId).populate("tasks");
            if (!driver) {
                return res.status(404).json({ message: "Driver not found" });
            }

            const dateRange = parseInt(req.query.dateRange);
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - dateRange);

            const filteredTasks = driver.tasks.filter((task) => {
                const taskDate = new Date(task.expectedDelivery);
                return taskDate >= startDate && taskDate <= endDate;
            });

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
            res.status(500).json({ message: err.message });
        }
    }
);

router.post(
    "/:driverId/tasks",
    [
        body("cargoType").notEmpty().withMessage("Cargo type is required"),
        body("weight").isNumeric().withMessage("Weight must be a number"),
        body("pickup").notEmpty().withMessage("Pickup location is required"),
        body("delivery").notEmpty().withMessage("Delivery location is required"),
        body("expectedDelivery").isDate().withMessage("Invalid expected delivery date"),
        body("status").isIn(["Pending", "In Progress", "Completed"]).withMessage("Invalid status"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { cargoType, weight, pickup, delivery, expectedDelivery, status } = req.body;

        try {
            const driver = await Driver.findById(req.params.driverId);
            if (!driver) {
                return res.status(404).json({ message: "Driver not found" });
            }

            const newTask = new Task({
                cargoType,
                weight,
                pickup,
                delivery,
                expectedDelivery,
                status,
            });

            const savedTask = await newTask.save();
            driver.tasks.push(savedTask._id);
            await driver.save();

            res.status(201).json(savedTask);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
);

router.put(
    "/:driverId/tasks/:taskId",
    [
        body("cargoType").notEmpty().withMessage("Cargo type is required"),
        body("weight").isNumeric().withMessage("Weight must be a number"),
        body("pickup").notEmpty().withMessage("Pickup location is required"),
        body("delivery").notEmpty().withMessage("Delivery location is required"),
        body("expectedDelivery").isDate().withMessage("Invalid expected delivery date"),
        body("status").isIn(["Pending", "In Progress", "Completed"]).withMessage("Invalid status"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const task = await Task.findById(req.params.taskId);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }

            const { cargoType, weight, pickup, delivery, expectedDelivery, status } = req.body;

            task.cargoType = cargoType;
            task.weight = weight;
            task.pickup = pickup;
            task.delivery = delivery;
            task.expectedDelivery = expectedDelivery;
            task.status = status;

            const updatedTask = await task.save();
            res.json(updatedTask);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
);

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
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
