const mongoose = require("mongoose");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const userModel = require("../models/user.model");

async function createAccountController(req, res, next) {
  try {
    const user = req.user;
    const { currency } = req.body;

    const account = await accountModel.create({
      user: user._id,
      currency: currency || "INR",
    });

    return res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (err) {
    return next(err);
  }
}

async function getUserAccountsController(req, res, next) {
  try {
    const accounts = await accountModel.find({ user: req.user._id });

    return res.status(200).json({
      accounts,
    });
  } catch (err) {
    return next(err);
  }
}

async function getAccountBalanceController(req, res, next) {
  try {
    const { accountId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({
        message: "Invalid account ID format",
      });
    }

    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const balance = await account.getBalance();

    return res.status(200).json({
      accountId: account._id,
      currency: account.currency,
      status: account.status,
      balance,
    });
  } catch (err) {
    return next(err);
  }
}

async function getAccountStatementController(req, res, next) {
  try {
    const { accountId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({
        message: "Invalid account ID format",
      });
    }

    const account = await accountModel.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const [entries, totalEntries] = await Promise.all([
      ledgerModel
        .find({ account: accountId })
        .populate("transaction", "status idempotencyKey createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ledgerModel.countDocuments({ account: accountId }),
    ]);

    const currentBalance = await account.getBalance();

    return res.status(200).json({
      accountId: account._id,
      currency: account.currency,
      currentBalance,
      pagination: {
        page,
        limit,
        totalEntries,
        totalPages: Math.ceil(totalEntries / limit),
      },
      statement: entries,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Get all accounts across users with computed balances (Manager only)
 * GET /api/accounts/all
 */
async function getAllAccountsController(req, res, next) {
  try {
    const accounts = await accountModel
      .find({})
      .populate("user", "name email systemUser")
      .sort({ createdAt: -1 });

    const accountsWithBalances = await Promise.all(
      accounts.map(async (acc) => {
        const balance = await acc.getBalance();
        return {
          _id: acc._id,
          user: acc.user,
          status: acc.status,
          currency: acc.currency,
          createdAt: acc.createdAt || acc.timestamp,
          balance,
        };
      })
    );

    return res.status(200).json({
      accounts: accountsWithBalances,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Update account status (active/frozen) (Manager only)
 * PATCH /api/accounts/:accountId/status
 */
async function updateAccountStatusController(req, res, next) {
  try {
    const { accountId } = req.params;
    const { status } = req.body;

    if (!["active", "frozen"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either 'active' or 'frozen'",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({
        message: "Invalid account ID format",
      });
    }

    const account = await accountModel
      .findByIdAndUpdate(accountId, { status }, { new: true })
      .populate("user", "name email");

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    return res.status(200).json({
      message: `Account status successfully updated to ${status}`,
      account,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Lookup recipient by Email or Account ID
 * Returns recipient details and all active accounts they own
 * GET /api/accounts/lookup?query=...
 */
async function lookupPayeeController(req, res, next) {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        found: false,
        message: "Please enter an email or account ID to lookup",
      });
    }

    const trimmed = query.trim();

    // 1. If valid ObjectId, lookup by Account ID
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      const targetAccount = await accountModel
        .findById(trimmed)
        .populate("user", "name email");

      if (targetAccount && targetAccount.status === "active") {
        const userAccounts = await accountModel.find({
          user: targetAccount.user._id,
          status: "active",
        });

        return res.status(200).json({
          found: true,
          recipient: {
            _id: targetAccount.user._id,
            name: targetAccount.user.name,
            email: targetAccount.user.email,
          },
          selectedAccountId: targetAccount._id,
          accounts: userAccounts.map((acc, idx) => ({
            _id: acc._id,
            currency: acc.currency,
            status: acc.status,
            label: `Account #${idx + 1} (${acc.currency || "INR"})`,
            isPrimary: String(acc._id) === String(targetAccount._id),
          })),
        });
      }
    }

    // 2. Search by User Email
    const targetUser = await userModel.findOne({
      email: trimmed.toLowerCase(),
    });

    if (targetUser) {
      const userAccounts = await accountModel.find({
        user: targetUser._id,
        status: "active",
      });

      if (userAccounts.length === 0) {
        return res.status(404).json({
          found: false,
          message: "Recipient registered but has no active bank accounts",
        });
      }

      return res.status(200).json({
        found: true,
        recipient: {
          _id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
        },
        selectedAccountId: userAccounts[0]._id,
        accounts: userAccounts.map((acc, idx) => ({
          _id: acc._id,
          currency: acc.currency,
          status: acc.status,
          label: `Account #${idx + 1} (${acc.currency || "INR"})`,
          isPrimary: idx === 0,
        })),
      });
    }

    return res.status(404).json({
      found: false,
      message: "No verified account or recipient found",
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Get recent payees the logged in user sent money to
 * GET /api/accounts/recent-payees
 */
async function getRecentPayeesController(req, res, next) {
  try {
    const myAccounts = await accountModel.find({ user: req.user._id });
    const myAccountIds = myAccounts.map((a) => a._id);

    const recentDebits = await ledgerModel
      .find({ account: { $in: myAccountIds }, type: "debit" })
      .populate({
        path: "transaction",
        populate: {
          path: "toAccount",
          populate: { path: "user", select: "name email" },
        },
      })
      .sort({ createdAt: -1 })
      .limit(30);

    const payeesMap = new Map();
    for (const entry of recentDebits) {
      const tx = entry.transaction;
      if (!tx || !tx.toAccount || !tx.toAccount.user) continue;

      // Skip transfers to own other accounts
      if (String(tx.toAccount.user._id) === String(req.user._id)) continue;

      const email = tx.toAccount.user.email;
      if (!payeesMap.has(email)) {
        payeesMap.set(email, {
          name: tx.toAccount.user.name,
          email,
          accountId: tx.toAccount._id,
          lastDate: entry.createdAt,
        });
      }
      if (payeesMap.size >= 6) break;
    }

    return res.status(200).json({
      payees: Array.from(payeesMap.values()),
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
  getAccountStatementController,
  getAllAccountsController,
  updateAccountStatusController,
  lookupPayeeController,
  getRecentPayeesController,
};
