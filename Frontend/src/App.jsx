import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import { Loader2 } from "lucide-react";

function MainContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen theme-main-bg text-[#1A2530] dark:text-[#F1F5F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo-icon.png" alt="BankLedger" className="h-12 w-12 object-contain animate-pulse" />
          <p className="text-xs font-mono text-[#5A6B7C] dark:text-[#94A3B8]">Loading BankLedger Core...</p>
        </div>
      </div>
    );
  }

  return user ? <DashboardPage /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
