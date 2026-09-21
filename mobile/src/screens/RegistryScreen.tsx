import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import { InstrumentType } from "@sih/shared";
import { mobileApi } from "../lib/api";
import { theme } from "../components/ui/theme";
import { Icons } from "../components/ui/icons";
import { Badge } from "../components/ui/badge";
import i18n from "../i18n";

// Statutory Rule 14 Instrument Type Filters
const INSTRUMENT_TYPE_FILTERS = [
  { key: "all", shortLabel: "All Types" },
  { key: InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT, shortLabel: "NAWI" },
  { key: InstrumentType.AUTOMATIC_WEIGHING_INSTRUMENT, shortLabel: "AWI" },
  { key: InstrumentType.FUEL_DISPENSER, shortLabel: "Fuel" },
  { key: InstrumentType.STORAGE_TANK, shortLabel: "Tanks" },
  { key: InstrumentType.LENGTH_MEASURE, shortLabel: "Length" },
  { key: InstrumentType.CAPACITY_MEASURE, shortLabel: "Capacity" },
  { key: InstrumentType.OTHER, shortLabel: "Specialized" },
];

// Statutory Accuracy Class Filters
const ACCURACY_CLASS_FILTERS = [
  { key: "all", label: "All Classes" },
  { key: "Class I", label: "Class I" },
  { key: "Class II", label: "Class II" },
  { key: "Class III", label: "Class III" },
  { key: "Class IV", label: "Class IV" },
];



const getInstrumentTypeLabel = (type?: string) => {
  switch (type) {
    case InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT:
      return "NAWI";
    case InstrumentType.AUTOMATIC_WEIGHING_INSTRUMENT:
      return "AWI";
    case InstrumentType.FUEL_DISPENSER:
      return "Fuel";
    case InstrumentType.STORAGE_TANK:
      return "Tank";
    case InstrumentType.LENGTH_MEASURE:
      return "Length";
    case InstrumentType.CAPACITY_MEASURE:
      return "Capacity";
    case InstrumentType.OTHER:
      return "Specialized";
    default:
      return type || "Equipment";
  }
};

const getInstrumentTypeFullName = (type?: string) => {
  switch (type) {
    case InstrumentType.NON_AUTOMATIC_WEIGHING_INSTRUMENT:
      return "Non-Automatic Weighing Instrument (NAWI)";
    case InstrumentType.AUTOMATIC_WEIGHING_INSTRUMENT:
      return "Automatic Weighing Instrument (AWI)";
    case InstrumentType.FUEL_DISPENSER:
      return "Fuel Dispenser / Flow Meter";
    case InstrumentType.STORAGE_TANK:
      return "Storage Tank / Vessel";
    case InstrumentType.LENGTH_MEASURE:
      return "Length Measure";
    case InstrumentType.CAPACITY_MEASURE:
      return "Capacity Measure";
    case InstrumentType.OTHER:
      return "Other Specialized Device";
    default:
      return type || "Equipment";
  }
};

const matchClass = (instClass: string | undefined, filterClass: string) => {
  if (filterClass === "all") return true;
  if (!instClass) return false;
  const normalizedInst = instClass.toLowerCase().replace("class", "").trim();
  const normalizedFilter = filterClass.toLowerCase().replace("class", "").trim();
  return normalizedInst === normalizedFilter || instClass.toLowerCase().includes(filterClass.toLowerCase());
};

