"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  register: (email: string, name: string) => Promise<boolean>;
  verifyCode: (email: string, code: string, isRegistration?: boolean, name?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for user session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "login" }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to send code");
      }

      if (data.debugCode) {
        console.log("Development Mode - Verification Code:", data.debugCode);
        alert(`Development Mode: Ваш код подтверждения ${data.debugCode}`);
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, name: string) => {
    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, type: "register" }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to send code");
      }

      if (data.debugCode) {
        console.log("Development Mode - Verification Code:", data.debugCode);
        alert(`Development Mode: Ваш код подтверждения ${data.debugCode}`);
      }

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const verifyCode = async (email: string, code: string, isRegistration = false, name = "") => {
    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, isRegistration, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Invalid code");
      }

      const data = await response.json();
      const userData = data.user;
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, verifyCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
