import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Modal,
} from "react-native";
import { AuthProvider, useAuth } from "./src/lib/auth";
import { theme } from "./src/components/ui/theme";
import { Icons } from "./src/components/ui/icons";
import { OfficerHeader } from "./src/components/officer/OfficerHeader";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RosterScreen } from "./src/screens/RosterScreen";
import { VerifyScreen } from "./src/screens/VerifyScreen";
import { RegistryScreen } from "./src/screens/RegistryScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import i18n from "./src/i18n";

type MainNavTab = "roster" | "verify" | "registry";

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<MainNavTab>("roster");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lang, setLang] = useState<string>("en");

  const tabFadeAnim = useRef(new Animated.Value(1)).current;
  const rosterScale = useRef(new Animated.Value(1)).current;
  const verifyScale = useRef(new Animated.Value(1)).current;
  const registryScale = useRef(new Animated.Value(1)).current;

  const toggleLanguage = () => {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    i18n.changeLanguage(next);
  };

  const handleSwitchTab = (newTab: MainNavTab) => {
    if (newTab === currentTab) return;

    const targetScale =
      newTab === "roster"
        ? rosterScale
        : newTab === "verify"
        ? verifyScale
        : registryScale;
    Animated.sequence([
      Animated.timing(targetScale, {
        toValue: 0.85,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(targetScale, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(tabFadeAnim, {
      toValue: 0,
      duration: 70,
      useNativeDriver: true,
    }).start(() => {
      setCurrentTab(newTab);
      Animated.timing(tabFadeAnim, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }).start();
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Initializing eLMV Station...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        key={lang}
        currentLanguage={lang}
        onToggleLanguage={toggleLanguage}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Officer Header */}
      <OfficerHeader
        onLanguageToggle={toggleLanguage}
        currentLanguage={lang}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Screen Viewport with smooth crossfade */}
      <Animated.View style={[styles.viewport, { opacity: tabFadeAnim }]}>
        {currentTab === "roster" && <RosterScreen key={lang} currentLanguage={lang} />}
        {currentTab === "verify" && <VerifyScreen key={lang} currentLanguage={lang} />}
        {currentTab === "registry" && <RegistryScreen key={lang} currentLanguage={lang} />}
      </Animated.View>

      {/* Bottom Navigation Bar (3 Core Operational Tabs) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleSwitchTab("roster")}
          style={styles.navItem}
        >
          <Animated.View style={[styles.iconWrapper, { transform: [{ scale: rosterScale }] }]}>
            <Icons.Scale
              size={22}
              color={currentTab === "roster" ? "#09090b" : "#a1a1aa"}
            />
          </Animated.View>
          <Text
            numberOfLines={1}
            style={[styles.navText, currentTab === "roster" && styles.navTextActive]}
          >
            {i18n.t("nav.roster", { lng: lang, defaultValue: "Roster" })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleSwitchTab("verify")}
          style={styles.navItem}
        >
          <Animated.View style={[styles.iconWrapper, { transform: [{ scale: verifyScale }] }]}>
            <Icons.ShieldCheck
              size={22}
              color={currentTab === "verify" ? "#09090b" : "#a1a1aa"}
            />
          </Animated.View>
          <Text
            numberOfLines={1}
            style={[styles.navText, currentTab === "verify" && styles.navTextActive]}
          >
            {i18n.t("nav.verify", { lng: lang, defaultValue: "Verify" })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleSwitchTab("registry")}
          style={styles.navItem}
        >
          <Animated.View style={[styles.iconWrapper, { transform: [{ scale: registryScale }] }]}>
            <Icons.Layers
              size={22}
              color={currentTab === "registry" ? "#09090b" : "#a1a1aa"}
            />
          </Animated.View>
          <Text
            numberOfLines={1}
            style={[styles.navText, currentTab === "registry" && styles.navTextActive]}
          >
            {i18n.t("nav.registry", { lng: lang, defaultValue: "Registry" })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings Screen (Opened via Header Avatar Icon) */}
      <Modal
        visible={isSettingsOpen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsSettingsOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <SettingsScreen
            key={lang}
            currentLanguage={lang}
            onClose={() => setIsSettingsOpen(false)}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
  },
  viewport: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
    gap: 3,
  },
  iconWrapper: {
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#71717a",
    letterSpacing: -0.1,
  },
  navTextActive: {
    color: "#09090b",
    fontWeight: "700",
  },
});
