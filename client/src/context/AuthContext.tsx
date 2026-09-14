import React, { createContext, useContext, useState, useEffect } from "react";
import { api, getStoredTokens, setStoredTokens, clearStoredTokens } from "@/lib/api";
import { ApiResponse, UserSummary } from "@sih/shared";

interface UserProfile extends UserSummary {
  stakeholderProfile?: any;
  gatcProfile?: any;
  gatcInspectorProfile?: any;
  officerProfile?: any;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<UserProfile>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredTokens().accessToken);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get<ApiResponse<UserProfile>>("/auth/me");
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
      }
    } catch {
      setUser(null);
      clearStoredTokens();
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (accessToken) {
      setToken(accessToken);
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await api.post<ApiResponse<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string } }>>(
        "/auth/login",
        credentials
      );

      if (res.data.success && res.data.data) {
        const { user: loggedInUser, tokens } = res.data.data;
        setStoredTokens(tokens.accessToken, tokens.refreshToken);
        setToken(tokens.accessToken);
        setUser(loggedInUser);
        return loggedInUser;
      } else {
        throw new Error(res.data.error?.message || "Login failed");
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message;
      throw new Error(serverMsg || err.message || "Login failed");
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.post<ApiResponse<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string } }>>(
        "/auth/register",
        data
      );

      if (res.data.success && res.data.data) {
        const { user: registeredUser, tokens } = res.data.data;
        setStoredTokens(tokens.accessToken, tokens.refreshToken);
        setToken(tokens.accessToken);
        setUser(registeredUser);
      } else {
        throw new Error(res.data.error?.message || "Registration failed");
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message;
      throw new Error(serverMsg || err.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      const { refreshToken } = getStoredTokens();
      await api.post("/auth/logout", { refreshToken });
    } catch {
      // Ignore network failures on logout
    } finally {
      clearStoredTokens();
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile: fetchProfile,
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
