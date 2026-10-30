const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    toAccount: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index auto-purges expired OTPs
    },
  },
  {
    timestamps: true,
  }
);

const otpModel = mongoose.model("Otp", otpSchema);

module.exports = otpModel;

