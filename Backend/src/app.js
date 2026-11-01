const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

const app = express();

// Global Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== "*") {
  process.env.CORS_ORIGIN.split(",").forEach((item) => {
    const trimmed = item.trim().replace(/\/$/, "");
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (mobile, server-to-server, curl)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");

      if (
        !process.env.CORS_ORIGIN ||
        process.env.CORS_ORIGIN === "*" ||
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
app.use(express.json());
app.use(cookieParser());

// Base Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Banking Ledger Service is up and running",
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRoutes);

// Catch-all 404 Handler
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
