import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { useAuth } from "../lib/auth";
import { Icons } from "../components/ui/icons";
import i18n from "../i18n";

interface LoginScreenProps {
  currentLanguage?: string;
  onToggleLanguage?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  currentLanguage = "en",
  onToggleLanguage,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);

  const logoScale = useRef(new Animated.Value(0.75)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(18)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(formTranslateY, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Invalid email or password. Please try again.";
      Alert.alert("Sign In Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.975,
      tension: 120,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Language Switcher */}
          {onToggleLanguage && (
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.langPill}
                onPress={onToggleLanguage}
                activeOpacity={0.7}
              >
                <Icons.Globe size={13} color="#52525b" />
                <Text style={styles.langText}>
                  {currentLanguage === "hi" ? "English" : "हिन्दी"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Brand Header */}
          <View style={styles.topSection}>
            <Animated.View style={[styles.brandContainer, { transform: [{ scale: logoScale }] }]}>
              <Image
                source={require("../../assets/emblem.jpeg")}
                style={styles.emblemImage}
                resizeMode="contain"
              />
              <View style={styles.brandTextBlock}>
                <Text style={styles.brandTitleText}>eLMV</Text>
                <Text style={styles.brandSubtitleText}>
                  {currentLanguage === "hi" ? "भारत सरकार" : "GOVERNMENT OF INDIA"}
                </Text>
                <Text style={styles.brandDivisionText}>
                  {currentLanguage === "hi" ? "विधिक मापविज्ञान प्रभाग" : "Legal Metrology Division"}
                </Text>
              </View>
            </Animated.View>
            <Text style={styles.heading}>
              {i18n.t("auth.loginHeading", { defaultValue: "Sign in" })}
            </Text>
            <Text style={styles.subheading}>
              {i18n.t("auth.loginSubtitle", { defaultValue: "Enter your credentials to access your account" })}
            </Text>
          </View>

          {/* Animated Form Container */}
          <Animated.View
            style={[
              styles.form,
              {
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              },
            ]}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {i18n.t("auth.email", { defaultValue: "Email" })}
              </Text>
              <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com"
                  placeholderTextColor="#a1a1aa"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {i18n.t("auth.password", { defaultValue: "Password" })}
              </Text>
              <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#a1a1aa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  {showPassword ? (
                    <Icons.EyeOff size={18} color="#71717a" />
                  ) : (
                    <Icons.Eye size={18} color="#71717a" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleSignIn}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={isLoading}
                activeOpacity={0.88}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {i18n.t("auth.signIn", { defaultValue: "Sign In" })}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Quick Demo Fill link */}
            <TouchableOpacity
              onPress={() => {
                setEmail("lmo.jaipur@metrology.gov.in");
                setPassword("Password@123");
              }}
              style={styles.quickFillBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.quickFillText}>
                {i18n.t("auth.demoAccount", { defaultValue: "Use Demo Officer Account" })}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.footerText}>
            {i18n.t("auth.footer", { defaultValue: "eLMV • Govt. of India" })}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f4f4f5",
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  langText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#18181b",
  },
  topSection: {
    marginBottom: 32,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 14,
  },
  emblemImage: {
    width: 48,
    height: 66,
  },
  brandTextBlock: {
    justifyContent: "center",
  },
  brandTitleText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#09090b",
    letterSpacing: -0.6,
  },
  brandSubtitleText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#52525b",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 2,
  },
  brandDivisionText: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#09090b",
    letterSpacing: -0.6,
  },
  subheading: {
    fontSize: 14,
    color: "#71717a",
    marginTop: 6,
    lineHeight: 20,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#09090b",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#f4f4f5",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    backgroundColor: "#ffffff",
    borderColor: "#09090b",
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#09090b",
    paddingVertical: 0,
  },
  eyeBtn: {
    paddingLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    height: 50,
    backgroundColor: "#09090b",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  quickFillBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  quickFillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#71717a",
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#a1a1aa",
    marginTop: 48,
  },
});

