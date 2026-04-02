import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, User } from "../../api/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  googleLogin: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: if we have a token, verify it and load the user
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { setIsLoading(false); return; }
    authApi.getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("access_token"))
      .finally(() => setIsLoading(false));
  }, []);

  const saveSession = (accessToken: string, userData: User) => {
    localStorage.setItem("access_token", accessToken);
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    saveSession(res.access_token, res.user);
  };

  const register = async (email: string, password: string) => {
    const res = await authApi.register(email, password);
    saveSession(res.access_token, res.user);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem("access_token");
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    await authApi.resetPassword(email, otp, newPassword);
  };

  const googleLogin = async (code: string) => {
    const res = await authApi.googleLogin(code);
    saveSession(res.access_token, res.user);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, forgotPassword, resetPassword, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
