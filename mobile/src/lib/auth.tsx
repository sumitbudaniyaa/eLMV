import React, { createContext, useContext, useState, useEffect } from "react";
import { mobileApi, getMobileTokens, setMobileTokens, clearMobileTokens } from "./api";
import { Role } from "@sih/shared";

export interface OfficerUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  officerProfile?: {
    badgeNumber?: string;
    jurisdictionDistrict?: string;
    jurisdictionZone?: string;
    department?: string;
  };
  gatcInspectorProfile?: {
    employeeId?: string;
    labRole?: string;
    gatc?: {
      name?: string;
      district?: string;
    };
  };
}

interface AuthContextType {
  user: OfficerUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<OfficerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const res = await mobileApi.get("/auth/me");
      const fetchedUser = res.data?.data?.user || res.data?.data;
      if (fetchedUser) {
        setUser(fetchedUser);
      }
    } catch (err) {
      console.warn("Could not fetch current profile:", err);
    }
  };

  useEffect(() => {
    async function initAuth() {
      try {
        const { accessToken } = await getMobileTokens();
        if (accessToken) {
          await refreshProfile();
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await mobileApi.post("/auth/login", {
        email: email.trim(),
        password: pass,
      });

      const { user: userData, tokens } = res.data.data;
      if (tokens?.accessToken && tokens?.refreshToken) {
        await setMobileTokens(tokens.accessToken, tokens.refreshToken);
      }
      setUser(userData);
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message;
      throw new Error(serverMsg || err.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await mobileApi.post("/auth/logout");
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      await clearMobileTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}

