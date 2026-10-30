const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Account must be associated with a user"],
    index: true,
  },
  status: {
    type: String,
    enum: {
      values: ["active", "frozen", "closed"],
      message: "Status must be either active, frozen, or closed",
    },
    default: "active",
  },
  currency: {
    type: String,
    required: [true, "Account must have a currency"],
    default: "INR",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function (options = {}) {
  const aggregateQuery = ledgerModel.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  if (options.session) {
    aggregateQuery.session(options.session);
  }

  const balanceData = await aggregateQuery;

  if (balanceData.length > 0) {
    return balanceData[0].balance;
  }

  return 0;
};

const accountModel = mongoose.model("Account", accountSchema);

module.exports = accountModel;
