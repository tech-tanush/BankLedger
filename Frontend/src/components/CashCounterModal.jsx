import React, { useState } from "react";
import API from "../api";
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Banknote,
  Coins,
} from "lucide-react";

export default function CashCounterModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("cash-in"); // "cash-in" | "cash-out"
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a positive amount");
      return;
    }

    setLoading(true);
    const idempotencyKey = `counter_${activeTab}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const endpoint =
        activeTab === "cash-in"
          ? "/api/transactions/counter/cash-in"
          : "/api/transactions/counter/cash-out";

      const res = await API.post(endpoint, {
        amount: numAmount,
        idempotencyKey,
      });

      setSuccess({
        message: res.data.message,
        amount: numAmount,
        newBalance: res.data.balance,
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 1800);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl theme-card-bg border border-[#D8DFE7] dark:border-[#2D425A] p-6 shadow-2xl space-y-5 text-[#1A2530] dark:text-[#F1F5F9] transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D8DFE7] dark:border-[#263B54]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFF9EB] text-[#966007] border border-[#FCE5B2] dark:bg-[#332514] dark:text-[#FBBF24] dark:border-[#573D1E]">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A2530] dark:text-[#F1F5F9]">
                Cash Counter & Till Drawer
              </h3>
              <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8]">
                Log paper cash received or dispensed at counter
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#5A6B7C] hover:text-[#1A2530] hover:bg-[#E8EDF2] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] dark:hover:bg-[#203044] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#E8EDF2] dark:bg-[#182538] border border-[#D8DFE7] dark:border-[#263B54]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("cash-in");
              setError("");
              setSuccess(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "cash-in"
                ? "bg-white dark:bg-[#243448] text-[#1E6B42] dark:text-[#4ADE80] border border-[#C3E6D0] dark:border-[#1F4A38] shadow-xs"
                : "text-[#5A6B7C] dark:text-[#94A3B8] hover:text-[#1E6B42] dark:hover:text-[#4ADE80]"
            }`}
          >
            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Cash In (Deposit)
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("cash-out");
              setError("");
              setSuccess(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "cash-out"
                ? "bg-white dark:bg-[#243448] text-[#A82424] dark:text-[#F87171] border border-[#F7C8C8] dark:border-[#542533] shadow-xs"
                : "text-[#5A6B7C] dark:text-[#94A3B8] hover:text-[#A82424] dark:hover:text-[#F87171]"
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            Cash Out (Payout)
          </button>
        </div>

        {/* Subtitle explanation */}
        <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8] bg-[#F5F7FA] dark:bg-[#15202E] p-3 rounded-xl border border-[#D8DFE7] dark:border-[#263B54] leading-relaxed">
          {activeTab === "cash-in"
            ? "📥 Customer gave paper cash at counter. Credits the Cash Drawer so you can transfer funds to their account."
            : "📤 Customer transferred money to bank till to withdraw. Debits the Cash Drawer as paper cash is handed over."}
        </p>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-[#FDF0F0] border border-[#F7C8C8] flex items-start gap-2.5 text-xs text-[#A82424] dark:bg-[#311A23] dark:border-[#542533] dark:text-[#F87171]">
            <AlertCircle className="h-4 w-4 text-[#A82424] dark:text-[#F87171] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-[#EBF5EE] border border-[#C3E6D0] flex items-start gap-2.5 text-xs text-[#1E6B42] dark:bg-[#132B22] dark:border-[#1F4A38] dark:text-[#4ADE80]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{success.message}</p>
              <p className="text-[11px] text-[#1E6B42]/90 dark:text-[#4ADE80]/90 mt-0.5">
                New Drawer Balance: ₹ {success.newBalance?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2C3E50] dark:text-[#E2E8F0] mb-1.5">
              {activeTab === "cash-in" ? "Cash Received Amount (INR)" : "Cash Dispensed Amount (INR)"}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5A6B7C] dark:text-[#94A3B8]">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="10000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-sm font-bold text-[#1A2530] placeholder:text-[#5A6B7C]/60 focus:outline-none focus:border-[#455D76] dark:bg-[#15202E] dark:border-[#2A3C52] dark:text-[#F1F5F9] dark:placeholder:text-[#94A3B8]/60 dark:focus:border-[#527BA8] font-mono shadow-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || Boolean(success)}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 theme-btn-gradient"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Recording in Ledger...</span>
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4" />
                  <span>
                    {activeTab === "cash-in"
                      ? "Log Cash Deposit to Drawer"
                      : "Log Cash Payout from Drawer"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
