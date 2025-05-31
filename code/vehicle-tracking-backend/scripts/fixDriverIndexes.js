require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

async function fixDriverIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const driverCollection = db.collection("drivers");

    // List all indexes
    console.log("Current indexes:");
    const indexes = await driverCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Find and drop the problematic index
    const driverIdIndex = indexes.find(
      (idx) => idx.key && idx.key.driverId === 1 && idx.unique === true
    );

    if (driverIdIndex) {
      console.log(`Found problematic index: ${driverIdIndex.name}`);
      console.log("Dropping the driverId unique index...");
      await driverCollection.dropIndex(driverIdIndex.name);
      console.log("Index dropped successfully");
    } else {
      console.log("No problematic driverId unique index found");
    }

    // Create the compound index
    console.log("Creating compound index on driverId and companyId...");
    await driverCollection.createIndex(
      { driverId: 1, companyId: 1 },
      { unique: true, background: true }
    );
    console.log("Compound index created successfully");

    // Create index on companyId for better query performance
    console.log("Creating index on companyId...");
    await driverCollection.createIndex({ companyId: 1 }, { background: true });
    console.log("CompanyId index created successfully");

    // Verify the indexes
    console.log("Final indexes:");
    const finalIndexes = await driverCollection.indexes();
    console.log(JSON.stringify(finalIndexes, null, 2));
  } catch (error) {
    console.error("Error fixing indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

fixDriverIndexes()
  .then(() => console.log("Driver index fix completed"))
  .catch((err) => console.error("Error in driver index fix process:", err));
