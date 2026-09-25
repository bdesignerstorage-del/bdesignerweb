import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import api, { formatApiErrorDetail, setStoredToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=anonymous, object=authenticated
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(false);
      setStoredToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password, options = {}) => {
    const { remember_me = false } = options || {};
    const { data } = await api.post("/auth/login", { email, password, remember_me });
    if (data?.token) setStoredToken(data.token, !!remember_me);
    setUser(data);
    return data;
  };

  const register = async (name, email, password, mobile = "", role = "client") => {
    const { data } = await api.post("/auth/register", { name, email, password, mobile, role });
    if (data?.token) setStoredToken(data.token, true);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {
      // Local token cleanup still occurs if the request fails.
    }
    setStoredToken(null);
    setUser(false);
  };

  const requireAuth = useCallback((mode = "login") => {
    if (user && user.id) return true;
    setAuthMode(mode);
    setAuthOpen(true);
    return false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh,
        requireAuth,
        authOpen,
        setAuthOpen,
        authMode,
        setAuthMode,
        formatApiErrorDetail,
        impersonating: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
