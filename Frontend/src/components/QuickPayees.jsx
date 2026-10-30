import React, { useState, useEffect } from "react";
import API from "../api";
import { Clock } from "lucide-react";

export default function QuickPayees({ onSelectPayee, refreshTrigger }) {
  const [payees, setPayees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentPayees = async () => {
      setLoading(true);
      try {
        const res = await API.get("/api/accounts/recent-payees");
        setPayees(res.data.payees || []);
      } catch (err) {
        console.error("Failed to load recent payees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPayees();
  }, [refreshTrigger]);

  if (!loading && payees.length === 0) return null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl theme-card-bg border border-[#D8DFE7] dark:border-[#2D425A] shadow-sm space-y-3 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#455D76] dark:text-[#8EB0D4]" />
          <h4 className="text-xs font-bold text-[#1A2530] dark:text-[#F1F5F9] uppercase tracking-wider">
            Quick Send • Recent Payees
          </h4>
        </div>
        <span className="text-[11px] text-[#5A6B7C] dark:text-[#94A3B8] font-medium">1-Click Transfer</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {payees.map((payee) => {
          const initials = payee.name
            ? payee.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "U";

          return (
            <button
              key={payee.email}
              onClick={() => onSelectPayee(payee)}
              className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-[#F5F7FA] dark:hover:bg-[#203044] transition-all cursor-pointer min-w-[70px] text-center"
              title={`Send to ${payee.name} (${payee.email})`}
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#455D76] to-[#607A94] dark:from-[#365C85] dark:to-[#527BA8] p-0.5 shadow-xs group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-[#E8EDF2] dark:bg-[#182538] flex items-center justify-center text-xs font-bold text-[#2C3E50] dark:text-[#E2E8F0]">
                  {initials}
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#2C3E50] dark:text-[#E2E8F0] truncate max-w-[75px] group-hover:text-[#455D76] dark:group-hover:text-[#8EB0D4]">
                {payee.name ? payee.name.split(" ")[0] : "User"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
