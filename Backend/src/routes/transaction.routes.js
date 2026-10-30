const { Router } = require("express");
const {
  authMiddleware,
  authSystemUserMiddleware,
} = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const transactionRoutes = Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */
transactionRoutes.post(
  "/",
  authMiddleware,
  transactionController.createTransaction,
);

/**
 * - POST /api/transactions/request-otp
 * - Request OTP for high-value transactions
 */
transactionRoutes.post(
  "/request-otp",
  authMiddleware,
  transactionController.requestTransferOtp,
);

/**
 * - GET /api/transactions/:transactionId
 * - Fetch a single transaction details by ID
 */
transactionRoutes.get(
  "/:transactionId",
  authMiddleware,
  transactionController.getTransactionById,
);

/**
 * - POST /api/transactions/counter/cash-in
 * - Log physical cash deposit to counter drawer (Bank Manager only)
 */
transactionRoutes.post(
  "/counter/cash-in",
  authSystemUserMiddleware,
  transactionController.counterCashIn,
);

/**
 * - POST /api/transactions/counter/cash-out
 * - Log physical cash payout from counter drawer (Bank Manager only)
 */
transactionRoutes.post(
  "/counter/cash-out",
  authSystemUserMiddleware,
  transactionController.counterCashOut,
);

module.exports = transactionRoutes;