export const RegistryScreen: React.FC<{ currentLanguage?: string }> = () => {
  const [instruments, setInstruments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedInstrument, setSelectedInstrument] = useState<any | null>(null);

  const fetchInstruments = useCallback(async () => {
    try {
      const res = await mobileApi.get("/instruments", {
        params: { limit: 200 },
      });
      const list = res.data?.data;
      if (Array.isArray(list)) {
        setInstruments(list);
      } else {
        setInstruments([]);
      }
    } catch (err) {
      console.warn("Error fetching instruments:", err);
      setInstruments([]);
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

  const handleResetFilters = () => {
    setSearch("");
    setSelectedType("all");
    setSelectedClass("all");
  };

  const hasActiveFilters = selectedType !== "all" || selectedClass !== "all" || search.trim().length > 0;
  const hasExtendedFiltersActive = selectedClass !== "all";

  // Dynamic live counts taking other active filters into account
  const getTypeCount = useCallback(
    (typeKey: string) => {
      return instruments.filter((inst) => {
        if (!matchClass(inst.accuracyClass, selectedClass)) return false;
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchText =
            inst.make?.toLowerCase().includes(q) ||
            inst.model?.toLowerCase().includes(q) ||
            inst.serialNumber?.toLowerCase().includes(q) ||
            inst.category?.toLowerCase().includes(q) ||
            inst.owner?.name?.toLowerCase().includes(q) ||
            inst.owner?.businessName?.toLowerCase().includes(q) ||
            inst.district?.toLowerCase().includes(q);
          if (!matchText) return false;
        }
        if (typeKey === "all") return true;
        return inst.type === typeKey;
      }).length;
    },
    [instruments, selectedClass, search]
  );

  const getClassCount = useCallback(
    (classKey: string) => {
      return instruments.filter((inst) => {
        if (selectedType !== "all" && inst.type !== selectedType) return false;
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchText =
            inst.make?.toLowerCase().includes(q) ||
            inst.model?.toLowerCase().includes(q) ||
            inst.serialNumber?.toLowerCase().includes(q) ||
            inst.category?.toLowerCase().includes(q) ||
            inst.owner?.name?.toLowerCase().includes(q) ||
            inst.owner?.businessName?.toLowerCase().includes(q) ||
            inst.district?.toLowerCase().includes(q);
          if (!matchText) return false;
        }
        return matchClass(inst.accuracyClass, classKey);
      }).length;
    },
    [instruments, selectedType, search]
  );

  const filtered = useMemo(() => {
    return instruments.filter((inst) => {
      // 1. Instrument Type filter
      if (selectedType !== "all" && inst.type !== selectedType) {
        return false;
      }

      // 2. Accuracy Class filter
      if (!matchClass(inst.accuracyClass, selectedClass)) {
        return false;
      }

      // 3. Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchMake = inst.make?.toLowerCase().includes(q);
        const matchModel = inst.model?.toLowerCase().includes(q);
        const matchSerial = inst.serialNumber?.toLowerCase().includes(q);
        const matchCategory = inst.category?.toLowerCase().includes(q);
        const matchOwnerName = inst.owner?.name?.toLowerCase().includes(q);
        const matchOwnerBiz = inst.owner?.businessName?.toLowerCase().includes(q);
        const matchDistrict = inst.district?.toLowerCase().includes(q);
        const matchAddress = inst.installationAddress?.toLowerCase().includes(q);

        if (
          !matchMake &&
          !matchModel &&
          !matchSerial &&
          !matchCategory &&
          !matchOwnerName &&
          !matchOwnerBiz &&
          !matchDistrict &&
          !matchAddress
        ) {
          return false;
        }
      }

      return true;
    });
  }, [instruments, selectedType, selectedClass, search]);

  return (
    <View style={styles.container}>
      {/* Top Search & Filter Control Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icons.Search size={15} color="#a1a1aa" />
          <TextInput
            placeholder={i18n.t("registry.search", { defaultValue: "Search equipment, serial, owner..." })}
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

        {/* Filter Toggle Button */}
        <TouchableOpacity
          style={[
            styles.filterToggleBtn,
            (showFilters || hasExtendedFiltersActive) && styles.filterToggleBtnActive,
          ]}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.75}
        >
          <Icons.Sliders
            size={16}
            color={showFilters || hasExtendedFiltersActive ? "#ffffff" : "#71717a"}
          />
          {hasExtendedFiltersActive && <View style={styles.filterActiveDot} />}
        </TouchableOpacity>
      </View>

      {/* Horizontal Instrument Type Filter Chips */}
      <View style={styles.typeChipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeChipsContainer}
        >
          {INSTRUMENT_TYPE_FILTERS.map((item) => {
            const isSelected = selectedType === item.key;
            const count = getTypeCount(item.key);
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setSelectedType(item.key)}
                activeOpacity={0.75}
                style={[styles.typeChip, isSelected && styles.typeChipActive]}
              >
                <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>
                  {item.shortLabel}
                </Text>
                <View style={[styles.typeChipCount, isSelected && styles.typeChipCountActive]}>
                  <Text style={[styles.typeChipCountText, isSelected && styles.typeChipCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Expandable Accuracy Class Filter Panel */}
      {showFilters && (
        <View style={styles.expandedFilterPanel}>
          <View style={styles.expandedFilterHeader}>
            <View style={styles.filterSectionTitleRow}>
              <Icons.Layers size={13} color="#71717a" />
              <Text style={styles.expandedFilterTitle}>
                {i18n.t("registry.accuracyClass", { defaultValue: "Accuracy Class" })}
              </Text>
            </View>
            {hasExtendedFiltersActive && (
              <TouchableOpacity onPress={() => setSelectedClass("all")} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Text style={styles.expandedFilterResetText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classChipsContainer}>
            {ACCURACY_CLASS_FILTERS.map((cls) => {
              const isSelected = selectedClass === cls.key;
              const count = getClassCount(cls.key);
              return (
                <TouchableOpacity
                  key={cls.key}
                  onPress={() => setSelectedClass(cls.key)}
                  activeOpacity={0.75}
                  style={[styles.classChip, isSelected && styles.classChipActive]}
                >
                  <Text style={[styles.classChipText, isSelected && styles.classChipTextActive]}>
                    {cls.label}
                  </Text>
                  <View style={[styles.classChipCount, isSelected && styles.classChipCountActive]}>
                    <Text style={[styles.classChipCountText, isSelected && styles.classChipCountTextActive]}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Active Filter Summary Bar */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersBar}>
          <View style={styles.activeBadgesRow}>
            <Text style={styles.resultsCountText}>
              {i18n.t("registry.showing", { defaultValue: "Showing" })} {filtered.length} {i18n.t("registry.of", { defaultValue: "of" })} {instruments.length}
            </Text>

            {selectedType !== "all" && (
              <TouchableOpacity
                style={styles.activeFilterPill}
                onPress={() => setSelectedType("all")}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={styles.activeFilterPillText}>
                  {getInstrumentTypeLabel(selectedType)}
                </Text>
                <Icons.X size={10} color="#71717a" />
              </TouchableOpacity>
            )}

            {selectedClass !== "all" && (
              <TouchableOpacity
                style={styles.activeFilterPill}
                onPress={() => setSelectedClass("all")}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={styles.activeFilterPillText}>{selectedClass}</Text>
                <Icons.X size={10} color="#71717a" />
              </TouchableOpacity>
            )}

            {search.trim().length > 0 && (
              <TouchableOpacity
                style={styles.activeFilterPill}
                onPress={() => setSearch("")}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Text style={styles.activeFilterPillText} numberOfLines={1}>
                  "{search.trim()}"
                </Text>
                <Icons.X size={10} color="#71717a" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={handleResetFilters} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={styles.clearAllBtnText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

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
          keyExtractor={(item) => item.id || item.serialNumber}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#09090b" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.82}
              onPress={() => setSelectedInstrument(item)}
            >
              {/* Header: Title & Badges */}
              <View style={styles.cardTop}>
                <Text style={styles.makeModel} numberOfLines={1}>
                  {item.make} {item.model ? `• ${item.model}` : ""}
                </Text>
                <View style={styles.badgesContainer}>
                  {item.type && (
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {getInstrumentTypeLabel(item.type)}
                      </Text>
                    </View>
                  )}
                  <Badge variant="outline">
                    {i18n.t("drawer.class", { defaultValue: "Class" })} {item.accuracyClass?.replace(/class/i, "").trim() || "III"}
                  </Badge>
                </View>
              </View>

              {/* Serial & Capacity */}
              <View style={styles.specsRow}>
                <Text style={styles.specsText}>
                  #{item.serialNumber} • {item.capacity} {item.unit}
                </Text>
                {item.category && item.category !== item.type && (
                  <Text style={styles.categorySubtext} numberOfLines={1}>
                    {item.category}
                  </Text>
                )}
              </View>

              {/* Owner & District */}
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Icons.Building size={12} color="#71717a" />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.owner?.businessName || item.owner?.name || "Registered Establishment"}
                  </Text>
                </View>
                <View style={styles.metaCol}>
                  <Icons.MapPin size={11} color="#71717a" />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.district || "Jaipur"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
                {hasActiveFilters
                  ? i18n.t("registry.emptyFilter", {
                      defaultValue: "No equipment matches your search or active filters.",
                    })
                  : i18n.t("registry.emptyNone", {
                      defaultValue: "No registered instruments found.",
                    })}
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.resetFiltersBtn} onPress={handleResetFilters} activeOpacity={0.8}>
                  <Text style={styles.resetFiltersBtnText}>
                    {i18n.t("registry.resetFilters", { defaultValue: "Reset Filters" })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Equipment Inspection Details Modal */}
      {selectedInstrument && (
        <Modal
          visible={Boolean(selectedInstrument)}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedInstrument(null)}
        >
          <View style={styles.modalOverlay}>
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedInstrument.make} {selectedInstrument.model}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {getInstrumentTypeFullName(selectedInstrument.type)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedInstrument(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icons.X size={18} color="#18181b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Statutory Compliance Seal */}
                <View style={styles.complianceCard}>
                  <Icons.ShieldCheck size={20} color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.complianceTitle}>Statutory Verification Registry</Text>
                    <Text style={styles.complianceSubtitle}>
                      Compliant under Legal Metrology (General) Rules, 2011 & Rule 14.
                    </Text>
                  </View>
                </View>

                {/* Technical Specifications */}
                <Text style={styles.modalSectionTitle}>
                  {i18n.t("registry.specifications", { defaultValue: "Technical Specifications" })}
                </Text>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Serial Number</Text>
                    <Text style={styles.detailsValue}>{selectedInstrument.serialNumber}</Text>
                  </View>
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Accuracy Class</Text>
                    <Text style={styles.detailsValue}>{selectedInstrument.accuracyClass || "Class III"}</Text>
                  </View>
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Capacity & Unit</Text>
                    <Text style={styles.detailsValue}>
                      {selectedInstrument.capacity} {selectedInstrument.unit}
                    </Text>
                  </View>
                  <View style={styles.detailsItem}>
                    <Text style={styles.detailsLabel}>Verification Cycle</Text>
                    <Text style={styles.detailsValue}>
                      {selectedInstrument.verificationInterval || 12} Months
                    </Text>
                  </View>
                </View>

                {/* Establishment & Ownership Details */}
                <Text style={styles.modalSectionTitle}>
                  {i18n.t("registry.traderDetails", { defaultValue: "Trader & Establishment" })}
                </Text>
                <View style={styles.detailsCard}>
                  <View style={styles.detailsRow}>
                    <Icons.Building size={14} color="#71717a" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailsLabel}>Business Name</Text>
                      <Text style={styles.detailsValue}>
                        {selectedInstrument.owner?.businessName || selectedInstrument.owner?.name || "Licensed Commercial Entity"}
                      </Text>
                    </View>
                  </View>

                  {selectedInstrument.owner?.phone && (
                    <View style={styles.detailsRow}>
                      <Icons.Phone size={14} color="#71717a" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailsLabel}>Phone</Text>
                        <Text style={styles.detailsValue}>{selectedInstrument.owner.phone}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.detailsRow}>
                    <Icons.MapPin size={14} color="#71717a" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailsLabel}>Installation Address</Text>
                      <Text style={styles.detailsValue}>
                        {selectedInstrument.installationAddress || "Jaipur Central Market"}
                      </Text>
                      <Text style={styles.detailsSubvalue}>
                        {selectedInstrument.district || "Jaipur"}, {selectedInstrument.state || "Rajasthan"} - {selectedInstrument.pincode || "302001"}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalDoneBtn}
                  onPress={() => setSelectedInstrument(null)}
                >
                  <Text style={styles.modalDoneBtnText}>
                    {i18n.t("registry.close", { defaultValue: "Close" })}
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: theme.colors.background,
    gap: 8,
  },
  searchBar: {
    flex: 1,
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
  filterToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: "relative",
  },
  filterToggleBtnActive: {
    backgroundColor: "#09090b",
    borderColor: "#09090b",
  },
  filterActiveDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f59e0b",
  },
  typeChipsWrapper: {
    backgroundColor: "#ffffff",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  typeChipsContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 20,
    backgroundColor: "#f4f4f5",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  typeChipActive: {
    backgroundColor: "#09090b",
    borderColor: "#09090b",
  },
  typeChipText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#52525b",
  },
  typeChipTextActive: {
    color: "#ffffff",
  },
  typeChipCount: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: "#e4e4e7",
  },
  typeChipCountActive: {
    backgroundColor: "#27272a",
  },
  typeChipCountText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#71717a",
  },
  typeChipCountTextActive: {
    color: "#e4e4e7",
  },
  expandedFilterPanel: {
    backgroundColor: "#fafafa",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  expandedFilterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  filterSectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  expandedFilterTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#52525b",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  expandedFilterResetText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
  },
  classChipsContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 6,
  },
  classChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d4d4d8",
  },
  classChipActive: {
    backgroundColor: "#18181b",
    borderColor: "#18181b",
  },
  classChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3f3f46",
  },
  classChipTextActive: {
    color: "#ffffff",
  },
  classChipCount: {
    paddingHorizontal: 4,
    paddingVertical: 0.5,
    borderRadius: 8,
    backgroundColor: "#f4f4f5",
  },
  classChipCountActive: {
    backgroundColor: "#27272a",
  },
  classChipCountText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#71717a",
  },
  classChipCountTextActive: {
    color: "#d4d4d8",
  },
  activeFiltersBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#f4f4f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  activeBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  resultsCountText: {
    fontSize: 11,
    color: "#71717a",
    fontWeight: "600",
    marginRight: 4,
  },
  activeFilterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e4e4e7",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  activeFilterPillText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#27272a",
    maxWidth: 90,
  },
  clearAllBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#dc2626",
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 64,
    paddingTop: 8,
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
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1d4ed8",
    letterSpacing: -0.1,
  },
  specsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  specsText: {
    fontSize: 12,
    color: "#71717a",
    fontWeight: "500",
  },
  categorySubtext: {
    fontSize: 11,
    color: "#a1a1aa",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
  },
  metaCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
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
  resetFiltersBtn: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#09090b",
  },
  resetFiltersBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#09090b",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#f4f4f5",
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  complianceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  complianceTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#065f46",
  },
  complianceSubtitle: {
    fontSize: 10.5,
    color: "#047857",
    marginTop: 1,
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f4f4f5",
    padding: 12,
    gap: 12,
    marginBottom: 16,
  },
  detailsItem: {
    width: "47%",
  },
  detailsLabel: {
    fontSize: 10.5,
    color: "#71717a",
    marginBottom: 2,
  },
  detailsValue: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#09090b",
  },
  detailsSubvalue: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: "#fafafa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f4f4f5",
    padding: 12,
    gap: 12,
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
  },
  modalDoneBtn: {
    backgroundColor: "#09090b",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDoneBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffffff",
  },
});
