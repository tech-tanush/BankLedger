import React, { useState } from "react";
import Navbar from "../components/Navbar";
import BalanceCard from "../components/BalanceCard";
import DigitalBankCard from "../components/DigitalBankCard";
import QuickPayees from "../components/QuickPayees";
import StatementTable from "../components/StatementTable";
import TransferModal from "../components/TransferModal";
import CashCounterModal from "../components/CashCounterModal";
import AccountGovernanceModal from "../components/AccountGovernanceModal";
import { useAuth } from "../context/AuthContext";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Banknote,
  Shield,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const { selectedAccount, accounts, user } = useAuth();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferMode, setTransferMode] = useState("transfer"); // "transfer" | "withdraw"
  const [transferRecipient, setTransferRecipient] = useState("");
  const [cashCounterModalOpen, setCashCounterModalOpen] = useState(false);
  const [governanceModalOpen, setGovernanceModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefreshAll = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenTransfer = (mode = "transfer", prefill = "") => {
    setTransferMode(mode);
    setTransferRecipient(prefill);
    setTransferModalOpen(true);
  };

  const handleSelectPayee = (payee) => {
    handleOpenTransfer("transfer", payee.email || payee.accountId);
  };

  const isFrozen = selectedAccount?.status === "frozen";

  return (
    <div className="min-h-screen theme-main-bg text-[#1A2530] dark:text-[#F1F5F9] flex flex-col selection:bg-slate-200 dark:selection:bg-slate-700 selection:text-slate-900 dark:selection:text-white transition-colors duration-200">
      <Navbar
        onOpenTransfer={() => handleOpenTransfer("transfer")}
        onOpenCashCounter={() => setCashCounterModalOpen(true)}
        onOpenGovernance={() => setGovernanceModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {accounts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl theme-card-bg border border-[#D8DFE7] dark:border-[#2A3C52] space-y-3 shadow-xs">
            <ShieldAlert className="h-10 w-10 text-amber-500 dark:text-amber-400 mx-auto" />
            <h3 className="text-lg font-semibold text-[#1A2530] dark:text-[#F1F5F9]">No Active Accounts Found</h3>
            <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8] max-w-sm mx-auto">
              Please click "New Account" in the top navigation bar to open your primary bank account.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column (8 cols): Primary Financial Operations */}
            <div className="lg:col-span-8 space-y-6">
              {/* Balance Hero & Quick Transfer */}
              <BalanceCard
                onOpenTransfer={(mode) => handleOpenTransfer(mode)}
                refreshTrigger={refreshTrigger}
              />

              {/* Quick-Send Contacts Carousel */}
              <QuickPayees
                onSelectPayee={handleSelectPayee}
                refreshTrigger={refreshTrigger}
              />

              {/* Comprehensive Statement Audit Table */}
              <StatementTable refreshTrigger={refreshTrigger} />
            </div>

            {/* Right Column (4 cols): Institutional Card & Security Vault */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              {/* Metallic Virtual Debit / Account Card */}
              <DigitalBankCard onOpenTransfer={(mode) => handleOpenTransfer(mode)} />

              {/* Institutional Vault & Compliance Widget */}
              <div className="p-5 rounded-2xl theme-card-bg border border-[#D8DFE7] dark:border-[#2A3C52] space-y-4 shadow-sm transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#455D76] dark:text-[#8EB0D4]" />
                    <h4 className="text-xs font-bold text-[#1A2530] dark:text-[#F1F5F9] uppercase tracking-wider">
                      Security & Compliance
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#1E6B42] border border-[#C3E6D0] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38]">
                    Tier 1
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* 2FA Status */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F7FA] border border-[#D8DFE7] dark:bg-[#182538] dark:border-[#263B54]">
                    <div className="flex items-center gap-2 text-[#2C3E50] dark:text-[#E2E8F0]">
                      <Lock className="h-3.5 w-3.5 text-[#455D76] dark:text-[#8EB0D4]" />
                      <span>2FA Authorization</span>
                    </div>
                    <span className="font-semibold text-[#455D76] dark:text-[#8EB0D4] text-[11px]">
                      Active for ₹50k+
                    </span>
                  </div>

                  {/* Daily Transfer Capacity */}
                  <div className="p-2.5 rounded-xl bg-[#F5F7FA] border border-[#D8DFE7] dark:bg-[#182538] dark:border-[#263B54] space-y-1.5">
                    <div className="flex items-center justify-between text-[#2C3E50] dark:text-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Daily Settlement Limit</span>
                      </div>
                      <span className="font-bold text-[#1A2530] dark:text-[#F1F5F9] text-[11px]">₹ 10,00,000</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#D8DFE7] dark:bg-[#263B54] rounded-full overflow-hidden">
                      <div className="h-full bg-[#455D76] dark:bg-[#527BA8] rounded-full w-1/4" />
                    </div>
                  </div>

                  {/* Manager Fast Actions */}
                  {user?.systemUser && (
                    <div className="pt-2 border-t border-[#D8DFE7] dark:border-[#263B54] space-y-2">
                      <p className="text-[10px] uppercase font-bold text-[#5A6B7C] dark:text-[#94A3B8] tracking-wider">
                        Manager Actions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setCashCounterModalOpen(true)}
                          className="p-2.5 rounded-xl bg-[#EBF5EE] hover:bg-[#DDF0E3] text-[#1E6B42] border border-[#C3E6D0] dark:bg-[#132B22] dark:hover:bg-[#18362B] dark:text-[#4ADE80] dark:border-[#1F4A38] flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                        >
                          <Banknote className="h-3.5 w-3.5" />
                          Till Drawer
                        </button>
                        <button
                          onClick={() => setGovernanceModalOpen(true)}
                          className="p-2.5 rounded-xl bg-[#FFF9EB] hover:bg-[#FEF1D3] text-[#966007] border border-[#FCE5B2] dark:bg-[#332514] dark:hover:bg-[#42301A] dark:text-[#FBBF24] dark:border-[#573D1E] flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          Controls
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => {
          setTransferModalOpen(false);
          setTransferRecipient("");
        }}
        mode={transferMode}
        initialRecipient={transferRecipient}
        onSuccess={handleRefreshAll}
      />

      <CashCounterModal
        isOpen={cashCounterModalOpen}
        onClose={() => setCashCounterModalOpen(false)}
        onSuccess={handleRefreshAll}
      />

      <AccountGovernanceModal
        isOpen={governanceModalOpen}
        onClose={() => setGovernanceModalOpen(false)}
        onStatusChanged={handleRefreshAll}
      />
    </div>
  );
}
