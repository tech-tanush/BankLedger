import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen theme-main-bg text-[#1A2530] dark:text-[#F1F5F9] flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl theme-card-bg border border-[#CBD5E1] dark:border-[#2D425A] shadow-xl text-center space-y-4">
            <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 w-12 h-12 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/50">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h2 className="text-lg font-bold text-[#1A2530] dark:text-[#F1F5F9]">Something went wrong</h2>
            <p className="text-xs text-[#5A6B7C] dark:text-[#94A3B8]">
              The application encountered an unexpected runtime error:
            </p>

            <div className="p-3 rounded-xl bg-white/60 dark:bg-[#131D2C] border border-[#CBD5E1] dark:border-[#2D425A] text-left font-mono text-[11px] text-rose-700 dark:text-rose-300 overflow-auto max-h-40">
              {this.state.error?.toString()}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-[#1B2736] hover:bg-slate-50 dark:hover:bg-[#243448] text-[#334155] dark:text-[#CBD5E1] border border-[#CBD5E1] dark:border-[#2D425A] shadow-xs transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Reset Session & Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

