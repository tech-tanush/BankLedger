require("dotenv").config();
const dns = require("dns");
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}
const mongoose = require("mongoose");
const app = require("./src/app");
const connectToDB = require("./src/config/db");

// Startup environment variable diagnostics
console.log("=== BankLedger Startup Diagnostics ===");
console.log("NODE_ENV      :", process.env.NODE_ENV || "(not set)");
console.log("PORT          :", process.env.PORT || "(not set, will use 3000)");
console.log("JWT_SECRET    :", process.env.JWT_SECRET ? `[SET - ${process.env.JWT_SECRET.length} chars]` : "❌ MISSING");
console.log("MONGO_URI     :", process.env.MONGO_URI ? "[SET]" : "❌ MISSING");
console.log("CORS_ORIGIN   :", process.env.CORS_ORIGIN || "(not set)");
console.log("EMAIL_USER    :", process.env.EMAIL_USER || "❌ MISSING");
console.log("EMAIL_PASS    :", process.env.EMAIL_PASS ? `[SET - ${process.env.EMAIL_PASS.replace(/\s+/g, "").length} chars]` : "❌ MISSING");
console.log("======================================");

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
