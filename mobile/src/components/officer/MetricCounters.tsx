import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../ui/theme";

interface MetricCountersProps {
  scheduledCount: number;
  inspectedCount?: number;
  certifiedCount: number;
  totalCount: number;
}

export const MetricCounters: React.FC<MetricCountersProps> = ({
  scheduledCount,
  certifiedCount,
  totalCount,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Column 1: Scheduled Visits */}
        <View style={styles.statColumn}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.scheduled.solid }]} />
            <Text style={styles.label}>Due Today</Text>
          </View>
          <Text style={styles.countNumber}>{scheduledCount}</Text>
        </View>

        <View style={styles.divider} />

        {/* Column 2: Certified */}
        <View style={styles.statColumn}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: theme.colors.certified.solid }]} />
            <Text style={styles.label}>Certified</Text>
          </View>
          <Text style={styles.countNumber}>{certifiedCount}</Text>
        </View>

        <View style={styles.divider} />

        {/* Column 3: Total Pipeline */}
        <View style={styles.statColumn}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: "#71717a" }]} />
            <Text style={styles.label}>Total</Text>
          </View>
          <Text style={styles.countNumber}>{totalCount}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.border,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.mutedForeground,
  },
  countNumber: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.foreground,
  },
});

