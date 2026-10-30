const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Transaction must be associated with a from account"],
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Transaction must be associated with a to account"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "reversed"],
        message:
          "Status must be either pending, completed, failed, or reversed",
      },
      default: "pending",
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0, "Transaction amount must be a positive number"],
    },
    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const transactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = transactionModel;
