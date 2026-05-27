import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  authProvider: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => void;
  logout: (redirectUri?: string) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cachedUser = localStorage.getItem("mockmate-user");
    const expiry = localStorage.getItem("mockmate-session-expiry");
    if (cachedUser && expiry && Date.now() < parseInt(expiry)) {
      try {
        return JSON.parse(cachedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const cachedUser = localStorage.getItem("mockmate-user");
    const expiry = localStorage.getItem("mockmate-session-expiry");
    return !!(cachedUser && expiry && Date.now() < parseInt(expiry));
  });

  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      // Axios instance automatically sends the session cookie due to withCredentials: true
      const response = await api.get("/user/me");
      if (response.data) {
        setUser(response.data);
        setIsLoggedIn(true);
        localStorage.setItem("mockmate-user", JSON.stringify(response.data));
        localStorage.setItem("mockmate-session-expiry", String(Date.now() + 3600 * 1000));
      } else {
        // Fallback to local session cache if backend says session expired but local 1-hr session is still active
        const cachedUser = localStorage.getItem("mockmate-user");
        const expiry = localStorage.getItem("mockmate-session-expiry");
        if (cachedUser && expiry && Date.now() < parseInt(expiry)) {
          setUser(JSON.parse(cachedUser));
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
          localStorage.removeItem("mockmate-user");
          localStorage.removeItem("mockmate-session-expiry");
        }
      }
    } catch (error) {
      // Fallback to local session cache on network/server errors
      const cachedUser = localStorage.getItem("mockmate-user");
      const expiry = localStorage.getItem("mockmate-session-expiry");
      if (cachedUser && expiry && Date.now() < parseInt(expiry)) {
        try {
          setUser(JSON.parse(cachedUser));
          setIsLoggedIn(true);
        } catch {
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("mockmate-user");
        localStorage.removeItem("mockmate-session-expiry");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = () => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
    const baseUrl = apiBaseUrl.replace(/\/api$/, "");
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  const logout = (redirectUri?: string) => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("mockmate-user");
    localStorage.removeItem("mockmate-session-expiry");
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
    const baseUrl = apiBaseUrl.replace(/\/api$/, "");
    
    let url = `${baseUrl}/logout`;
    if (redirectUri) {
      url += `?redirect_uri=${encodeURIComponent(redirectUri)}`;
    }
    window.location.href = url;
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
