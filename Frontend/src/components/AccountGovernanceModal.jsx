import React, { useState, useEffect } from "react";
import API from "../api";
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Lock,
  Unlock,
  Loader2,
  RefreshCw,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function AccountGovernanceModal({ isOpen, onClose, onStatusChanged }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchAllAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/api/accounts/all");
      setAccounts(res.data.accounts || []);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load accounts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllAccounts();
      setActionSuccess("");
    }
  }, [isOpen]);

  const handleToggleStatus = async (account) => {
    const nextStatus = account.status === "active" ? "frozen" : "active";
    const confirmMsg =
      nextStatus === "frozen"
        ? `Are you sure you want to FREEZE account ${account._id}? All incoming and outgoing transactions will be blocked immediately.`
        : `Unfreeze account ${account._id} and restore normal transaction processing?`;

    if (!window.confirm(confirmMsg)) return;

    setUpdatingId(account._id);
    setError("");
    setActionSuccess("");

    try {
      const res = await API.patch(`/api/accounts/${account._id}/status`, {
        status: nextStatus,
      });

      setAccounts((prev) =>
        prev.map((acc) =>
          acc._id === account._id ? { ...acc, status: nextStatus } : acc
        )
      );

      setActionSuccess(
        `Account ${account._id.slice(0, 8)}... marked as ${nextStatus.toUpperCase()}`
      );
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update account status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const q = searchQuery.toLowerCase();
    const idMatch = acc._id?.toLowerCase().includes(q);
    const nameMatch = acc.user?.name?.toLowerCase().includes(q);
    const emailMatch = acc.user?.email?.toLowerCase().includes(q);
    const statusMatch = acc.status?.toLowerCase().includes(q);
    return idMatch || nameMatch || emailMatch || statusMatch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl theme-card-bg border border-[#D8DFE7] dark:border-[#2D425A] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-[#1A2530] dark:text-[#F1F5F9] transition-colors duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#D8DFE7] dark:border-[#263B54] bg-[#F5F7FA]/90 dark:bg-[#182538]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFF9EB] text-[#966007] border border-[#FCE5B2] dark:bg-[#332514] dark:text-[#FBBF24] dark:border-[#573D1E]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1A2530] dark:text-[#F1F5F9] tracking-tight">
                  Bank Account Governance & Controls
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF9EB] text-[#966007] border border-[#FCE5B2] dark:bg-[#332514] dark:text-[#FBBF24] dark:border-[#573D1E]">
                  Manager Only
                </span>
              </div>
              <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8]">
                Inspect customer balances and manage account freezes or restrictions
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

        {/* Toolbar */}
        <div className="p-4 border-b border-[#D8DFE7] dark:border-[#263B54] bg-[#F8FAFC]/50 dark:bg-[#15202E]/50 flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A6B7C] dark:text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by Account ID, Name, Email or Status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#1A2530] placeholder:text-[#5A6B7C]/60 focus:outline-none focus:border-[#455D76] dark:bg-[#182538] dark:border-[#2A3C52] dark:text-[#F1F5F9] dark:placeholder:text-[#94A3B8]/60 dark:focus:border-[#527BA8] shadow-xs"
            />
          </div>

          <button
            onClick={fetchAllAccounts}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F7FA] text-[#2C3E50] border border-[#CBD5E1] dark:bg-[#1E2C3D] dark:hover:bg-[#243448] dark:text-[#E2E8F0] dark:border-[#365C85]/60 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-[#FDF0F0] border border-[#F7C8C8] text-[#A82424] dark:bg-[#311A23] dark:border-[#542533] dark:text-[#F87171] text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#A82424] dark:text-[#F87171] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-[#EBF5EE] border border-[#C3E6D0] text-[#1E6B42] dark:bg-[#132B22] dark:border-[#1F4A38] dark:text-[#4ADE80] text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {loading && accounts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="h-7 w-7 text-amber-500 dark:text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8]">Loading bank accounts from core ledger...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5A6B7C] dark:text-[#94A3B8] space-y-1">
              <p className="font-semibold text-[#1A2530] dark:text-[#F1F5F9]">No matching accounts found</p>
              <p>Try refining your search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#D8DFE7] dark:border-[#263B54]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#D8DFE7] dark:border-[#263B54] bg-[#F0F4F8] dark:bg-[#182538] text-[11px] font-bold text-[#5A6B7C] dark:text-[#94A3B8] uppercase tracking-wider">
                    <th className="py-3 px-4">Account Holder</th>
                    <th className="py-3 px-4">Account ID</th>
                    <th className="py-3 px-4">Ledger Balance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EDF2] dark:divide-[#263B54]/60">
                  {filteredAccounts.map((acc) => {
                    const isFrozen = acc.status === "frozen";
                    const isUpdating = updatingId === acc._id;

                    return (
                      <tr
                        key={acc._id}
                        className="hover:bg-[#F5F7FA] dark:hover:bg-[#203044] transition-colors"
                      >
                        {/* User Details */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-[#E8EDF2] border border-[#D8DFE7] dark:bg-[#243448] dark:border-[#365C85]/50 flex items-center justify-center text-xs font-bold text-[#2C3E50] dark:text-[#F1F5F9]">
                              {acc.user?.name ? acc.user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1A2530] dark:text-[#F1F5F9] flex items-center gap-1.5">
                                {acc.user?.name || "Unknown"}
                                {acc.user?.systemUser && (
                                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#FFF9EB] text-[#966007] border border-[#FCE5B2] dark:bg-[#332514] dark:text-[#FBBF24] dark:border-[#573D1E] font-bold">
                                    Manager
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-[#5A6B7C] dark:text-[#94A3B8]">
                                {acc.user?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Account ID */}
                        <td className="py-3 px-4 font-mono text-[#5A6B7C] dark:text-[#94A3B8] text-[11px]">
                          {acc._id}
                        </td>

                        {/* Balance */}
                        <td className="py-3 px-4 font-mono font-bold text-[#1A2530] dark:text-[#F1F5F9]">
                          ₹{" "}
                          {acc.balance?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isFrozen
                                ? "bg-[#FDF0F0] text-[#A82424] border-[#F7C8C8] dark:bg-[#311A23] dark:text-[#F87171] dark:border-[#542533]"
                                : "bg-[#EBF5EE] text-[#1E6B42] border-[#C3E6D0] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38]"
                            }`}
                          >
                            {isFrozen ? (
                              <>
                                <Lock className="h-3 w-3" />
                                Frozen
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-3 w-3" />
                                Active
                              </>
                            )}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(acc)}
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-xs ${
                              isFrozen
                                ? "bg-[#EBF5EE] text-[#1E6B42] hover:bg-[#DDF0E3] border-[#C3E6D0] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38] dark:hover:bg-[#18362B]"
                                : "bg-[#FDF0F0] text-[#A82424] hover:bg-[#FCE0E0] border-[#F7C8C8] dark:bg-[#311A23] dark:text-[#F87171] dark:border-[#542533] dark:hover:bg-[#451C28]"
                            } disabled:opacity-50`}
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isFrozen ? (
                              <>
                                <Unlock className="h-3.5 w-3.5" />
                                Unfreeze
                              </>
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" />
                                Freeze Account
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D8DFE7] dark:border-[#263B54] bg-[#F8FAFC]/50 dark:bg-[#15202E]/50 flex items-center justify-between text-xs text-[#5A6B7C] dark:text-[#94A3B8] font-medium">
          <span>Total Accounts: {accounts.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-[#F5F7FA] text-[#2C3E50] border border-[#CBD5E1] dark:bg-[#1E2C3D] dark:hover:bg-[#243448] dark:text-[#E2E8F0] dark:border-[#365C85]/60 shadow-xs transition-colors cursor-pointer font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
