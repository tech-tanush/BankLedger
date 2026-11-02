const mongoose = require("mongoose");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const otpModel = require("../models/otp.model");
const emailService = require("../services/email.service");

/**
 * Create a new transfer transaction between accounts
 * POST /api/transactions
 */
async function createTransaction(req, res, next) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  // 1. Validate payload
  if (
    !fromAccount ||
    !toAccount ||
    amount == null ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0 ||
    !idempotencyKey
  ) {
    return res.status(400).json({
      message:
        "Valid fromAccount, toAccount, positive amount and idempotencyKey are required",
    });
  }

  if (String(fromAccount) === String(toAccount)) {
    return res.status(400).json({
      message: "Source and destination accounts must be different",
    });
  }

  if (
    !mongoose.Types.ObjectId.isValid(fromAccount) ||
    !mongoose.Types.ObjectId.isValid(toAccount)
  ) {
    return res.status(400).json({
      message: "Invalid account ID format",
    });
  }

  // 2. Check Idempotency before acquiring locks
  const existingTransaction = await transactionModel.findOne({
    idempotencyKey,
  });

  if (existingTransaction) {
    return res.status(200).json({
      message: "Transaction already processed",
      transaction: existingTransaction,
    });
  }

  // 3. Pre-flight checks on accounts
  const fromUserAccount = await accountModel.findById(fromAccount);
  const toUserAccount = await accountModel.findById(toAccount).populate("user", "name email");

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }

  // 4. Verify Account Ownership (Prevent IDOR)
  if (String(fromUserAccount.user) !== String(req.user._id)) {
    return res.status(403).json({
      message: "You do not have permission to transfer funds from this account",
    });
  }

  // 4.1 High-value transfer OTP enforcement (for ₹50,000 and above)
  if (Number(amount) >= 50000) {
    const { otp } = req.body;
    if (!otp) {
      return res.status(403).json({
        message:
          "High-value transfers (₹50,000+) require OTP security verification",
        requiresOtp: true,
      });
    }

    const otpDoc = await otpModel.findOne({
      userId: req.user._id,
      code: String(otp).trim(),
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({
        message:
          "Invalid or expired security OTP code. Please request a new code.",
      });
    }

    // Consume OTP once verified
    await otpDoc.deleteOne();
  }

  if (
    fromUserAccount.status !== "active" ||
    toUserAccount.status !== "active"
  ) {
    return res.status(400).json({
      message: "Both accounts must be active to perform transactions",
    });
  }

  // 5. ACID Transaction Execution with Session
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Lock source account document within the session to prevent concurrent race conditions
    const lockedFromAccount = await accountModel.findOneAndUpdate(
      { _id: fromAccount, status: "active" },
      { $inc: { __v: 1 } },
      { session, returnDocument: "after" },
    );

    if (!lockedFromAccount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Source account is inactive or currently unavailable",
      });
    }

    // Calculate real-time balance inside the transaction session
    const balance = await lockedFromAccount.getBalance({ session });

    if (balance < Number(amount)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Insufficient balance. Current balance is ${balance}`,
      });
    }

    // Create the transaction record
    const [transaction] = await transactionModel.create(
      [
        {
          fromAccount,
          toAccount,
          amount: Number(amount),
          idempotencyKey,
          status: "pending",
        },
      ],
      { session },
    );

    // Create double-entry ledger records
    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: Number(amount),
          transaction: transaction._id,
          type: "debit",
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: Number(amount),
          transaction: transaction._id,
          type: "credit",
        },
      ],
      { session },
    );

    // Mark transaction as completed and commit
    transaction.status = "completed";
    await transaction.save({ session });

    await session.commitTransaction();

    // Dispatch Debit & Credit email alerts and ensure network socket completes before closing HTTP response
    const emailPromises = [];

    if (req.user?.email) {
      emailPromises.push(
        emailService
          .sendTransactionEmail(
            req.user.email,
            req.user.name || "Customer",
            Number(amount),
            toUserAccount?.user?.name || "Recipient",
            toAccount,
            transaction._id,
          )
          .catch((emailErr) => {
            console.error("Sender debit email failed:", emailErr.message);
          }),
      );
    }

    if (toUserAccount?.user?.email) {
      emailPromises.push(
        emailService
          .sendCreditAlertEmail(
            toUserAccount.user.email,
            toUserAccount.user.name || "Customer",
            Number(amount),
            req.user.name || "Sender",
            fromAccount,
            transaction._id,
          )
          .catch((emailErr) => {
            console.error("Receiver credit email failed:", emailErr.message);
          }),
      );
    }

    // Await all email promises to settle so cloud container does not cut off SMTP connection
    if (emailPromises.length > 0) {
      await Promise.allSettled(emailPromises);
    }

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    // Handle duplicate idempotency key on race
    if (error.code === 11000) {
      const existing = await transactionModel.findOne({ idempotencyKey });
      if (existing) {
        return res.status(200).json({
          message: "Transaction already processed",
          transaction: existing,
        });
      }
      return res.status(409).json({
        message: "This idempotency key is currently being processed",
      });
    }

    return next(error);
  } finally {
    await session.endSession();
  }
}

/**
 * Get transaction details by ID
 * GET /api/transactions/:transactionId
 */
async function getTransactionById(req, res, next) {
  try {
    const { transactionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({
        message: "Invalid transaction ID format",
      });
    }

    const transaction = await transactionModel
      .findById(transactionId)
      .populate({
        path: "fromAccount",
        select: "user status currency",
        populate: { path: "user", select: "name email" },
      })
      .populate({
        path: "toAccount",
        select: "user status currency",
        populate: { path: "user", select: "name email" },
      });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    // Verify user owns either fromAccount or toAccount, or is systemUser
    const isFromOwner =
      transaction.fromAccount?.user &&
      String(transaction.fromAccount.user._id || transaction.fromAccount.user) ===
        String(req.user._id);
    const isToOwner =
      transaction.toAccount?.user &&
      String(transaction.toAccount.user._id || transaction.toAccount.user) ===
        String(req.user._id);
    const isSystem = req.user.systemUser === true;

    if (!isFromOwner && !isToOwner && !isSystem) {
      return res.status(403).json({
        message: "You are not authorized to view this transaction",
      });
    }

    return res.status(200).json({
      transaction,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Log physical cash deposit at counter into the Manager's System Account (Cash-In)
 * POST /api/transactions/counter/cash-in
 */
async function counterCashIn(req, res, next) {
  const { amount, idempotencyKey } = req.body;

  if (
    amount == null ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0 ||
    !idempotencyKey
  ) {
    return res.status(400).json({
      message: "Positive amount and idempotencyKey are required",
    });
  }

  const existing = await transactionModel.findOne({ idempotencyKey });
  if (existing) {
    return res.status(200).json({
      message: "Cash-in deposit already logged",
      transaction: existing,
    });
  }

  const systemAccount = await accountModel.findOne({
    user: req.user._id,
    status: "active",
  });

  if (!systemAccount) {
    return res.status(400).json({
      message: "Active System Account not found for this user",
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [transaction] = await transactionModel.create(
      [
        {
          fromAccount: systemAccount._id,
          toAccount: systemAccount._id,
          amount: Number(amount),
          idempotencyKey,
          status: "completed",
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: systemAccount._id,
          amount: Number(amount),
          transaction: transaction._id,
          type: "credit",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    const newBalance = await systemAccount.getBalance();

    return res.status(201).json({
      message: "Cash deposit successfully credited to cash drawer",
      transaction,
      balance: newBalance,
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return next(err);
  } finally {
    await session.endSession();
  }
}

/**
 * Log physical cash payout at counter from the Manager's System Account (Cash-Out)
 * POST /api/transactions/counter/cash-out
 */
async function counterCashOut(req, res, next) {
  const { amount, idempotencyKey } = req.body;

  if (
    amount == null ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0 ||
    !idempotencyKey
  ) {
    return res.status(400).json({
      message: "Positive amount and idempotencyKey are required",
    });
  }

  const existing = await transactionModel.findOne({ idempotencyKey });
  if (existing) {
    return res.status(200).json({
      message: "Cash-out payout already logged",
      transaction: existing,
    });
  }

  const systemAccount = await accountModel.findOne({
    user: req.user._id,
    status: "active",
  });

  if (!systemAccount) {
    return res.status(400).json({
      message: "Active System Account not found for this user",
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const balance = await systemAccount.getBalance({ session });

    if (balance < Number(amount)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Insufficient cash in drawer. Current drawer balance is ${balance}`,
      });
    }

    const [transaction] = await transactionModel.create(
      [
        {
          fromAccount: systemAccount._id,
          toAccount: systemAccount._id,
          amount: Number(amount),
          idempotencyKey,
          status: "completed",
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: systemAccount._id,
          amount: Number(amount),
          transaction: transaction._id,
          type: "debit",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    const newBalance = await systemAccount.getBalance();

    return res.status(201).json({
      message: "Cash payout successfully debited from cash drawer",
      transaction,
      balance: newBalance,
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return next(err);
  } finally {
    await session.endSession();
  }
}

/**
 * Request high-value transfer OTP
 * POST /api/transactions/request-otp
 */
async function requestTransferOtp(req, res, next) {
  try {
    const { amount, toAccount } = req.body;

    if (!amount || Number(amount) <= 0 || !toAccount) {
      return res.status(400).json({
        message:
          "Valid transfer amount and destination account are required for OTP",
      });
    }

    // Guard against rapid duplicate clicks within 4 seconds
    const recentOtp = await otpModel.findOne({
      userId: req.user._id,
      createdAt: { $gt: new Date(Date.now() - 4000) },
    });
    if (recentOtp) {
      return res.status(429).json({
        message:
          "A verification code was just sent. Please wait a few seconds before requesting another.",
      });
    }

    // Generate 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute validity

    // Delete existing OTPs for this user and create new
    await otpModel.deleteMany({ userId: req.user._id });
    await otpModel.create({
      userId: req.user._id,
      code,
      amount: Number(amount),
      toAccount: String(toAccount),
      expiresAt,
    });

    let recipientName = "Recipient";
    if (mongoose.Types.ObjectId.isValid(toAccount)) {
      const destAccount = await accountModel.findById(toAccount).populate("user", "name");
      if (destAccount?.user?.name) {
        recipientName = destAccount.user.name;
      }
    }

    // Dispatch OTP email and await transmission so SMTP socket completes
    if (req.user?.email) {
      try {
        await emailService.sendTransferOtpEmail(
          req.user.email,
          req.user.name || "Customer",
          code,
          amount,
          recipientName,
          toAccount,
        );
      } catch (err) {
        console.error("Could not dispatch OTP email:", err.message);
        return res.status(500).json({
          message: `Unable to send OTP verification email: ${err.message}`,
        });
      }
    }

    return res.status(200).json({
      message: `Security verification code dispatched to ${req.user.email || "your registered email"}`,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createTransaction,
  requestTransferOtp,
  getTransactionById,
  counterCashIn,
  counterCashOut,
};
