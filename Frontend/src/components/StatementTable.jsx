import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  Receipt,
  Download,
  Printer,
  Search,
  ExternalLink,
} from "lucide-react";
import TransactionReceiptModal from "./TransactionReceiptModal";

export default function StatementTable({ refreshTrigger }) {
  const { selectedAccount, user } = useAuth();
  const [statement, setStatement] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);

  // Filters & Search
  const [filterType, setFilterType] = useState("all"); // "all" | "credit" | "debit"
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStatement = async (page = 1) => {
    if (!selectedAccount?._id) return;
    setLoading(true);
    try {
      const res = await API.get(
        `/api/accounts/statement/${selectedAccount._id}?page=${page}&limit=20`
      );
      setStatement(res.data.statement || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1 });
      setCurrentBalance(res.data.currentBalance || 0);
    } catch (err) {
      console.error("Statement fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatement(1);
  }, [selectedAccount, refreshTrigger]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Null-safe list
  const safeStatement = Array.isArray(statement) ? statement : [];

  // Filtered rows
  const filteredStatement = safeStatement.filter((entry) => {
    if (!entry) return false;
    if (filterType !== "all" && entry.type !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const txId = String(
        entry.transaction?._id ||
          (typeof entry.transaction === "string" ? entry.transaction : "")
      ).toLowerCase();
      const amountStr = String(entry.amount || "");
      if (!txId.includes(q) && !amountStr.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Calculate Inflow and Outflow for current view
  const totalInflow = safeStatement
    .filter((e) => e && e.type === "credit")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalOutflow = safeStatement
    .filter((e) => e && e.type === "debit")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // CSV Exporter
  const handleExportCSV = () => {
    if (safeStatement.length === 0) return;

    const headers = [
      "Ledger Entry ID",
      "Transaction ID",
      "Type",
      "Amount (INR)",
      "Date & Time",
      "Status",
    ];
    const rows = safeStatement.map((entry) => {
      const txId =
        entry?.transaction?._id ||
        (typeof entry?.transaction === "string" ? entry.transaction : "N/A");
      return [
        `"${entry?._id || ""}"`,
        `"${txId}"`,
        `"${(entry?.type || "").toUpperCase()}"`,
        entry?.amount || 0,
        `"${entry?.createdAt ? new Date(entry.createdAt).toISOString() : ""}"`,
        `"${entry?.transaction?.status || "COMPLETED"}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `BankLedger_Statement_${selectedAccount?._id?.slice(0, 8)}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Official PDF Print Generator
  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <>
      <div className="rounded-2xl theme-card-bg border border-[#D8DFE7] dark:border-[#2D425A] shadow-sm overflow-hidden transition-colors duration-200">
        {/* Table Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[#D8DFE7] dark:border-[#263B54] bg-[#F5F7FA]/70 dark:bg-[#182538]/70 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E8EDF2] text-[#455D76] border border-[#CBD5E1] dark:bg-[#243448] dark:text-[#8EB0D4] dark:border-[#365C85]/50">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#1A2530] dark:text-[#F1F5F9] tracking-tight">
                  Core Ledger Audit Statement
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#1E6B42] border border-[#C3E6D0] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38]">
                  Double-Entry
                </span>
              </div>
              <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8]">
                Tamper-evident record of all debits and credits on account{" "}
                <span className="font-mono text-[#1A2530] dark:text-[#F1F5F9] font-semibold">
                  {selectedAccount?._id ? `${selectedAccount._id.slice(0, 8)}...` : ""}
                </span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={statement.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F7FA] text-[#2C3E50] border border-[#CBD5E1] dark:bg-[#1E2C3D] dark:hover:bg-[#243448] dark:text-[#E2E8F0] dark:border-[#365C85]/60 transition-colors cursor-pointer shadow-xs disabled:opacity-40"
              title="Download CSV Statement"
            >
              <Download className="h-3.5 w-3.5 text-[#5A6B7C] dark:text-[#94A3B8]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrintStatement}
              disabled={statement.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F7FA] text-[#2C3E50] border border-[#CBD5E1] dark:bg-[#1E2C3D] dark:hover:bg-[#243448] dark:text-[#E2E8F0] dark:border-[#365C85]/60 transition-colors cursor-pointer shadow-xs disabled:opacity-40"
              title="Print Official Statement"
            >
              <Printer className="h-3.5 w-3.5 text-[#5A6B7C] dark:text-[#94A3B8]" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 pl-2 border-l border-[#D8DFE7] dark:border-[#263B54]">
              <button
                onClick={() => fetchStatement(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-1.5 rounded-lg bg-white text-[#5A6B7C] hover:text-[#1A2530] border border-[#CBD5E1] dark:bg-[#182538] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] dark:border-[#263B54] disabled:opacity-30 transition-colors cursor-pointer shadow-xs"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-mono text-[#5A6B7C] dark:text-[#94A3B8] px-1 font-semibold">
                {pagination.page} / {pagination.totalPages || 1}
              </span>
              <button
                onClick={() => fetchStatement(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-1.5 rounded-lg bg-white text-[#5A6B7C] hover:text-[#1A2530] border border-[#CBD5E1] dark:bg-[#182538] dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] dark:border-[#263B54] disabled:opacity-30 transition-colors cursor-pointer shadow-xs"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3.5 px-6 border-b border-[#D8DFE7] dark:border-[#263B54] bg-[#F8FAFC] dark:bg-[#15202E] flex items-center justify-between flex-wrap gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#E8EDF2] dark:bg-[#182538] p-1 rounded-xl border border-[#D8DFE7] dark:border-[#263B54]">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === "all"
                  ? "bg-white dark:bg-[#243448] text-[#1A2530] dark:text-[#F1F5F9] shadow-xs"
                  : "text-[#5A6B7C] dark:text-[#94A3B8] hover:text-[#1A2530] dark:hover:text-[#F1F5F9]"
              }`}
            >
              All Activity
            </button>
            <button
              onClick={() => setFilterType("credit")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === "credit"
                  ? "bg-[#EBF5EE] text-[#1E6B42] border border-[#C3E6D0] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38] shadow-xs"
                  : "text-[#5A6B7C] dark:text-[#94A3B8] hover:text-[#1E6B42] dark:hover:text-[#4ADE80]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Credits (+₹{(totalInflow || 0).toLocaleString("en-IN")})
            </button>
            <button
              onClick={() => setFilterType("debit")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === "debit"
                  ? "bg-[#FDF0F0] text-[#A82424] border border-[#F7C8C8] dark:bg-[#311A23] dark:text-[#F87171] dark:border-[#542533] shadow-xs"
                  : "text-[#5A6B7C] dark:text-[#94A3B8] hover:text-[#A82424] dark:hover:text-[#F87171]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Debits (-₹{(totalOutflow || 0).toLocaleString("en-IN")})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5A6B7C] dark:text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by ID or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#CBD5E1] text-xs text-[#1A2530] placeholder:text-[#5A6B7C]/60 focus:outline-none focus:border-[#455D76] dark:bg-[#182538] dark:border-[#2A3C52] dark:text-[#F1F5F9] dark:placeholder:text-[#94A3B8]/60 dark:focus:border-[#527BA8] transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#5A6B7C] dark:text-[#94A3B8] flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#455D76] dark:bg-[#8EB0D4] animate-ping" />
              Syncing ledger entries...
            </div>
          ) : filteredStatement.length === 0 ? (
            <div className="py-16 text-center space-y-1">
              <Clock className="h-8 w-8 text-[#5A6B7C] dark:text-[#94A3B8] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-[#1A2530] dark:text-[#F1F5F9]">No transactions found</p>
              <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8]">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your filter or search query"
                  : "Transactions on this account will be recorded here"}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#D8DFE7] dark:border-[#263B54] text-[11px] font-bold text-[#5A6B7C] dark:text-[#94A3B8] uppercase tracking-wider bg-[#F0F4F8] dark:bg-[#182538]">
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6 hidden sm:table-cell">Transaction Ref</th>
                  <th className="py-3.5 px-6 text-right">Date & Time</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF2] dark:divide-[#263B54]/60">
                {filteredStatement.map((entry) => {
                  const isCredit = entry.type === "credit";
                  const txId =
                    entry.transaction?._id ||
                    (typeof entry.transaction === "string" ? entry.transaction : null);

                  return (
                    <tr
                      key={entry._id}
                      onClick={() => {
                        if (txId) setSelectedTxId(txId);
                      }}
                      className={`transition-colors ${
                        txId
                          ? "hover:bg-[#F5F7FA] dark:hover:bg-[#203044] cursor-pointer group"
                          : "hover:bg-[#F5F7FA]/60 dark:hover:bg-[#203044]/60"
                      }`}
                    >
                      {/* Type Badge */}
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isCredit
                              ? "bg-[#EBF5EE] text-[#1E6B42] border-[#C3E6D0] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38]"
                              : "bg-[#FDF0F0] text-[#A82424] border-[#F7C8C8] dark:bg-[#311A23] dark:text-[#F87171] dark:border-[#542533]"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          )}
                          {isCredit ? "Credit (Inflow)" : "Debit (Outflow)"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-6 font-mono font-bold text-sm tracking-tight tabular-nums">
                        <span
                          className={isCredit ? "text-emerald-700 dark:text-[#4ADE80]" : "text-[#A82424] dark:text-[#F87171]"}
                        >
                          {isCredit ? "+" : "-"} ₹{" "}
                          {entry.amount?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Transaction Reference ID */}
                      <td className="py-3.5 px-6 hidden sm:table-cell font-mono text-[11px]">
                        {txId ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#E8EDF2] text-[#455D76] border border-[#CBD5E1] dark:bg-[#182538] dark:text-[#8EB0D4] dark:border-[#263B54] group-hover:border-[#455D76] dark:group-hover:border-[#527BA8] transition-colors">
                            <Receipt className="h-3 w-3 text-[#455D76] dark:text-[#8EB0D4]" />
                            <span className="truncate max-w-[150px]">{txId}</span>
                          </span>
                        ) : (
                          <span className="text-[#5A6B7C] dark:text-[#94A3B8]">—</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-6 text-right text-[#5A6B7C] dark:text-[#94A3B8] font-mono text-[11px] tabular-nums">
                        {formatDate(entry.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-6 text-right">
                        {txId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTxId(txId);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white hover:bg-[#F5F7FA] text-[#2C3E50] hover:text-[#1A2530] border border-[#CBD5E1] dark:bg-[#1E2C3D] dark:hover:bg-[#243448] dark:text-[#E2E8F0] dark:border-[#365C85]/60 transition-all cursor-pointer shadow-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Receipt</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={Boolean(selectedTxId)}
        transactionId={selectedTxId}
        onClose={() => setSelectedTxId(null)}
      />
    </>
  );
}
