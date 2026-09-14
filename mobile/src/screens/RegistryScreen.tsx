import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { mobileApi } from "../lib/api";
import { theme } from "../components/ui/theme";
import { Icons } from "../components/ui/icons";
import { Badge } from "../components/ui/badge";
import i18n from "../i18n";

export const RegistryScreen: React.FC<{ currentLanguage?: string }> = ({ currentLanguage }) => {
  const [instruments, setInstruments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const fetchInstruments = useCallback(async () => {
    try {
      const res = await mobileApi.get("/instruments");
      const list = res.data?.data;
      if (Array.isArray(list)) {
        setInstruments(list);
      }
    } catch (err) {
      console.warn("Error fetching instruments:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInstruments();
  };

  const filtered = instruments.filter((inst) => {
    const q = search.toLowerCase();
    return (
      inst.serialNumber?.toLowerCase().includes(q) ||
      inst.make?.toLowerCase().includes(q) ||
      inst.model?.toLowerCase().includes(q) ||
      inst.owner?.name?.toLowerCase().includes(q) ||
      inst.district?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Modern Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icons.Search size={16} color={theme.colors.mutedForeground} />
          <TextInput
            placeholder={i18n.t("registry.search", { defaultValue: "Search equipment..." })}
            placeholderTextColor="#a1a1aa"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icons.X size={14} color="#a1a1aa" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#09090b" />
          <Text style={styles.loadingText}>
            {i18n.t("registry.loading", { defaultValue: "Loading equipment..." })}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#09090b"
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Header: Title & Class Badge */}
              <View style={styles.cardTop}>
                <Text style={styles.makeModel} numberOfLines={1}>
                  {item.make} {item.model ? `• ${item.model}` : ""}
                </Text>
                <Badge variant="outline">
                  {i18n.t("drawer.class", { defaultValue: "Class" })} {item.accuracyClass || "III"}
                </Badge>
              </View>

              {/* Serial & Capacity */}
              <Text style={styles.specsText}>
                #{item.serialNumber} • {item.capacity} {item.unit}
              </Text>

              {/* Owner & District */}
              <View style={styles.metaRow}>
                <Icons.Building size={12} color="#71717a" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.owner?.name || "Registered Establishment"} • {item.district || "Jaipur"}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconBg}>
                <Icons.Scale size={24} color="#a1a1aa" />
              </View>
              <Text style={styles.emptyTitle}>
                {i18n.t("registry.emptyTitle", { defaultValue: "No Equipment Found" })}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? i18n.t("registry.emptyFilter", { defaultValue: "No equipment matches your search." })
                  : i18n.t("registry.emptyNone", { defaultValue: "No registered instruments found." })}
              </Text>
            </View>
          }
        />
      )}
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
    paddingBottom: 10,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.foreground,
    marginLeft: 8,
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 2,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f4f4f5",
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  makeModel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#09090b",
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 8,
  },
  specsText: {
    fontSize: 12,
    color: "#71717a",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: "#71717a",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});


