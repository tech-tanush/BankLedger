import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import {
  X,
  Send,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  KeyRound,
  Database,
  BookOpenCheck,
  ShieldCheck,
  User,
  Search,
  Check,
} from "lucide-react";

export default function TransferModal({
  isOpen,
  onClose,
  mode = "transfer",
  onSuccess,
  initialRecipient = "",
}) {
  const { selectedAccount, user } = useAuth();
  const [recipientInput, setRecipientInput] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form"); // "form" | "otp" | "processing" | "success"
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  // Recipient Lookup State
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);

  // Settlement animation state
  const [settlementStage, setSettlementStage] = useState(0);

  const settlementStages = [
    {
      title: "Verifying Account Integrity",
      desc: "Validating recipient ownership & balance constraints...",
      icon: Lock,
    },
    {
      title: "Acquiring ACID Database Lock",
      desc: "Opening isolated MongoDB multi-document session...",
      icon: Database,
    },
    {
      title: "Writing Double-Entry Ledger",
      desc: "Committing atomic balancing debit & credit entries...",
      icon: BookOpenCheck,
    },
    {
      title: "Settlement Confirmed",
      desc: "Transaction finalized and cryptographically verified on ledger.",
      icon: ShieldCheck,
    },
  ];

  const handleReset = () => {
    setRecipientInput("");
    setToAccount("");
    setAmount("");
    setOtp("");
    setStep("form");
    setError("");
    setSuccessData(null);
    setSettlementStage(0);
    setLookupResult(null);
    setLookupLoading(false);
  };

  useEffect(() => {
    if (!isOpen) {
      handleReset();
    } else if (initialRecipient) {
      setRecipientInput(initialRecipient);
    }
  }, [isOpen, initialRecipient]);

  // Debounced Payee Lookup
  useEffect(() => {
    if (!recipientInput.trim()) {
      setLookupResult(null);
      setToAccount("");
      return;
    }

    const timer = setTimeout(async () => {
      setLookupLoading(true);
      try {
        const res = await API.get(
          `/api/accounts/lookup?query=${encodeURIComponent(recipientInput.trim())}`
        );
        if (res.data.found) {
          setLookupResult(res.data);
          setToAccount(res.data.selectedAccountId || res.data.accounts[0]?._id);
          setError("");
        }
      } catch (err) {
        setLookupResult(null);
        if (recipientInput.trim().length === 24) {
          setToAccount(recipientInput.trim());
        } else {
          setToAccount("");
        }
      } finally {
        setLookupLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [recipientInput]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const targetAccountId = toAccount || recipientInput.trim();
    const numAmount = Number(amount);

    if (!targetAccountId) {
      setError("Please enter a valid recipient email or Account ID");
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a positive transfer amount");
      return;
    }
    if (targetAccountId === selectedAccount?._id) {
      setError("Destination account cannot be the same as your source account");
      return;
    }

    // High-value transfer threshold (₹50,000+) requires 2FA OTP
    if (numAmount >= 50000) {
      try {
        setError("");
        await API.post("/api/transactions/request-otp", {
          amount: numAmount,
          toAccount: targetAccountId,
        });
        setStep("otp");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to request security verification code"
        );
      }
      return;
    }

    executeTransfer(targetAccountId);
  };

  const executeTransfer = async (targetAccountId, otpCode = "") => {
    setStep("processing");
    setError("");
    setSettlementStage(0);

    const idempotencyKey = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const numAmount = Number(amount);

    const runStageTicker = async () => {
      setSettlementStage(1);
      await new Promise((r) => setTimeout(r, 550 + Math.random() * 200));

      setSettlementStage(2);
      await new Promise((r) => setTimeout(r, 650 + Math.random() * 250));

      setSettlementStage(3);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 200));

      setSettlementStage(4);
      await new Promise((r) => setTimeout(r, 400));
    };

    try {
      const [res] = await Promise.all([
        API.post("/api/transactions", {
          fromAccount: selectedAccount._id,
          toAccount: targetAccountId,
          amount: numAmount,
          idempotencyKey,
          ...(otpCode ? { otp: otpCode } : {}),
        }),
        runStageTicker(),
      ]);

      setSuccessData({
        message: res.data.message || "Transaction settled successfully",
        amount: numAmount,
        transactionId: res.data.transaction?._id,
        toAccount: targetAccountId,
        recipientName: lookupResult?.recipient?.name || "Recipient",
      });
      setStep("success");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setStep(numAmount >= 50000 ? "otp" : "form");
      const msg = err.response?.data?.message || err.message || "Transfer failed";
      setError(msg);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code");
      return;
    }
    const targetAccountId = toAccount || recipientInput.trim();
    executeTransfer(targetAccountId, otp.trim());
  };

  const calculateProgressPercent = () => {
    switch (settlementStage) {
      case 1:
        return 28;
      case 2:
        return 58;
      case 3:
        return 88;
      case 4:
        return 100;
      default:
        return 10;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl theme-card-bg border border-[#D8DFE7] dark:border-[#2D425A] shadow-2xl overflow-hidden flex flex-col text-[#1A2530] dark:text-[#F1F5F9] transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D8DFE7] dark:border-[#263B54] bg-[#F5F7FA]/90 dark:bg-[#182538]/90">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                mode === "withdraw"
                  ? "bg-[#FFF9EB] text-[#966007] border border-[#FCE5B2] dark:bg-[#332514] dark:text-[#FBBF24] dark:border-[#573D1E]"
                  : "bg-[#E8EDF2] text-[#455D76] border border-[#CBD5E1] dark:bg-[#243448] dark:text-[#8EB0D4] dark:border-[#365C85]/50"
              }`}
            >
              {mode === "withdraw" ? (
                <ArrowDownLeft className="h-5 w-5" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A2530] dark:text-[#F1F5F9] tracking-tight">
                {step === "otp"
                  ? "Security Verification (2FA)"
                  : step === "processing"
                  ? "ACID Settlement Engine"
                  : step === "success"
                  ? "Transfer Complete"
                  : mode === "withdraw"
                  ? "Withdraw Funds"
                  : "Send Money (Transfer)"}
              </h3>
              <p className="text-[11px] text-[#5A6B7C] dark:text-[#94A3B8] font-medium">
                {step === "processing"
                  ? "Double-Entry Ledger Synchronization"
                  : "Instant Inter-Account Transfer"}
              </p>
            </div>
          </div>

          {step !== "processing" && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#5A6B7C] hover:text-[#1A2530] hover:bg-[#E8EDF2] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] dark:hover:bg-[#203044] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && step !== "processing" && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#FDF0F0] border border-[#F7C8C8] flex items-start gap-2.5 text-xs text-[#A82424] dark:bg-[#311A23] dark:border-[#542533] dark:text-[#F87171]">
              <AlertCircle className="h-4 w-4 text-[#A82424] dark:text-[#F87171] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: FORM */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Recipient Input (Email or Account ID) */}
              <div>
                <label className="block text-xs font-semibold text-[#2C3E50] dark:text-[#E2E8F0] mb-1.5">
                  Recipient Email or Account ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. rohit@gmail.com or 6ae383..."
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#1A2530] placeholder:text-[#5A6B7C]/60 focus:outline-none focus:border-[#455D76] dark:bg-[#15202E] dark:border-[#2A3C52] dark:text-[#F1F5F9] dark:placeholder:text-[#94A3B8]/60 dark:focus:border-[#527BA8] font-mono transition-colors shadow-xs"
                  />
                  {lookupLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#455D76] dark:text-[#8EB0D4] animate-spin" />
                  )}
                </div>
              </div>

              {/* Verified Payee Card & Account Picker */}
              {lookupResult && lookupResult.found && (
                <div className="p-3.5 rounded-xl bg-[#E8EDF2]/60 border border-[#CBD5E1] dark:bg-[#182538] dark:border-[#365C85]/40 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#D8DFE7] border border-[#CBD5E1] text-[#2C3E50] dark:bg-[#243448] dark:border-[#365C85]/60 dark:text-[#8EB0D4] flex items-center justify-center font-bold text-xs">
                        {lookupResult.recipient.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A2530] dark:text-[#F1F5F9] flex items-center gap-1">
                          {lookupResult.recipient.name}
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        </p>
                        <p className="text-[11px] text-[#5A6B7C] dark:text-[#94A3B8]">
                          {lookupResult.recipient.email}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#1E6B42] border border-[#C3E6D0] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38]">
                      Verified Payee
                    </span>
                  </div>

                  {/* Multiple Accounts Picker */}
                  {lookupResult.accounts.length > 1 ? (
                    <div className="pt-2 border-t border-[#CBD5E1] dark:border-[#263B54] space-y-1.5">
                      <label className="text-[11px] font-semibold text-[#2C3E50] dark:text-[#E2E8F0] block">
                        Select Destination Account ({lookupResult.accounts.length} active):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {lookupResult.accounts.map((acc) => {
                          const isSelected = toAccount === acc._id;
                          return (
                            <button
                              key={acc._id}
                              type="button"
                              onClick={() => setToAccount(acc._id)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-white border-[#455D76] text-[#1A2530] dark:bg-[#243448] dark:border-[#527BA8] dark:text-[#F1F5F9] ring-1 ring-[#455D76] dark:ring-[#527BA8] shadow-xs"
                                  : "bg-[#F5F7FA] border-[#D8DFE7] text-[#5A6B7C] dark:bg-[#15202E] dark:border-[#263B54] dark:text-[#94A3B8] hover:border-[#CBD5E1]"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-xs text-[#1A2530] dark:text-[#F1F5F9]">
                                  {acc.label}
                                </span>
                                {isSelected && (
                                  <Check className="h-3.5 w-3.5 text-[#455D76] dark:text-[#8EB0D4]" />
                                )}
                              </div>
                              <span className="font-mono text-[10px] text-[#5A6B7C] dark:text-[#94A3B8] block mt-0.5">
                                ••••{acc._id.slice(-4)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1.5 border-t border-[#CBD5E1] dark:border-[#263B54] flex items-center justify-between text-[11px] text-[#5A6B7C] dark:text-[#94A3B8] font-mono">
                      <span>Crediting Account:</span>
                      <span className="text-[#1A2530] dark:text-[#F1F5F9] font-semibold">
                        ••••{lookupResult.accounts[0]?._id.slice(-4)} ({lookupResult.accounts[0]?.currency || "INR"})
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#2C3E50] dark:text-[#E2E8F0]">
                    Amount (INR)
                  </label>
                  {Number(amount) >= 50000 && (
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      2FA Protected (₹50k+)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5A6B7C] dark:text-[#94A3B8] font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border border-[#CBD5E1] text-sm font-bold text-[#1A2530] placeholder:text-[#5A6B7C]/60 focus:outline-none focus:border-[#455D76] dark:bg-[#15202E] dark:border-[#2A3C52] dark:text-[#F1F5F9] dark:placeholder:text-[#94A3B8]/60 dark:focus:border-[#527BA8] font-mono transition-colors shadow-xs"
                  />
                </div>
              </div>

              {/* Source Account Info Pill */}
              <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#D8DFE7] dark:bg-[#15202E] dark:border-[#263B54] text-xs space-y-1">
                <div className="flex justify-between text-[#5A6B7C] dark:text-[#94A3B8]">
                  <span>From Account:</span>
                  <span className="font-mono text-[#1A2530] dark:text-[#F1F5F9] font-semibold truncate max-w-[170px]">
                    {selectedAccount?._id ? `••••${selectedAccount._id.slice(-4)}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-[#5A6B7C] dark:text-[#94A3B8]">
                  <span>Settlement:</span>
                  <span className="text-[#1E6B42] dark:text-[#4ADE80] font-semibold">Immediate • Zero Fee</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl font-semibold text-xs tracking-wide theme-btn-gradient text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>
                  {Number(amount) >= 50000
                    ? "Verify with Security OTP (₹50k+)"
                    : "Confirm & Transfer"}
                </span>
              </button>
            </form>
          )}

          {/* STEP 2: 2FA OTP VERIFICATION */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-xl bg-[#E8EDF2] border border-[#CBD5E1] dark:bg-[#182538] dark:border-[#263B54] space-y-2 text-center">
                <div className="inline-flex p-2.5 rounded-full bg-[#D8DFE7] text-[#455D76] dark:bg-[#243448] dark:text-[#8EB0D4] mx-auto">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-[#1A2530] dark:text-[#F1F5F9]">
                  High-Value Transaction Authorization
                </h4>
                <p className="text-[11px] text-[#5A6B7C] dark:text-[#94A3B8] leading-relaxed">
                  Enter the 6-digit authorization code dispatched to{" "}
                  <strong className="text-[#1A2530] dark:text-[#F1F5F9]">{user?.email || "your registered email"}</strong>{" "}
                  for transferring{" "}
                  <strong className="text-[#1A2530] dark:text-[#F1F5F9]">
                    ₹ {Number(amount).toLocaleString("en-IN")}
                  </strong>
                  .
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2C3E50] dark:text-[#E2E8F0] mb-1.5 text-center">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[10px] text-xl font-bold py-3 rounded-xl bg-white border border-[#CBD5E1] text-[#1A2530] placeholder:text-[#5A6B7C]/40 focus:outline-none focus:border-[#455D76] dark:bg-[#15202E] dark:border-[#2A3C52] dark:text-[#F1F5F9] dark:focus:border-[#527BA8] font-mono shadow-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F7FA] text-[#2C3E50] border border-[#CBD5E1] dark:bg-[#1E2C3D] dark:hover:bg-[#243448] dark:text-[#E2E8F0] dark:border-[#365C85]/60 transition-colors cursor-pointer shadow-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold theme-btn-gradient text-white transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verify & Settle
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: MULTI-STAGE SETTLEMENT ENGINE */}
          {step === "processing" && (
            <div className="py-6 space-y-6 text-center">
              {/* Radial Progress Ring */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-[#D8DFE7] dark:text-[#263B54] stroke-current"
                    strokeWidth="7"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-[#455D76] dark:text-[#527BA8] stroke-current transition-all duration-500 ease-out"
                    strokeWidth="7"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * calculateProgressPercent()) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-xl font-extrabold text-[#1A2530] dark:text-[#F1F5F9]">
                    {calculateProgressPercent()}%
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#5A6B7C] dark:text-[#94A3B8] font-semibold">
                    ACID Commit
                  </span>
                </div>
              </div>

              {/* Amount Preview */}
              <div className="space-y-1">
                <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8] font-medium">
                  Transferring Funds
                </p>
                <p className="text-2xl font-extrabold text-[#1A2530] dark:text-[#F1F5F9] font-mono tracking-tight">
                  ₹ {Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Stages List */}
              <div className="space-y-2 text-left max-w-xs mx-auto">
                {settlementStages.map((stg, idx) => {
                  const stageNum = idx + 1;
                  const isDone = settlementStage > stageNum;
                  const isCurrent = settlementStage === stageNum;
                  const Icon = stg.icon;

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                        isCurrent
                          ? "bg-[#E8EDF2] border-[#CBD5E1] text-[#1A2530] dark:bg-[#243448] dark:border-[#365C85] dark:text-[#F1F5F9]"
                          : isDone
                          ? "bg-[#EBF5EE] border-[#C3E6D0] text-[#1E6B42] dark:bg-[#132B22] dark:border-[#1F4A38] dark:text-[#4ADE80]"
                          : "bg-[#F5F7FA] border-[#D8DFE7] text-[#5A6B7C] dark:bg-[#15202E] dark:border-[#263B54] dark:text-[#94A3B8]"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="h-4 w-4 text-[#455D76] dark:text-[#8EB0D4] animate-spin shrink-0" />
                      ) : (
                        <Icon className="h-4 w-4 text-[#5A6B7C] dark:text-[#94A3B8] shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold leading-tight">{stg.title}</p>
                        <p className="text-[10px] text-[#5A6B7C] dark:text-[#94A3B8] truncate mt-0.5">
                          {stg.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT PREVIEW */}
          {step === "success" && successData && (
            <div className="py-4 space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EBF5EE] border border-[#C3E6D0] text-[#1E6B42] dark:bg-[#132B22] dark:border-[#1F4A38] dark:text-[#4ADE80] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#1A2530] dark:text-[#F1F5F9] tracking-tight">
                  {successData.message}
                </h4>
                <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8] mt-1">
                  Settled on Double-Entry Ledger with ACID consistency
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D8DFE7] dark:bg-[#15202E] dark:border-[#263B54] text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5A6B7C] dark:text-[#94A3B8]">Amount Sent:</span>
                  <span className="font-mono font-bold text-[#1A2530] dark:text-[#F1F5F9]">
                    ₹ {successData.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6B7C] dark:text-[#94A3B8]">Recipient:</span>
                  <span className="font-semibold text-[#1A2530] dark:text-[#F1F5F9]">
                    {successData.recipientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6B7C] dark:text-[#94A3B8]">Account:</span>
                  <span className="font-mono text-[#2C3E50] dark:text-[#E2E8F0]">
                    ••••{successData.toAccount.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A6B7C] dark:text-[#94A3B8]">Tx Reference:</span>
                  <span className="font-mono text-[#455D76] dark:text-[#8EB0D4] font-semibold truncate max-w-[180px]">
                    {successData.transactionId}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl font-semibold text-xs theme-btn-gradient text-white transition-colors cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
