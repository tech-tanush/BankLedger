require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");
const connectToDB = require("./src/config/db");

// Verify required runtime environment variables
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET environment variable is missing. Authentication may fail.");
}

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectToDB();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Graceful shutdown
  const handleShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      try {
        await mongoose.connection.close(false);
        console.log("MongoDB connection closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err.message);
        process.exit(1);
      }
    });
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));
}

startServer();
