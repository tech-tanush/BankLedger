const express = require("express");
const {
  authMiddleware,
  authSystemUserMiddleware,
} = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected Route
 */
router.post("/", authMiddleware, accountController.createAccountController);

/**
 * - GET /api/accounts/all
 * - List all accounts across the bank (Bank Manager only)
 */
router.get(
  "/all",
  authSystemUserMiddleware,
  accountController.getAllAccountsController,
);

/**
 * - PATCH /api/accounts/:accountId/status
 * - Freeze or Unfreeze an account (Bank Manager only)
 */
router.patch(
  "/:accountId/status",
  authSystemUserMiddleware,
  accountController.updateAccountStatusController,
);

/**
 * - GET /api/accounts/lookup
 * - Lookup recipient by Email or Account ID
 */
router.get("/lookup", authMiddleware, accountController.lookupPayeeController);

/**
 * - GET /api/accounts/recent-payees
 * - Get recent transfer payees for logged-in user
 */
router.get(
  "/recent-payees",
  authMiddleware,
  accountController.getRecentPayeesController,
);

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected Route
 */
router.get("/", authMiddleware, accountController.getUserAccountsController);

/**
 * - GET /api/accounts/balance/:accountId
 * - Get account balance
 */
router.get(
  "/balance/:accountId",
  authMiddleware,
  accountController.getAccountBalanceController,
);

/**
 * - GET /api/accounts/statement/:accountId
 * - Get paginated account statement / ledger entries
 */
router.get(
  "/statement/:accountId",
  authMiddleware,
  accountController.getAccountStatementController,
);

module.exports = router;
