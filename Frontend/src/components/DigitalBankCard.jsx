import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CreditCard,
  Copy,
  Check,
  Building,
  ShieldCheck,
  Eye,
  EyeOff,
  Radio,
  Lock,
} from "lucide-react";

export default function DigitalBankCard({ onOpenTransfer }) {
  const { selectedAccount, user } = useAuth();
  const [copiedField, setCopiedField] = useState(null);
  const [showFullId, setShowFullId] = useState(false);

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const accountId = selectedAccount?._id || "";
  const maskedId = accountId
    ? `•••• •••• •••• ${accountId.slice(-4)}`
    : "•••• •••• •••• ••••";
  const isFrozen = selectedAccount?.status === "frozen";

  return (
    <div className="space-y-4">
      {/* Executive Metallic Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-[#182538] via-[#1B2736] to-[#263B54] p-6 border border-[#365C85]/40 shadow-xl flex flex-col justify-between h-[210px] text-white select-none">
        {/* Subtle executive sheen */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#527BA8]/10 blur-2xl pointer-events-none" />

        {/* Top Card Row */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-white leading-none">
              Bank<span className="text-[#8EB0D4]">Ledger</span>
            </span>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#243448] text-[#8EB0D4] border border-[#365C85]/50">
              Core
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-slate-400 rotate-90" />
            <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase">
              Debit
            </span>
          </div>
        </div>

        {/* EMV Chip & Account Mask */}
        <div className="relative z-10 space-y-3">
          {/* Gold Chip Graphic */}
          <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 p-0.5 shadow-xs flex items-center justify-center">
            <div className="w-full h-full border border-amber-700/30 rounded-[4px] grid grid-cols-2 gap-0.5 opacity-80" />
          </div>

          {/* Account Number */}
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm tracking-[3px] text-slate-100 font-bold">
              {showFullId ? accountId : maskedId}
            </p>
            <button
              onClick={() => setShowFullId(!showFullId)}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={showFullId ? "Mask Account ID" : "Reveal Account ID"}
            >
              {showFullId ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Card Row */}
        <div className="relative z-10 flex items-end justify-between text-[11px]">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
              Account Holder
            </p>
            <p className="font-bold tracking-wide uppercase text-white truncate max-w-[170px]">
              {user?.name || "Cardholder"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
              Status
            </p>
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                isFrozen ? "text-[#F87171]" : "text-[#4ADE80]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isFrozen ? "bg-[#F87171]" : "bg-[#4ADE80] animate-pulse"
                }`}
              />
              {isFrozen ? "Frozen" : "Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Institutional Metadata & 1-Click Copy Tray */}
      <div className="p-4 rounded-xl theme-card-bg border border-[#D8DFE7] dark:border-[#2D425A] shadow-sm space-y-2.5 text-xs transition-colors duration-200">
        {/* Account ID Copy */}
        <div className="flex items-center justify-between">
          <span className="text-[#5A6B7C] dark:text-[#94A3B8] font-medium">Account ID</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[#1A2530] dark:text-[#F1F5F9] font-semibold text-[11px] truncate max-w-[140px]">
              {accountId ? `${accountId.slice(0, 8)}...${accountId.slice(-4)}` : "—"}
            </span>
            <button
              onClick={() => handleCopy(accountId, "id")}
              className="p-1 rounded text-[#5A6B7C] hover:text-[#1A2530] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] transition-colors cursor-pointer"
              title="Copy Account ID"
            >
              {copiedField === "id" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* IFSC Routing */}
        <div className="flex items-center justify-between pt-1 border-t border-[#D8DFE7] dark:border-[#263B54]">
          <span className="text-[#5A6B7C] dark:text-[#94A3B8] font-medium flex items-center gap-1">
            <Building className="h-3 w-3 text-[#5A6B7C] dark:text-[#94A3B8]" />
            Branch IFSC
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[#1A2530] dark:text-[#F1F5F9] font-semibold text-[11px]">BKLD000109</span>
            <button
              onClick={() => handleCopy("BKLD000109", "ifsc")}
              className="p-1 rounded text-[#5A6B7C] hover:text-[#1A2530] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] transition-colors cursor-pointer"
              title="Copy IFSC Code"
            >
              {copiedField === "ifsc" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Security & Ledger Protocol */}
        <div className="flex items-center justify-between pt-1 border-t border-[#D8DFE7] dark:border-[#263B54]">
          <span className="text-[#5A6B7C] dark:text-[#94A3B8] font-medium flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            Ledger Protection
          </span>
          <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-[#EBF5EE] text-[#1E6B42] border border-[#C3E6D0] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38]">
            ACID Verified
          </span>
        </div>
      </div>
    </div>
  );
}
