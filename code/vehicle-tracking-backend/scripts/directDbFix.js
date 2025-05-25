// This script uses the native MongoDB driver to fix indexes
// Run with: node scripts/directDbFix.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/vehicle-tracking";

async function fixIndexes() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const driverCollection = db.collection("drivers");

    console.log("Getting current indexes...");
    const indexes = await driverCollection.indexes();
    console.log("Current indexes:", indexes);

    // Drop all indexes except _id
    for (const index of indexes) {
      if (index.name !== "_id_") {
        console.log(`Dropping index: ${index.name}`);
        await driverCollection.dropIndex(index.name);
      }
    }

    // Create the correct compound index
    console.log("Creating compound index...");
    await driverCollection.createIndex(
      { driverId: 1, companyId: 1 },
      { unique: true }
    );

    // Create companyId index
    console.log("Creating companyId index...");
    await driverCollection.createIndex({ companyId: 1 });

    // Verify final indexes
    const finalIndexes = await driverCollection.indexes();
    console.log("Final indexes:", finalIndexes);

    console.log("Index fix completed successfully");
  } catch (error) {
    console.error("Error fixing indexes:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

fixIndexes()
  .then(() => console.log("Process completed"))
  .catch((err) => console.error("Error in fix process:", err));
