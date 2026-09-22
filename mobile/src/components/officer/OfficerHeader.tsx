import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useAuth } from "../../lib/auth";
import { theme } from "../ui/theme";

interface OfficerHeaderProps {
  onLanguageToggle?: () => void;
  currentLanguage: string;
  onOpenSettings?: () => void;
}

export const OfficerHeader: React.FC<OfficerHeaderProps> = ({
  onLanguageToggle,
  currentLanguage,
  onOpenSettings,
}) => {
  const { user } = useAuth();

  const jurisdiction =
    user?.officerProfile?.jurisdictionDistrict ||
    user?.gatcInspectorProfile?.gatc?.district ||
    "Jaipur";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "LM";

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        {/* Left: App Identity */}
        <View style={styles.brandRow}>
          <Image
            source={require("../../../assets/logo.jpeg")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>eLMV</Text>
            <Text style={styles.brandSubtitle}>
              {jurisdiction}
            </Text>
          </View>
        </View>

        {/* Right: Actions (Language toggle + Officer Avatar Button) */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onLanguageToggle}
            style={styles.langPill}
          >
            <Text style={styles.langText}>
              {currentLanguage === "en" ? "हिन्दी" : "EN"}
            </Text>
          </TouchableOpacity>

          {user ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onOpenSettings}
              style={styles.avatarButton}
              accessibilityLabel={currentLanguage === "hi" ? "सेटिंग्स" : "Settings"}
              accessibilityRole="button"
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandLogo: {
    width: 32,
    height: 32,
    marginRight: 9,
    borderRadius: 4,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: theme.colors.foreground,
  },
  brandSubtitle: {
    fontSize: 11,
    color: theme.colors.mutedForeground,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  langText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.foreground,
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
