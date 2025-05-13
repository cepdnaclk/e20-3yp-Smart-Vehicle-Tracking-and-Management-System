const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/vehicle-tracking";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
const vehicleRoutes = require("./routes/vehicleRoutes");
const driverRoutes = require("./routes/driverRoutes");
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Vehicle Tracking Backend");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
