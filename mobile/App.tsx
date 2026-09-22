import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  LogBox,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
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

LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

type MainNavTab = "roster" | "verify" | "registry";

function MainApp() {
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<MainNavTab>("roster");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lang, setLang] = useState<string>("en");

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
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.spring(targetScale, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrentTab(newTab);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />
        <Image
          source={require("./assets/logo.jpeg")}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <Text style={styles.splashTitle}>eLMV</Text>
        <Text style={styles.splashSubtitle}>LEGAL METROLOGY DIVISION</Text>
        <Text style={styles.splashGovt}>GOVERNMENT OF INDIA • भारत सरकार</Text>
        <View style={styles.splashLoaderWrapper}>
          <ActivityIndicator size="small" color="#000000" />
          <Text style={styles.loadingText}>Initializing eLMV Station...</Text>
        </View>
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={true} />

      {/* Officer Header */}
      <OfficerHeader
        onLanguageToggle={toggleLanguage}
        currentLanguage={lang}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Screen Viewport with stable persistent tabs */}
      <View style={styles.viewport}>
        <View style={[styles.tabScreen, currentTab !== "roster" && styles.hiddenScreen]}>
          <RosterScreen key={lang} currentLanguage={lang} />
        </View>
        <View style={[styles.tabScreen, currentTab !== "verify" && styles.hiddenScreen]}>
          <VerifyScreen key={lang} currentLanguage={lang} />
        </View>
        <View style={[styles.tabScreen, currentTab !== "registry" && styles.hiddenScreen]}>
          <RegistryScreen key={lang} currentLanguage={lang} />
        </View>
      </View>

      {/* Bottom Navigation Bar (3 Core Operational Tabs) */}
      <View
        style={[
          styles.bottomNav,
          { paddingBottom: Math.max(insets.bottom, Platform.OS === "android" ? 24 : 8) },
        ]}
      >
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

      {/* Settings Screen (Opened via Header Avatar Icon with Horizontal Push & Swipe-Back) */}
      <Modal
        visible={isSettingsOpen}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={() => setIsSettingsOpen(false)}
      >
        {isSettingsOpen && (
          <SettingsScreen
            key={lang}
            currentLanguage={lang}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
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
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  splashLogo: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#000000",
    letterSpacing: -1,
    marginBottom: 6,
  },
  splashSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  splashGovt: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
    letterSpacing: 0.8,
    marginBottom: 28,
  },
  splashLoaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000000",
  },
  viewport: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabScreen: {
    flex: 1,
  },
  hiddenScreen: {
    display: "none",
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
    paddingTop: 8,
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
