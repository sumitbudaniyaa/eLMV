import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SERVER_URL_KEY = "lm_custom_server_url";

// Default host resolution:
// - Physical device / Expo Go on same Wi-Fi: Mac's LAN IP
// - Android Emulator: 10.0.2.2
// - iOS Simulator / Web: localhost
export const DEFAULT_LAN_IP = "192.168.29.193";

export function getDefaultBaseUrl(): string {
  if (Platform.OS === "web") {
    return "http://localhost:5001/api/v1";
  }
  return `http://${DEFAULT_LAN_IP}:5001/api/v1`;
}

export async function getSavedBaseUrl(): Promise<string> {
  try {
    const saved = await SecureStore.getItemAsync(SERVER_URL_KEY);
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  } catch (err) {
    console.warn("Could not read custom server URL from storage:", err);
  }
  return getDefaultBaseUrl();
}

export async function setSavedBaseUrl(url: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SERVER_URL_KEY, url.trim());
  } catch (err) {
    console.warn("Could not save server URL to storage:", err);
  }
}

