import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Lock,
  Building,
} from "lucide-react";

export default function BalanceCard({ onOpenTransfer, refreshTrigger }) {
  const { accounts, selectedAccount, setSelectedAccount } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBalance = async () => {
    if (!selectedAccount?._id) return;
    setLoading(true);
    try {
      const res = await API.get(`/api/accounts/balance/${selectedAccount._id}`);
      setBalance(res.data.balance);
    } catch (err) {
      console.error("Balance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [selectedAccount, refreshTrigger]);

  const handleCopyId = () => {
    if (selectedAccount?._id) {
      navigator.clipboard.writeText(selectedAccount._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isFrozen = selectedAccount?.status === "frozen";

  return (
    <div className="relative overflow-hidden rounded-2xl theme-card-bg p-6 sm:p-8 border border-[#D8DFE7] dark:border-[#2D425A] shadow-sm transition-colors duration-200">
      {/* Subtle ambient executive glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-slate-300/20 dark:bg-[#365C85]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-slate-200/30 dark:bg-[#263B54]/15 blur-3xl pointer-events-none" />

      {/* Frozen Alert Banner */}
      {isFrozen && (
        <div className="mb-6 p-4 rounded-xl bg-[#FDF0F0] border border-[#F7C8C8] text-[#A82424] dark:bg-[#311A23] dark:border-[#542533] dark:text-[#F87171] text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-[#A82424] dark:text-[#F87171] shrink-0" />
            <div>
              <p className="font-bold text-[#7A1919] dark:text-white">This Account is Currently Frozen</p>
              <p className="text-[11px] text-[#A82424]/90 dark:text-[#F87171]/90">
                Compliance hold active. Outgoing transfers and cash payouts are disabled. Contact branch management to unfreeze.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FCE0E0] text-[#A82424] border border-[#F7C8C8] dark:bg-[#451C28] dark:text-[#F87171] dark:border-[#542533]">
            Locked
          </span>
        </div>
      )}

      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        {/* Top Bar: Account Switcher & Status */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8EDF2] border border-[#D8DFE7] text-[#455D76] dark:bg-[#182538] dark:border-[#263B54] dark:text-[#8EB0D4]">
              <Wallet className="h-4 w-4" />
            </div>

            {accounts.length > 1 ? (
              <select
                value={selectedAccount?._id || ""}
                onChange={(e) => {
                  const target = accounts.find((a) => a._id === e.target.value);
                  if (target) setSelectedAccount(target);
                }}
                className="bg-white text-xs font-semibold text-[#1A2530] border border-[#CBD5E1] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#455D76] dark:bg-[#15202E] dark:text-[#F1F5F9] dark:border-[#2A3C52] dark:focus:border-[#527BA8] cursor-pointer shadow-xs"
              >
                {accounts.map((acc, index) => (
                  <option key={acc._id} value={acc._id}>
                    Account #{index + 1} ({acc.currency || "INR"}) — {(acc.status || "active").toUpperCase()}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2C3E50] dark:text-[#E2E8F0]">
                  Primary Checking Account
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isFrozen
                  ? "bg-[#FDF0F0] text-[#A82424] border-[#F7C8C8] dark:bg-[#311A23] dark:text-[#F87171] dark:border-[#542533]"
                  : "bg-[#EBF5EE] text-[#1E6B42] border-[#C3E6D0] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isFrozen ? "bg-[#A82424] dark:bg-[#F87171]" : "bg-[#1E6B42] dark:bg-[#4ADE80] animate-pulse"
                }`}
              />
              {isFrozen ? "Frozen by Compliance" : "Live • Active"}
            </span>

            <button
              onClick={fetchBalance}
              disabled={loading}
              title="Refresh Balance from Core Ledger"
              className="p-1.5 rounded-lg bg-white text-[#5A6B7C] hover:text-[#1A2530] hover:bg-[#F5F7FA] border border-[#CBD5E1] dark:bg-[#182538] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] dark:hover:bg-[#203044] dark:border-[#263B54] transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#455D76] dark:text-[#8EB0D4]" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Center: Large Balance Display */}
        <div className="py-2">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5A6B7C] dark:text-[#94A3B8]">
              Verified Ledger Balance
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#5A6B7C] dark:text-[#94A3B8] font-mono">
              <Building className="h-3 w-3 text-[#5A6B7C] dark:text-[#94A3B8]" />
              <span>IFSC: BKLD000109</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1A2530] dark:text-[#F1F5F9] font-mono tabular-nums">
              ₹{" "}
              {balance != null
                ? balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                : "0.00"}
            </span>
            <span className="text-xs font-bold text-[#5A6B7C] dark:text-[#94A3B8] uppercase tracking-widest font-mono">
              {selectedAccount?.currency || "INR"}
            </span>
          </div>

          {/* Account ID with one-click copy */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-mono text-[#5A6B7C] dark:text-[#94A3B8]">
              Account No:{" "}
              <span className="text-[#1A2530] dark:text-[#F1F5F9] font-semibold">
                {selectedAccount?._id || "None"}
              </span>
            </span>
            <button
              onClick={handleCopyId}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#455D76] hover:text-[#2C3E50] dark:text-[#8EB0D4] dark:hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => onOpenTransfer("transfer")}
            disabled={isFrozen}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs theme-btn-gradient text-white shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowUpRight className="h-4 w-4" />
            Send Money
          </button>

          <button
            onClick={() => onOpenTransfer("withdraw")}
            disabled={isFrozen}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-white hover:bg-[#F5F7FA] text-[#2C3E50] border border-[#CBD5E1] dark:bg-[#1E2C3D] dark:hover:bg-[#243448] dark:text-[#E2E8F0] dark:border-[#365C85]/60 shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
