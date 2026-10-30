const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

const app = express();

// Global Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
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
