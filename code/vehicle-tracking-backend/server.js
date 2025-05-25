const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const setupSocketServer = require("./socketServer");
require("dotenv").config();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Set up socket.io
const socketServer = setupSocketServer(server);

// Make socket server available to routes
app.use((req, res, next) => {
  req.socketServer = socketServer;
  next();
});

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, {
    retryWrites: true,
    w: "majority",
  })
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Import routes
const vehicleRoutes = require("./routes/vehicleRoutes");
const driverRoutes = require("./routes/driverRoutes");
const taskRoutes = require("./routes/taskRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Use routes
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes); // Make sure this line is present

app.get("/", (req, res) => {
  res.send("Vehicle Tracking Backend");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server initialized`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });
});
