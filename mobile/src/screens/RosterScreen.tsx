import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { ApplicationStatus } from "@sih/shared";
import { mobileApi } from "../lib/api";
import { theme } from "../components/ui/theme";
import { Icons } from "../components/ui/icons";
import { Tabs, TabItem } from "../components/ui/tabs";
import { RosterCard } from "../components/officer/RosterCard";
import { InspectionModal } from "../components/officer/InspectionModal";
import { CertificateModal } from "../components/officer/CertificateModal";
import { ApplicationDrawer } from "../components/officer/ApplicationDrawer";
import { getOfflineQueueCount, syncOfflineInspections } from "../lib/offlineQueue";
import i18n from "../i18n";

const FALLBACK_APPLICATIONS = [
  {
    id: "demo-app-1",
    applicationNumber: "LM-APP-2026-0000001",
    status: ApplicationStatus.CERTIFIED,
    type: "RE_VERIFICATION",
    scheduledDate: new Date().toISOString(),
    feeAmount: 500,
    feePaid: true,
    applicant: {
      name: "Rajesh Kumar (Shree Provision Stores)",
      email: "trader.rajesh@shreestores.com",
      phone: "9876543213",
    },
    instrument: {
      id: "demo-inst-1",
      make: "Essae-Teraoka",
      model: "DS-252",
      serialNumber: "ESSAE-DS-2025-00892",
      capacity: 30,
      unit: "kg",
      accuracyClass: "Class III",
      district: "Jaipur",
      state: "Rajasthan",
    },
    certificate: {
      id: "demo-cert-1",
      certificateNumber: "LM-RJ-2026-0000001",
      validUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
    },
  },
  {
    id: "demo-app-2",
    applicationNumber: "LM-APP-2026-0000002",
    status: ApplicationStatus.SCHEDULED,
    type: "NEW",
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    feeAmount: 750,
    feePaid: true,
    applicant: {
      name: "Rajesh Kumar (Shree Provision Stores)",
      email: "trader.rajesh@shreestores.com",
      phone: "9876543213",
    },
    instrument: {
      id: "demo-inst-2",
      make: "Mettler Toledo",
      model: "Precision Balance PB-3002",
      serialNumber: "METTLER-TOLEDO-PB3002",
      capacity: 3100,
      unit: "g",
      accuracyClass: "Class II",
      district: "Jaipur",
      state: "Rajasthan",
    },
  },
  {
    id: "demo-app-3",
    applicationNumber: "APP-2026-000003",
    status: ApplicationStatus.CERTIFIED,
    type: "RE_VERIFICATION",
    scheduledDate: new Date().toISOString(),
    feeAmount: 600,
    feePaid: true,
    applicant: {
      name: "Apex Precision Lab Ltd",
      email: "lab@apexmetrology.org",
      phone: "9876543212",
    },
    instrument: {
      id: "demo-inst-3",
      make: "Sartorius",
      model: "Secura 225D-1S",
      serialNumber: "SART-SEC-2026-091",
      capacity: 220,
      unit: "g",
      accuracyClass: "Class I",
      district: "Jaipur",
      state: "Rajasthan",
    },
    certificate: {
      id: "demo-cert-3",
      certificateNumber: "LM-RJ-2026-0000003",
      validUntil: new Date(Date.now() + 365 * 86400000).toISOString(),
    },
  },
  {
    id: "demo-app-4",
    applicationNumber: "APP-2026-000006",
    status: ApplicationStatus.SUBMITTED,
    type: "NEW",
    scheduledDate: null,
    feeAmount: 500,
    feePaid: true,
    applicant: {
      name: "Kalyan Jewellers (Counter 4)",
      email: "store@kalyanjewellers.in",
      phone: "9876543299",
    },
    instrument: {
      id: "demo-inst-4",
      make: "A&D Instruments",
      model: "GX-6001A",
      serialNumber: "AD-GX6001A-8821",
      capacity: 6200,
      unit: "g",
      accuracyClass: "Class II",
      district: "Jaipur",
      state: "Rajasthan",
    },
  },
];

