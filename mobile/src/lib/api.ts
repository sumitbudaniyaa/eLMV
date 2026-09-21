import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { getDefaultBaseUrl, getSavedBaseUrl } from "./config";

export const mobileApi = axios.create({
  baseURL: getDefaultBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 15000,
});

const ACCESS_KEY = "auth_access_token";
const REFRESH_KEY = "auth_refresh_token";

export async function getMobileTokens() {
  try {
    const accessToken = await SecureStore.getItemAsync(ACCESS_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    return { accessToken, refreshToken };
  } catch (err) {
    return { accessToken: null, refreshToken: null };
  }
}

export async function setMobileTokens(access: string, refresh: string) {
  try {
    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  } catch (err) {
    console.warn("Error saving tokens to SecureStore:", err);
  }
}

export async function clearMobileTokens() {
  try {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch (err) {
    console.warn("Error clearing tokens from SecureStore:", err);
  }
}

type UnauthorizedListener = () => void;
let unauthorizedListener: UnauthorizedListener | null = null;

export function setOnUnauthorized(listener: UnauthorizedListener | null) {
  unauthorizedListener = listener;
}

// Dynamically inject latest saved base URL and Authorization token before every request
mobileApi.interceptors.request.use(async (config) => {
  const currentBaseUrl = await getSavedBaseUrl();
  config.baseURL = currentBaseUrl;

  console.log(`[MOBILE API] --> ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

  if (config.headers) {
    config.headers["ngrok-skip-browser-warning"] = "true";
  }

  const { accessToken } = await getMobileTokens();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: automatically refresh expired access tokens (15m window)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

mobileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      const { refreshToken } = await getMobileTokens();
      if (!refreshToken) {
        await clearMobileTokens();
        unauthorizedListener?.();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return mobileApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentBaseUrl = await getSavedBaseUrl();
        const refreshResponse = await axios.post(`${currentBaseUrl}/auth/refresh`, {
          refreshToken,
        });

        if (refreshResponse.data?.success && refreshResponse.data?.data) {
          const { accessToken: newAccess, refreshToken: newRefresh } =
            refreshResponse.data.data;
          await setMobileTokens(newAccess, newRefresh);
          processQueue(null, newAccess);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          }
          return mobileApi(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await clearMobileTokens();
        unauthorizedListener?.();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const targetUrl = `${originalRequest?.baseURL || ""}${originalRequest?.url || ""}`;
    console.warn(`[MOBILE API ERROR] ${error.message} on target: ${targetUrl}`);

    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      const detailedErr = new Error(`Connection timed out (15s) reaching: ${targetUrl}`);
      return Promise.reject(detailedErr);
    }

    return Promise.reject(error);
  }
);

