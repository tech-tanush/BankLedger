const mongoose = require("mongoose");

async function connectToDB() {
  if (!process.env.MONGO_URI) {
    console.error("FATAL: MONGO_URI environment variable is not defined");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || "banking_ledger_system",
    });
    console.log("Connected to MongoDB database successfully");
  } catch (err) {
    console.error("Failed to connect to MongoDB database:", err.message);
    process.exit(1);
  }
}

module.exports = connectToDB;
