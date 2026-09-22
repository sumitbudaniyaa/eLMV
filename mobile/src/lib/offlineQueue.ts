import * as SecureStore from "expo-secure-store";
import { mobileApi } from "./api";

const OFFLINE_QUEUE_KEY = "offline_inspections_queue";

export interface OfflineInspectionItem {
  id: string;
  applicationId: string;
  applicationNumber: string;
  instrumentSerial?: string;
  isPassed: boolean;
  payload: any;
  createdAt: string;
}

export async function getOfflineInspections(): Promise<OfflineInspectionItem[]> {
  try {
    const raw = await SecureStore.getItemAsync(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Error reading offline inspections queue:", err);
    return [];
  }
}

export async function saveOfflineInspection(item: Omit<OfflineInspectionItem, "id" | "createdAt">): Promise<OfflineInspectionItem> {
  const current = await getOfflineInspections();
  const newItem: OfflineInspectionItem = {
    ...item,
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...current];
  try {
    await SecureStore.setItemAsync(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Error saving inspection to offline queue:", err);
  }
  return newItem;
}

export async function removeOfflineInspection(id: string): Promise<void> {
  const current = await getOfflineInspections();
  const filtered = current.filter((item) => item.id !== id);
  try {
    await SecureStore.setItemAsync(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Error removing offline inspection:", err);
  }
}

export async function getOfflineQueueCount(): Promise<number> {
  const items = await getOfflineInspections();
  return items.length;
}

export async function syncOfflineInspections(): Promise<{
  synced: number;
  failed: number;
  remaining: number;
}> {
  const items = await getOfflineInspections();
  if (items.length === 0) {
    return { synced: 0, failed: 0, remaining: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      // 1. Submit the cached inspection record
      await mobileApi.post("/inspections", item.payload);

      // Remove from offline queue
      await removeOfflineInspection(item.id);
      synced++;
    } catch (err) {
      console.warn(`Failed to sync offline inspection ${item.id}:`, err);
      failed++;
    }
  }

  const remaining = await getOfflineQueueCount();
  return { synced, failed, remaining };
}

