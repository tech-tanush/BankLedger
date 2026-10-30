import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Landmark, LogOut, Plus, Wallet, Banknote, Shield, Sun, Moon } from "lucide-react";

export default function Navbar({
  onOpenTransfer,
  onOpenCashCounter,
  onOpenGovernance,
}) {
  const { user, logout, createAccount, accounts } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-[#D8DFE7] dark:border-[#263B54] bg-white/95 dark:bg-[#1B2736]/95 backdrop-blur-md shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src="/logo-icon.png"
            alt="BankLedger Emblem"
            className="h-10 w-10 object-contain rounded-xl shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-[#1A2530] dark:text-[#F1F5F9] leading-none">
                Bank<span className="text-[#455D76] dark:text-[#8EB0D4]">Ledger</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E8EDF2] dark:bg-[#243448] text-[#455D76] dark:text-[#8EB0D4] border border-[#CBD5E1] dark:border-[#365C85]/50 leading-none">
                Core
              </span>
            </div>
            <p className="text-[10px] text-[#5A6B7C] dark:text-[#94A3B8] tracking-wider font-semibold leading-none mt-1 hidden sm:block">
              Accounts • Transactions • Trust
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user?.systemUser && (
            <>
              <button
                onClick={onOpenCashCounter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EBF5EE] text-[#1E6B42] border border-[#C3E6D0] hover:bg-[#DDF0E3] dark:bg-[#132B22] dark:text-[#4ADE80] dark:border-[#1F4A38] dark:hover:bg-[#18362B] transition-all cursor-pointer shadow-xs"
              >
                <Banknote className="h-4 w-4" />
                Cash Counter
              </button>

              <button
                onClick={onOpenGovernance}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFF9EB] text-[#966007] border border-[#FCE5B2] hover:bg-[#FEF1D3] dark:bg-[#332514] dark:text-[#FBBF24] dark:border-[#573D1E] dark:hover:bg-[#42301A] transition-all cursor-pointer shadow-xs"
              >
                <Shield className="h-4 w-4" />
                Account Controls
              </button>
            </>
          )}

          <button
            onClick={() => createAccount("INR")}
            title="Create another account"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-[#F5F7FA] text-[#2C3E50] border border-[#CBD5E1] dark:bg-[#243448] dark:hover:bg-[#2D425A] dark:text-[#E2E8F0] dark:border-[#365C85]/60 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 text-[#5A6B7C] dark:text-[#94A3B8]" />
            New Account
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Warm Corporate (Light Mode)" : "Switch to Midnight Executive (Dark Mode)"}
            className="p-2 rounded-lg text-[#5A6B7C] dark:text-[#94A3B8] hover:text-[#1A2530] dark:hover:text-[#F1F5F9] hover:bg-[#E8EDF2] dark:hover:bg-[#243448] transition-colors cursor-pointer border border-[#D8DFE7] dark:border-[#263B54]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-300" />
            ) : (
              <Moon className="h-4 w-4 text-[#455D76]" />
            )}
          </button>

          {/* User Profile Info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#D8DFE7] dark:border-[#263B54]">
            <div className="h-8 w-8 rounded-full bg-[#E8EDF2] border border-[#D8DFE7] dark:bg-[#243448] dark:border-[#365C85]/50 flex items-center justify-center text-xs font-bold text-[#2C3E50] dark:text-[#F1F5F9]">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-[#1A2530] dark:text-[#F1F5F9] leading-none">
                {user?.name}
              </p>
              <p className="text-[11px] text-[#5A6B7C] dark:text-[#94A3B8] leading-none mt-1">
                {user?.email}
              </p>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-[#5A6B7C] dark:text-[#94A3B8] hover:text-[#A82424] dark:hover:text-[#F87171] hover:bg-[#FDF0F0] dark:hover:bg-[#311A23] transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
