/**
 * This script fixes collection indexes to support proper tenant isolation
 * Run with: node scripts/fixIndexes.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

async function fixIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      retryWrites: true,
      w: "majority",
    });
    console.log("Connected to MongoDB");

    // Get the Driver collection
    const db = mongoose.connection.db;
    const driverCollection = db.collection("drivers");
    const taskCollection = db.collection("tasks");
    const vehicleCollection = db.collection("vehicles");

    // 1. Fix Driver indexes
    console.log("Fixing Driver indexes...");

    // Get existing indexes
    const driverIndexes = await driverCollection.indexes();
    console.log("Current Driver indexes:", driverIndexes);

    // Drop the old unique index on driverId if it exists
    const driverIdIndex = driverIndexes.find(
      (idx) => idx.key && idx.key.driverId === 1 && idx.unique === true
    );

    if (driverIdIndex) {
      console.log("Dropping old unique driverId index:", driverIdIndex.name);
      await driverCollection.dropIndex(driverIdIndex.name);
      console.log("Old index dropped successfully");
    }

    // Create new compound index
    console.log("Creating new compound index on driverId and companyId...");
    await driverCollection.createIndex(
      { driverId: 1, companyId: 1 },
      { unique: true, background: true }
    );

    // Create index on companyId for queries
    await driverCollection.createIndex({ companyId: 1 }, { background: true });

    // 2. Fix Task indexes
    console.log("Fixing Task indexes...");

    // Get existing indexes
    const taskIndexes = await taskCollection.indexes();
    console.log("Current Task indexes:", taskIndexes);

    // Drop the old unique index on taskNumber if it exists
    const taskNumberIndex = taskIndexes.find(
      (idx) => idx.key && idx.key.taskNumber === 1 && idx.unique === true
    );

    if (taskNumberIndex) {
      console.log(
        "Dropping old unique taskNumber index:",
        taskNumberIndex.name
      );
      await taskCollection.dropIndex(taskNumberIndex.name);
      console.log("Old task index dropped successfully");
    }

    // Create new compound index
    console.log("Creating new compound index on taskNumber and companyId...");
    await taskCollection.createIndex(
      { taskNumber: 1, companyId: 1 },
      { unique: true, background: true }
    );

    // Create index on companyId for queries
    await taskCollection.createIndex({ companyId: 1 }, { background: true });

    // 3. Verify Vehicle indexes
    console.log("Checking Vehicle indexes...");

    // Get existing indexes
    const vehicleIndexes = await vehicleCollection.indexes();
    console.log("Current Vehicle indexes:", vehicleIndexes);

    // Fix licensePlate index if needed
    const licensePlateIndex = vehicleIndexes.find(
      (idx) => idx.key && idx.key.licensePlate === 1 && idx.unique === true
    );

    if (licensePlateIndex) {
      console.log(
        "Dropping old unique licensePlate index:",
        licensePlateIndex.name
      );
      await vehicleCollection.dropIndex(licensePlateIndex.name);

      // Create new compound index for licensePlate and companyId
      console.log(
        "Creating new compound index on licensePlate and companyId..."
      );
      await vehicleCollection.createIndex(
        { licensePlate: 1, companyId: 1 },
        { unique: true, background: true }
      );
    }

    console.log("All indexes fixed successfully!");
    console.log("Verifying final indexes...");

    const finalDriverIndexes = await driverCollection.indexes();
    console.log("Final Driver indexes:", finalDriverIndexes);

    const finalTaskIndexes = await taskCollection.indexes();
    console.log("Final Task indexes:", finalTaskIndexes);

    const finalVehicleIndexes = await vehicleCollection.indexes();
    console.log("Final Vehicle indexes:", finalVehicleIndexes);
  } catch (error) {
    console.error("Error fixing indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

fixIndexes()
  .then(() => console.log("Index fix process completed"))
  .catch((err) => console.error("Error in index fix process:", err));