export const RosterScreen: React.FC<{ currentLanguage?: string }> = ({ currentLanguage }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineCount, setOfflineCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Dialog / Modal / Drawer Targets
  const [drawerApp, setDrawerApp] = useState<any | null>(null);
  const [inspectionTarget, setInspectionTarget] = useState<any | null>(null);
  const [certTarget, setCertTarget] = useState<{ number: string; app: any } | null>(null);

  const checkOfflineCount = useCallback(async () => {
    try {
      const count = await getOfflineQueueCount();
      setOfflineCount(count);
    } catch {
      // ignore
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      await checkOfflineCount();
      const res = await mobileApi.get("/applications");
      const list = res.data?.data;
      if (Array.isArray(list) && list.length > 0) {
        setApplications(list);
        setIsOfflineMode(false);
      } else if (Array.isArray(list) && list.length === 0) {
        // Fallback to rich inspection queue if backend returned 0 items
        setApplications(FALLBACK_APPLICATIONS);
        setIsOfflineMode(false);
      }
    } catch (err) {
      console.warn("Error fetching applications:", err);
      setIsOfflineMode(true);
      setApplications((prev) => (prev.length > 0 ? prev : FALLBACK_APPLICATIONS));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [checkOfflineCount]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchApplications();
  };

  const handleSyncOffline = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const { synced, remaining } = await syncOfflineInspections();
      setOfflineCount(remaining);
      if (synced > 0) {
        Alert.alert(
          "Sync Complete",
          `Successfully uploaded and certified ${synced} offline verification test(s) to the statutory registry.`
        );
        fetchApplications();
      } else if (remaining > 0) {
        Alert.alert(
          "Sync Incomplete",
          `Could not reach the server. ${remaining} test(s) remain safely preserved offline on device.`
        );
      } else {
        Alert.alert("All Synced", "No offline inspections pending synchronization.");
      }
    } catch (err) {
      Alert.alert("Sync Error", "Unable to complete sync right now. Data remains safe offline.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Status partitions
  const scheduledApps = applications.filter(
    (a) => a.status === ApplicationStatus.SCHEDULED || a.status === ApplicationStatus.SUBMITTED
  );
  const certifiedApps = applications.filter(
    (a) => a.status === ApplicationStatus.CERTIFIED
  );
  const rejectedApps = applications.filter(
    (a) => a.status === ApplicationStatus.REJECTED
  );

  const tabItems: TabItem[] = [
    { key: "all", label: i18n.t("roster.tabs.all", { defaultValue: "All" }), count: applications.length },
    { key: "scheduled", label: i18n.t("roster.tabs.scheduled", { defaultValue: "Scheduled" }), count: scheduledApps.length },
    { key: "certified", label: i18n.t("roster.tabs.certified", { defaultValue: "Certified" }), count: certifiedApps.length },
    { key: "rejected", label: i18n.t("roster.tabs.rejected", { defaultValue: "Rejected" }), count: rejectedApps.length },
  ];

  // Tab & search filtering
  const currentPartition =
    activeTab === "scheduled"
      ? scheduledApps
      : activeTab === "certified"
      ? certifiedApps
      : activeTab === "rejected"
      ? rejectedApps
      : applications;

  const filteredApps = currentPartition.filter((app) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (app.applicationNumber?.toLowerCase()?.includes(q) ?? false) ||
      (app.instrument?.serialNumber?.toLowerCase()?.includes(q) ?? false) ||
      (app.applicant?.name?.toLowerCase()?.includes(q) ?? false) ||
      (app.instrument?.district?.toLowerCase()?.includes(q) ?? false) ||
      (app.instrument?.make?.toLowerCase()?.includes(q) ?? false) ||
      (app.instrument?.model?.toLowerCase()?.includes(q) ?? false)
    );
  });

  return (
    <View style={styles.container}>
      {/* Offline Pending Inspections Sync Banner */}
      {offlineCount > 0 && (
        <View style={styles.syncBanner}>
          <View style={styles.syncBannerContent}>
            <Icons.Clock size={16} color="#d97706" />
            <View style={{ flex: 1 }}>
              <Text style={styles.syncBannerTitle}>
                {offlineCount} Offline Inspection{offlineCount > 1 ? "s" : ""} Stored
              </Text>
              <Text style={styles.syncBannerSubtitle}>
                Verified in airplane / offline mode. Ready to sync with central registry.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.syncBtn, isSyncing && { opacity: 0.6 }]}
            onPress={handleSyncOffline}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Icons.RefreshCw size={12} color="#ffffff" />
                <Text style={styles.syncBtnText}>Sync</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Integrated Minimal Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icons.Search size={15} color="#a1a1aa" />
          <TextInput
            style={styles.searchInput}
            placeholder={i18n.t("roster.searchPlaceholder", { defaultValue: "Search roster..." })}
            placeholderTextColor="#a1a1aa"
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Icons.X size={14} color="#a1a1aa" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Modern Filter Pill Chips */}
      <View style={styles.tabsContainer}>
        <Tabs
          items={tabItems}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </View>

      {/* Offline sync status notice if server is unreachable */}
      {isOfflineMode ? (
        <View style={styles.offlineNotice}>
          <Icons.Clock size={12} color="#71717a" />
          <Text style={styles.offlineNoticeText} numberOfLines={1}>
            Offline queue • Pull to retry live sync
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Main Roster List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#09090b" />
          <Text style={styles.loadingText}>Loading roster...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RosterCard
              application={item}
              onPress={(app) => setDrawerApp(app)}
              onStartInspection={(app) => setInspectionTarget(app)}
              onViewCertificate={(num, app) => setCertTarget({ number: num, app })}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#09090b"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icons.FileText size={32} color={theme.colors.mutedForeground} />
              <Text style={styles.emptyTitle}>{i18n.t("roster.empty")}</Text>
            </View>
          }
        />
      )}

      {/* Application Details Bottom Drawer */}
      <ApplicationDrawer
        visible={!!drawerApp}
        application={drawerApp}
        onClose={() => setDrawerApp(null)}
        onStartInspection={(app) => setInspectionTarget(app)}
        onViewCertificate={(num, app) => setCertTarget({ number: num, app })}
      />

      {/* Record Inspection Modal (Option A) */}
      {inspectionTarget ? (
        <InspectionModal
          visible={!!inspectionTarget}
          application={inspectionTarget}
          onClose={() => setInspectionTarget(null)}
          onInspectionComplete={fetchApplications}
        />
      ) : null}

      {/* Certificate Viewer Modal */}
      {certTarget ? (
        <CertificateModal
          visible={!!certTarget}
          certificateNumber={certTarget.number}
          applicationData={certTarget.app}
          currentLanguage={currentLanguage}
          onClose={() => setCertTarget(null)}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: theme.colors.foreground,
    paddingHorizontal: 8,
  },
  tabsContainer: {
    paddingBottom: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    textAlign: "center",
  },
  offlineNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    gap: 8,
  },
  offlineNoticeText: {
    fontSize: 11,
    color: "#71717a",
    flex: 1,
  },
  retryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "#e4e4e7",
    borderRadius: 6,
  },
  retryBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#18181b",
  },
  syncBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  syncBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  syncBannerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
  },
  syncBannerSubtitle: {
    fontSize: 10,
    color: "#b45309",
    marginTop: 1,
  },
  syncBtn: {
    backgroundColor: "#d97706",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  syncBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
});

