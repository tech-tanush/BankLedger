import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Landmark, Shield, ArrowRight, Lock, Mail, User, Eye, EyeOff, AlertCircle, Sun, Moon } from "lucide-react";

export default function AuthPage() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        await register(name, email, password);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row theme-main-bg text-[#1A2530] dark:text-[#F1F5F9] selection:bg-[#527BA8]/20 selection:text-[#182538]">
      {/* Left Banner (FinTech Showcase) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#E8EDF2] via-[#F1F5F9] to-[#F8FAFC] dark:from-[#182538] dark:via-[#1B2736] dark:to-[#263B54] p-12 flex-col justify-between border-r border-[#CBD5E1] dark:border-[#2D425A]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#455D76]/5 dark:bg-[#365C85]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#607A94]/5 dark:bg-[#527BA8]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/logo-icon.png"
            alt="BankLedger"
            className="h-12 w-12 object-contain rounded-2xl shadow-md border border-[#CBD5E1]/50 dark:border-[#2D425A]"
          />
          <div>
            <span className="text-2xl font-extrabold tracking-tight text-[#1A2530] dark:text-white leading-none">
              Bank<span className="text-[#455D76] dark:text-[#7EA2C7]">Ledger</span>
            </span>
            <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8] tracking-wider font-medium mt-1">
              Accounts • Transactions • Trust
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#455D76]/10 dark:bg-[#365C85]/20 text-[#455D76] dark:text-[#7EA2C7] border border-[#455D76]/20 dark:border-[#365C85]/40">
            <Shield className="h-3.5 w-3.5" />
            Institutional Banking Ledger
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#1A2530] dark:text-white leading-tight">
            Next-Generation Core Banking & Financial Ledger
          </h1>

          <p className="text-sm text-[#5A6B7C] dark:text-[#94A3B8] leading-relaxed">
            Engineered with strict double-entry accounting principles, tamper-proof audit trails, and atomic concurrency locks that guarantee zero balance drift.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#CBD5E1] dark:border-[#2D425A]">
            <div>
              <p className="text-xs font-bold text-[#455D76] dark:text-[#7EA2C7] uppercase tracking-wider">Secure</p>
              <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8] mt-0.5">Your data, our priority</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#455D76] dark:text-[#7EA2C7] uppercase tracking-wider">Efficient</p>
              <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8] mt-0.5">Faster operations</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#455D76] dark:text-[#7EA2C7] uppercase tracking-wider">Transparent</p>
              <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8] mt-0.5">Clear. Simple. Reliable.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#455D76] dark:text-[#7EA2C7] uppercase tracking-wider">Built for Banks</p>
              <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8] mt-0.5">Inside. Not for customers.</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#5A6B7C] dark:text-[#64748B]">
          © {new Date().getFullYear()} BankLedger. Accounts • Transactions • Trust.
        </p>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative theme-main-bg">
        {/* Theme switcher toggle */}
        <div className="absolute top-6 right-6">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#CBD5E1] dark:border-[#2D425A] bg-white/80 dark:bg-[#1B2736]/80 text-xs font-semibold text-[#5A6B7C] dark:text-[#94A3B8] hover:text-[#1A2530] dark:hover:text-white transition-all cursor-pointer shadow-xs"
            title={theme === "dark" ? "Switch to Warm Corporate (Light Mode)" : "Switch to Midnight Executive (Dark Mode)"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 text-[#F1F5F9]" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[#455D76]" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full max-w-md space-y-7 theme-card-bg p-8 sm:p-10 rounded-2xl border border-[#CBD5E1] dark:border-[#2D425A] shadow-lg shadow-black/5 dark:shadow-black/20">
          <div>
            <div className="flex lg:hidden items-center gap-2.5 mb-6">
              <img
                src="/logo-icon.png"
                alt="BankLedger"
                className="h-9 w-9 object-contain rounded-xl shadow-xs"
              />
              <span className="text-xl font-extrabold tracking-tight text-[#1A2530] dark:text-white leading-none">
                Bank<span className="text-[#455D76] dark:text-[#7EA2C7]">Ledger</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A2530] dark:text-white">
              {isLogin ? "Welcome back" : "Create an account"}
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6B7C] dark:text-[#94A3B8] mt-1.5">
              {isLogin
                ? "Sign in to manage your bank accounts and transfers."
                : "Open a secure ledger account in seconds."}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-[#334155] dark:text-[#CBD5E1] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] dark:text-[#64748B]" />
                  <input
                    type="text"
                    required
                    placeholder="Alice Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#15202E] border border-[#CBD5E1] dark:border-[#2A3C52] text-sm font-medium text-[#1A2530] dark:text-[#F1F5F9] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#455D76] dark:focus:border-[#527BA8] focus:ring-1 focus:ring-[#455D76]/20 dark:focus:ring-[#527BA8]/20 transition-colors shadow-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#334155] dark:text-[#CBD5E1] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] dark:text-[#64748B]" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#15202E] border border-[#CBD5E1] dark:border-[#2A3C52] text-sm font-medium text-[#1A2530] dark:text-[#F1F5F9] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#455D76] dark:focus:border-[#527BA8] focus:ring-1 focus:ring-[#455D76]/20 dark:focus:ring-[#527BA8]/20 transition-colors shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] dark:text-[#CBD5E1] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] dark:text-[#64748B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#15202E] border border-[#CBD5E1] dark:border-[#2A3C52] text-sm font-medium text-[#1A2530] dark:text-[#F1F5F9] placeholder:text-[#94A3B8] dark:placeholder:text-[#64748B] focus:outline-none focus:border-[#455D76] dark:focus:border-[#527BA8] focus:ring-1 focus:ring-[#455D76]/20 dark:focus:ring-[#527BA8]/20 transition-colors shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-[#64748B] hover:text-[#334155] dark:hover:text-[#CBD5E1] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm theme-btn-gradient text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2">
            <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8]">
              {isLogin ? "Don't have an account yet?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="font-semibold text-[#455D76] hover:text-[#33475B] dark:text-[#7EA2C7] dark:hover:text-[#9BB8D7] transition-colors cursor-pointer"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
