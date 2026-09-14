import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ViewStyle, Animated } from "react-native";
import { theme } from "./theme";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  style?: ViewStyle;
}

const TabPill: React.FC<{
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      tension: 120,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
      >
        <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
          {tab.label}
        </Text>
        {typeof tab.count === "number" ? (
          <View style={[styles.countBadge, isActive ? styles.countBadgeActive : styles.countBadgeInactive]}>
            <Text style={[styles.countText, isActive ? styles.countTextActive : styles.countTextInactive]}>
              {tab.count}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const Tabs: React.FC<TabsProps> = ({ items, activeKey, onChange, style }) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((tab) => (
          <TabPill
            key={tab.key}
            tab={tab}
            isActive={tab.key === activeKey}
            onPress={() => onChange(tab.key)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    height: 34,
    paddingHorizontal: 14,
    borderRadius: theme.radius.full,
  },
  pillActive: {
    backgroundColor: "#09090b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  pillInactive: {
    backgroundColor: "#f4f4f5",
  },
  label: {
    fontSize: 12.5,
    letterSpacing: -0.2,
  },
  labelActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  labelInactive: {
    color: "#52525b",
    fontWeight: "500",
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: theme.radius.full,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  countBadgeInactive: {
    backgroundColor: "#e4e4e7",
  },
  countText: {
    fontSize: 10,
    fontWeight: "700",
  },
  countTextActive: {
    color: "#ffffff",
  },
  countTextInactive: {
    color: "#52525b",
  },
});

