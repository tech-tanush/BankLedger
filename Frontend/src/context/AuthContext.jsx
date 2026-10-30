import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch accounts whenever user logs in
  const refreshAccounts = async () => {
    try {
      const res = await API.get("/api/accounts");
      const list = res.data.accounts || [];
      setAccounts(list);
      if (list.length > 0) {
        setSelectedAccount((prev) => {
          if (!prev) return list[0];
          const found = list.find((a) => a._id === prev._id);
          return found || list[0];
        });
      } else {
        setSelectedAccount(null);
      }
      return list;
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setAccounts([]);
        setSelectedAccount(null);
      }
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      refreshAccounts().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const login = async (email, password) => {
    const res = await API.post("/api/auth/login", { email, password });
    const { user: userData, token } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await API.post("/api/auth/register", { name, email, password });
    const { user: userData, token } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // Auto-create initial account for new customer
    try {
      await API.post("/api/accounts", { currency: "INR" });
    } catch (e) {
      console.error("Initial account creation error:", e);
    }
    return userData;
  };

  const logout = async () => {
    try {
      await API.post("/api/auth/logout");
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setAccounts([]);
      setSelectedAccount(null);
    }
  };

  const createAccount = async (currency = "INR") => {
    const res = await API.post("/api/accounts", { currency });
    await refreshAccounts();
    return res.data.account;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accounts,
        selectedAccount,
        setSelectedAccount,
        loading,
        login,
        register,
        logout,
        refreshAccounts,
        createAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

