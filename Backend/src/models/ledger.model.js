const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Ledger must be associated with an account"],
      index: true,
      immutable: true,
    },
    amount: {
      type: Number,
      required: [true, "Ledger amount is required"],
      immutable: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Ledger must be associated with a transaction"],
      immutable: true,
    },
    type: {
      type: String,
      enum: {
        values: ["credit", "debit"],
        message: "Ledger type must be either credit or debit",
      },
      required: [true, "Ledger type is required"],
      immutable: true,
    },
  },
  {
    timestamps: true,
  },
);

function preventLedgerModification() {
  throw new Error("Ledger entries cannot be modified or deleted once created.");
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);
ledgerSchema.pre("replaceOne", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);

const ledgerModel = mongoose.model("Ledger", ledgerSchema);

module.exports = ledgerModel;
