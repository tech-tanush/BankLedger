import React, { useState, useEffect } from "react";
import API from "../api";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  Receipt,
  User,
} from "lucide-react";

export default function TransactionReceiptModal({
  isOpen,
  onClose,
  transactionId,
}) {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (!isOpen || !transactionId) {
      setTransaction(null);
      setError("");
      return;
    }

    const fetchTransaction = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/api/transactions/${transactionId}`);
        setTransaction(res.data.transaction);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load transaction details";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [isOpen, transactionId]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const isSelfTransaction =
    transaction?.fromAccount?._id &&
    transaction?.toAccount?._id &&
    transaction.fromAccount._id === transaction.toAccount._id;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl theme-card-bg border border-[#D8DFE7] dark:border-[#2D425A] shadow-2xl overflow-hidden flex flex-col text-[#1A2530] dark:text-[#F1F5F9] transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D8DFE7] dark:border-[#263B54] bg-[#F5F7FA]/90 dark:bg-[#182538]/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E8EDF2] text-[#455D76] border border-[#CBD5E1] dark:bg-[#243448] dark:text-[#8EB0D4] dark:border-[#365C85]/50">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1A2530] dark:text-[#F1F5F9] tracking-tight">
                Transaction Receipt
              </h2>
              <p className="text-[11px] text-[#5A6B7C] dark:text-[#94A3B8] font-medium">
                Bank<span className="text-[#455D76] dark:text-[#8EB0D4]">Ledger</span> • Double-Entry Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5A6B7C] hover:text-[#1A2530] hover:bg-[#E8EDF2] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] dark:hover:bg-[#203044] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 text-[#455D76] dark:text-[#8EB0D4] animate-spin mx-auto" />
              <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8] font-medium">
                Verifying and loading transaction from ledger...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-[#FDF0F0] border border-[#F7C8C8] text-[#A82424] dark:bg-[#311A23] dark:border-[#542533] dark:text-[#F87171] flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-[#A82424] dark:text-[#F87171]" />
              <div className="text-xs space-y-1">
                <p className="font-semibold">Unable to fetch transaction</p>
                <p className="text-[#A82424]/90 dark:text-[#F87171]/90">{error}</p>
              </div>
            </div>
          ) : transaction ? (
            <>
              {/* Hero Status & Amount */}
              <div className="p-5 rounded-xl bg-[#F5F7FA] border border-[#D8DFE7] dark:bg-[#15202E] dark:border-[#263B54] text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EBF5EE] text-[#1E6B42] border border-[#C3E6D0] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {transaction.status || "Completed"}
                </div>

                <div className="text-3xl font-extrabold text-[#1A2530] dark:text-[#F1F5F9] font-mono tracking-tight pt-1">
                  ₹{" "}
                  {transaction.amount?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </div>

                <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8]">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>

              {/* Accounts Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* From Account */}
                <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#D8DFE7] dark:bg-[#15202E] dark:border-[#263B54] space-y-1.5">
                  <span className="text-[10px] font-semibold text-[#5A6B7C] dark:text-[#94A3B8] uppercase tracking-wider block">
                    From Account
                  </span>
                  <div className="flex items-center justify-between font-mono font-semibold text-[#1A2530] dark:text-[#F1F5F9]">
                    <span className="truncate" title={transaction.fromAccount?._id}>
                      {transaction.fromAccount?._id || "External / Cash"}
                    </span>
                    {transaction.fromAccount?._id && (
                      <button
                        onClick={() =>
                          handleCopy(transaction.fromAccount._id, "fromAccount")
                        }
                        className="p-1 text-[#5A6B7C] hover:text-[#1A2530] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] transition-colors cursor-pointer"
                        title="Copy Account ID"
                      >
                        {copiedField === "fromAccount" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  {transaction.fromAccount?.user?.name && (
                    <div className="flex items-center gap-1 text-[11px] text-[#5A6B7C] dark:text-[#94A3B8] pt-0.5">
                      <User className="h-3 w-3 text-[#5A6B7C] dark:text-[#94A3B8] shrink-0" />
                      <span className="truncate font-medium text-[#2C3E50] dark:text-[#E2E8F0]">
                        {transaction.fromAccount.user.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* To Account */}
                <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#D8DFE7] dark:bg-[#15202E] dark:border-[#263B54] space-y-1.5">
                  <span className="text-[10px] font-semibold text-[#5A6B7C] dark:text-[#94A3B8] uppercase tracking-wider block">
                    To Account
                  </span>
                  <div className="flex items-center justify-between font-mono font-semibold text-[#1A2530] dark:text-[#F1F5F9]">
                    <span className="truncate" title={transaction.toAccount?._id}>
                      {transaction.toAccount?._id || "External / Cash"}
                    </span>
                    {transaction.toAccount?._id && (
                      <button
                        onClick={() =>
                          handleCopy(transaction.toAccount._id, "toAccount")
                        }
                        className="p-1 text-[#5A6B7C] hover:text-[#1A2530] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] transition-colors cursor-pointer"
                        title="Copy Account ID"
                      >
                        {copiedField === "toAccount" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  {transaction.toAccount?.user?.name && (
                    <div className="flex items-center gap-1 text-[11px] text-[#5A6B7C] dark:text-[#94A3B8] pt-0.5">
                      <User className="h-3 w-3 text-[#5A6B7C] dark:text-[#94A3B8] shrink-0" />
                      <span className="truncate font-medium text-[#2C3E50] dark:text-[#E2E8F0]">
                        {transaction.toAccount.user.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Metadata Details */}
              <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D8DFE7] divide-y divide-[#E8EDF2] dark:bg-[#15202E] dark:border-[#263B54] dark:divide-[#263B54]/60 text-xs space-y-2.5">
                {/* Transaction Ref ID */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#5A6B7C] dark:text-[#94A3B8] font-medium">Transaction ID</span>
                  <div className="flex items-center gap-1.5 font-mono text-[#1A2530] dark:text-[#F1F5F9] font-semibold">
                    <span className="truncate max-w-[200px]" title={transaction._id}>
                      {transaction._id}
                    </span>
                    <button
                      onClick={() => handleCopy(transaction._id, "txId")}
                      className="p-1 text-[#5A6B7C] hover:text-[#1A2530] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] transition-colors cursor-pointer"
                      title="Copy Transaction ID"
                    >
                      {copiedField === "txId" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Operation Nature */}
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-[#5A6B7C] dark:text-[#94A3B8] font-medium">Operation Type</span>
                  <span className="font-semibold text-[#1A2530] dark:text-[#F1F5F9]">
                    {isSelfTransaction
                      ? "Cash Counter / Drawer Ledger Operation"
                      : "Direct Account-to-Account Transfer"}
                  </span>
                </div>

                {/* Idempotency Key */}
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-[#5A6B7C] dark:text-[#94A3B8] font-medium">Audit Reference Key</span>
                  <div className="flex items-center gap-1.5 font-mono text-[#5A6B7C] dark:text-[#94A3B8] text-[11px]">
                    <span
                      className="truncate max-w-[190px]"
                      title={transaction.idempotencyKey}
                    >
                      {transaction.idempotencyKey || "—"}
                    </span>
                    {transaction.idempotencyKey && (
                      <button
                        onClick={() =>
                          handleCopy(transaction.idempotencyKey, "idempotency")
                        }
                        className="p-1 text-[#5A6B7C] hover:text-[#1A2530] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] transition-colors cursor-pointer"
                        title="Copy Key"
                      >
                        {copiedField === "idempotency" ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Currency */}
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-[#5A6B7C] dark:text-[#94A3B8] font-medium">Settlement Currency</span>
                  <span className="font-bold text-[#1A2530] dark:text-[#F1F5F9]">
                    {transaction.fromAccount?.currency ||
                      transaction.toAccount?.currency ||
                      "INR"}
                  </span>
                </div>
              </div>

              {/* Immutable Ledger Verification Badge */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EBF5EE] border border-[#C3E6D0] text-[#1E6B42] dark:bg-[#132B22] dark:border-[#1F4A38] dark:text-[#4ADE80] text-xs">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="leading-tight text-[11px] font-medium">
                  Double-entry ledger verified: equal debit and credit balancing
                  entries recorded immutably.
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D8DFE7] dark:border-[#263B54] bg-[#F8FAFC]/50 dark:bg-[#15202E]/50 flex items-center justify-end gap-3">
          {transaction && (
            <button
              onClick={() => handleCopy(transaction._id, "txIdBottom")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2C3E50] hover:text-[#1A2530] bg-white hover:bg-[#F5F7FA] border border-[#CBD5E1] dark:bg-[#1E2C3D] dark:hover:bg-[#243448] dark:text-[#E2E8F0] dark:border-[#365C85]/60 shadow-xs transition-colors cursor-pointer"
            >
              {copiedField === "txIdBottom" ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Copied Ref
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#5A6B7C] dark:text-[#94A3B8]" />
                  Copy Ref ID
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold theme-btn-gradient text-white transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
