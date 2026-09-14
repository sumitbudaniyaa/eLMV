import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal as RNModal,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
  StatusBar,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
import { useAuth } from "../lib/auth";
import { mobileApi } from "../lib/api";
import { theme } from "../components/ui/theme";
import { Icons } from "../components/ui/icons";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import i18n from "../i18n";
import { Role } from "@sih/shared";

interface SettingsScreenProps {
  currentLanguage: string;
  onToggleLanguage?: () => void;
  onClose?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentLanguage,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshProfile } = useAuth();
  const isHindi = currentLanguage === "hi";

  // Profile Edit Dialog State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password State & Dialog
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Horizontal Slide Animation (Right to Left) & Swipe-Right-to-Dismiss
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: 0,
      damping: 24,
      mass: 0.9,
      stiffness: 240,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDismiss = () => {
    Animated.timing(translateX, {
      toValue: SCREEN_WIDTH,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose();
    });
  };

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchLastX = useRef(0);
  const touchLastTime = useRef(0);
  const isSwipingRight = useRef(false);

  const handleTouchStart = (e: any) => {
    if (isEditModalOpen || isPasswordModalOpen) return;
    const pageX = e.nativeEvent.pageX || 0;
    const pageY = e.nativeEvent.pageY || 0;
    touchStartX.current = pageX;
    touchStartY.current = pageY;
    touchLastX.current = pageX;
    touchLastTime.current = Date.now();
    isSwipingRight.current = false;
  };

  const handleTouchMove = (e: any) => {
    if (isEditModalOpen || isPasswordModalOpen) return;
    const currentX = e.nativeEvent.pageX || 0;
    const currentY = e.nativeEvent.pageY || 0;
    const dx = currentX - touchStartX.current;
    const dy = currentY - touchStartY.current;

    if (!isSwipingRight.current) {
      if (dx > 8 && Math.abs(dx) > Math.abs(dy) * 1.1) {
        isSwipingRight.current = true;
        setScrollEnabled(false);
        translateX.stopAnimation();
      }
    }

    if (isSwipingRight.current) {
      touchLastX.current = currentX;
      touchLastTime.current = Date.now();
      translateX.setValue(Math.max(0, dx));
    }
  };

  const handleTouchEnd = (e: any) => {
    if (!isSwipingRight.current) return;
    isSwipingRight.current = false;
    setScrollEnabled(true);

    const currentX = e.nativeEvent?.pageX || touchLastX.current;
    const dx = currentX - touchStartX.current;
    const elapsed = Math.max(1, Date.now() - touchLastTime.current);
    const vx = (currentX - touchLastX.current) / elapsed;

    if (dx > 50 || (dx > 15 && vx > 0.2)) {
      handleDismiss();
    } else {
      Animated.spring(translateX, {
        toValue: 0,
        damping: 24,
        stiffness: 240,
        useNativeDriver: true,
      }).start();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isEditModalOpen || isPasswordModalOpen) return false;
        const isEdgeSwipe =
          gestureState.x0 < 60 &&
          gestureState.dx > 6 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const isScreenSwipe =
          gestureState.dx > 10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2;
        return isEdgeSwipe || isScreenSwipe;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        if (isEditModalOpen || isPasswordModalOpen) return false;
        const isEdgeSwipe =
          gestureState.x0 < 60 &&
          gestureState.dx > 6 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        const isScreenSwipe =
          gestureState.dx > 10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.2;
        return isEdgeSwipe || isScreenSwipe;
      },
      onPanResponderGrant: () => {
        translateX.stopAnimation();
        setScrollEnabled(false);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        } else {
          translateX.setValue(0);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, gestureState) => {
        setScrollEnabled(true);
        if (gestureState.dx > 50 || (gestureState.dx > 15 && gestureState.vx > 0.25)) {
          handleDismiss();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            damping: 24,
            stiffness: 240,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setScrollEnabled(true);
        Animated.spring(translateX, {
          toValue: 0,
          damping: 24,
          stiffness: 240,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const backdropOpacity = translateX.interpolate({
    inputRange: [0, SCREEN_WIDTH],
    outputRange: [0.35, 0],
    extrapolate: "clamp",
  });

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  const openEditModal = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setIsEditModalOpen(true);
  };

  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
    setIsPasswordModalOpen(true);
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      Alert.alert(
        isHindi ? "अमान्य नाम" : "Invalid Name",
        isHindi
          ? "कृपया कम से कम 2 अक्षरों का मान्य नाम दर्ज करें।"
          : "Please enter a valid full name (minimum 2 characters)."
      );
      return;
    }

    if (editPhone && !/^[6-9]\d{9}$/.test(editPhone.trim())) {
      Alert.alert(
        isHindi ? "अमान्य फ़ोन" : "Invalid Phone",
        isHindi
          ? "कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें।"
          : "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await mobileApi.patch("/users/credentials", {
        name: editName.trim(),
        phone: editPhone.trim(),
        email: user?.email,
      });

      await refreshProfile();
      setIsEditModalOpen(false);
      Alert.alert(
        isHindi ? "सफलता" : "Success",
        isHindi
          ? "आपकी क्रेडेंशियल प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई है।"
          : "Your account credentials have been updated successfully."
      );
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message;
      Alert.alert(
        isHindi ? "अपडेट विफल" : "Update Failed",
        serverMsg ||
          (isHindi
            ? "क्रेडेंशियल अपडेट करने में विफल। कृपया पुनः प्रयास करें।"
            : "Failed to update credentials. Please try again.")
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert(
        isHindi ? "आवश्यक" : "Required",
        isHindi
          ? "कृपया अपना वर्तमान पासवर्ड दर्ज करें।"
          : "Please enter your current password."
      );
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        isHindi ? "अमान्य पासवर्ड" : "Invalid Password",
        isHindi
          ? "नया पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।"
          : "New password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        isHindi ? "पासवर्ड मेल नहीं खाते" : "Password Mismatch",
        isHindi
          ? "नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते हैं।"
          : "New password and confirmation password do not match."
      );
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await mobileApi.post("/users/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      Alert.alert(
        isHindi ? "सफलता" : "Success",
        isHindi
          ? "आपका पासवर्ड सफलतापूर्वक बदल दिया गया है।"
          : "Your password has been changed successfully."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordModalOpen(false);
    } catch (err: any) {
      const serverMsg = err.response?.data?.error?.message;
      Alert.alert(
        isHindi ? "पासवर्ड अपडेट विफल" : "Password Update Failed",
        serverMsg ||
          (isHindi
            ? "पासवर्ड बदलने में विफल। कृपया अपना वर्तमान पासवर्ड जांचें।"
            : "Failed to change password. Please verify your current password.")
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogoutConfirm = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of the mobile workstation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          if (onClose) onClose();
          logout();
        },
      },
    ]);
  };

  const roleTitle =
    user?.role === Role.GATC_INSPECTOR
      ? "GATC Laboratory Field Inspector"
      : user?.role === Role.LMO
      ? "Legal Metrology Officer (Enforcement)"
      : "Statutory Officer";

  const badgeNumber =
    user?.officerProfile?.badgeNumber || user?.gatcInspectorProfile?.employeeId || "LM-OFF-2026";
  const jurisdiction =
    user?.officerProfile?.jurisdictionDistrict ||
    user?.gatcInspectorProfile?.gatc?.district ||
    "Jaipur, Rajasthan";

  return (
    <View style={styles.rootWrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" animated={true} />

      {/* Animated Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />

      {/* Horizontally Animated Screen Container with Swipe-Right Handler */}
      <Animated.View
        style={[
          styles.animatedScreen,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Top Header Section with Matching White Status Bar Extension */}
        <View style={[styles.headerSafeArea, { paddingTop: insets.top }]}>
          <View
            style={styles.topHeader}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {onClose && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDismiss}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Go back"
              >
                <Icons.ChevronLeft size={24} color="#0B2545" />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>
              {isHindi ? "प्रोफ़ाइल" : "Profile"}
            </Text>
          </View>
        </View>

        {/* Scrollable Content Body */}
        <View style={styles.contentBody}>
          <ScrollView
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            directionalLockEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
        {/* 1. CENTERED PROFILE HERO: Profile Icon in Middle, then Name & Details */}
        <View style={styles.profileHero}>
          <View style={styles.largeAvatarContainer}>
            <View style={styles.largeAvatar}>
              <Icons.User size={38} color="#ffffff" />
            </View>
            <View style={styles.onlineStatusBadge}>
              <View style={styles.onlineDot} />
            </View>
          </View>

          <Text style={styles.heroName}>{user?.name || "Statutory Inspector"}</Text>

          <View style={styles.roleBadgeContainer}>
            <Badge variant="outline" style={styles.heroRoleBadge}>
              <Text style={styles.heroRoleText}>{roleTitle}</Text>
            </Badge>
          </View>

          <Text style={styles.heroSubtext}>
            {jurisdiction} • {badgeNumber}
          </Text>
        </View>

        {/* 2. OFFICER DETAILS CARD (Read-Only with Edit Details Trigger) */}
        <Card style={styles.card}>
          <CardHeader style={{ paddingBottom: 6 }}>
            <CardTitle style={{ fontSize: 14 }}>
              {isHindi ? "अधिकारी विवरण" : "Officer Details"}
            </CardTitle>
          </CardHeader>
          <CardContent style={{ paddingTop: 0 }}>
            {/* Full Name Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrapper}>
                <Icons.User size={15} color="#0B2545" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{isHindi ? "पूरा नाम" : "Full Name"}</Text>
                <Text style={styles.detailValue}>{user?.name || "—"}</Text>
              </View>
            </View>

            {/* Contact Mobile Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrapper}>
                <Icons.Phone size={15} color="#0B2545" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{isHindi ? "संपर्क मोबाइल नंबर" : "Contact Mobile"}</Text>
                <Text style={[styles.detailValue, styles.fontMono]}>
                  {user?.phone ? `+91 ${user.phone}` : (isHindi ? "उपलब्ध नहीं" : "Not provided")}
                </Text>
              </View>
            </View>

            {/* Registered Email Row (Locked) */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrapper}>
                <Icons.Lock size={15} color="#71717a" />
              </View>
              <View style={styles.detailContent}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={styles.detailLabel}>{isHindi ? "पंजीकृत ईमेल आईडी" : "Registered Email ID"}</Text>
                  <View style={styles.lockedPill}>
                    <Icons.Lock size={10} color="#b45309" />
                    <Text style={styles.lockedPillText}>{isHindi ? "अपरिवर्तनीय" : "Locked"}</Text>
                  </View>
                </View>
                <Text style={[styles.detailValue, styles.fontMono, { color: "#52525b" }]}>
                  {user?.email || "—"}
                </Text>
              </View>
            </View>

            {/* Badge & Jurisdiction Meta Rows */}
            <View style={styles.metaContainer}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>{isHindi ? "बैज संख्या" : "Badge No."}</Text>
                <Text style={[styles.metaVal, styles.fontMono]}>{badgeNumber}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>{isHindi ? "अधिकार क्षेत्र" : "Jurisdiction"}</Text>
                <Text style={styles.metaVal} numberOfLines={1}>{jurisdiction}</Text>
              </View>
            </View>

            {/* Large Edit Details Action Button */}
            <Button
              variant="outline"
              size="sm"
              onPress={openEditModal}
              style={styles.editActionButton}
              icon={<Icons.Pencil size={14} color="#0B2545" />}
            >
              {isHindi ? "विवरण संपादित करें" : "Edit Details"}
            </Button>
          </CardContent>
        </Card>

        {/* 3. SECURITY & PASSWORD MANAGEMENT */}
        <Card style={styles.card}>
          <CardHeader style={{ paddingBottom: 6 }}>
            <CardTitle style={{ fontSize: 14 }}>
              {isHindi ? "सुरक्षा एवं पासवर्ड" : "Security & Password"}
            </CardTitle>
          </CardHeader>
          <CardContent style={{ paddingTop: 0 }}>
            {/* Password Status Row */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconWrapper}>
                <Icons.Lock size={15} color="#0B2545" />
              </View>
              <View style={styles.detailContent}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={styles.detailLabel}>{isHindi ? "खाता पासवर्ड" : "Account Password"}</Text>
                  <View style={[styles.lockedPill, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#059669", marginRight: 4 }} />
                    <Text style={[styles.lockedPillText, { color: "#047857" }]}>
                      {isHindi ? "सुरक्षित" : "Protected"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.detailValue, { fontSize: 16, letterSpacing: 2, color: "#52525b" }]}>
                  ••••••••••••
                </Text>
              </View>
            </View>

            {/* Change Password Action Button */}
            <Button
              variant="outline"
              size="sm"
              onPress={openPasswordModal}
              style={styles.editActionButton}
              icon={<Icons.Key size={14} color="#0B2545" />}
            >
              {isHindi ? "पासवर्ड बदलें" : "Change Password"}
            </Button>
          </CardContent>
        </Card>

        {/* 4. SIGN OUT BUTTON */}
        <Button
          variant="destructive"
          size="lg"
          onPress={handleLogoutConfirm}
          icon={<Icons.LogOut size={16} color="#ffffff" />}
          style={styles.logoutButton}
        >
          {i18n.t("auth.logout")}
        </Button>

        <Text style={styles.statutoryFooter}>
          National Legal Metrology Online Stamping & Verification System
          {"\n"}Standardization under Legal Metrology Act, 2009 & Rules 2011
        </Text>
      </ScrollView>

      {/* Left Edge Gesture Strip for Instant Native-Like Swipe-Back */}
      <View
        style={styles.leftEdgeSwipeStrip}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
    </View>
  </Animated.View>

      {/* ========================================================================= */}
      {/* 5. EDIT DETAILS DIALOG BOX / MODAL                                        */}
      {/* ========================================================================= */}
      <RNModal
        visible={isEditModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialogCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {isHindi ? "अधिकारी विवरण संपादित करें" : "Edit Profile Details"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isHindi
                    ? "अपना नाम और 10 अंकों का संपर्क नंबर अपडेट करें।"
                    : "Update your name and 10-digit mobile number."}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icons.X size={18} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Email (Read Only & Locked) */}
            <View style={styles.modalFieldGroup}>
              <View style={styles.fieldHeaderRow}>
                <Text style={styles.modalFieldLabel}>
                  {isHindi ? "पंजीकृत ईमेल आईडी" : "Registered Email ID"}
                </Text>
                <View style={styles.lockedPill}>
                  <Icons.Lock size={10} color="#b45309" />
                  <Text style={styles.lockedPillText}>
                    {isHindi ? "अपरिवर्तनीय" : "Locked"}
                  </Text>
                </View>
              </View>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{user?.email}</Text>
                <Icons.Lock size={13} color="#a1a1aa" />
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.modalFieldGroup}>
              <Text style={styles.modalFieldLabel}>
                {isHindi ? "पूरा नाम" : "Full Name"} *
              </Text>
              <Input
                value={editName}
                onChangeText={setEditName}
                placeholder={isHindi ? "अपना पूरा नाम दर्ज करें" : "Enter your full name"}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>

            {/* Contact Mobile (Max 10 digits, numeric only) */}
            <View style={styles.modalFieldGroup}>
              <Text style={styles.modalFieldLabel}>
                {isHindi ? "संपर्क मोबाइल नंबर (+91)" : "Contact Mobile Number (+91)"} *
              </Text>
              <Input
                value={editPhone}
                onChangeText={(val) => setEditPhone(val.replace(/\D/g, "").slice(0, 10))}
                placeholder={isHindi ? "10 अंकों का मोबाइल नंबर" : "10-digit mobile number"}
                keyboardType="phone-pad"
                maxLength={10}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>

            {/* Dialog Footer Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                style={styles.modalCancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>
                  {isHindi ? "रद्द करें" : "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={isUpdatingProfile}
                style={[styles.modalSaveBtn, isUpdatingProfile && { opacity: 0.7 }]}
                activeOpacity={0.7}
              >
                {isUpdatingProfile ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>
                    {isHindi ? "परिवर्तन सहेजें" : "Save Changes"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RNModal>

      {/* ========================================================================= */}
      {/* 6. CHANGE PASSWORD DIALOG BOX / MODAL                                     */}
      {/* ========================================================================= */}
      <RNModal
        visible={isPasswordModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPasswordModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialogCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {isHindi ? "पासवर्ड बदलें" : "Change Password"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isHindi
                    ? "सुरक्षा के लिए अपना वर्तमान और नया पासवर्ड दर्ज करें।"
                    : "Enter your current and new password (min. 8 characters)."}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPasswordModalOpen(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icons.X size={18} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Current Password with Eye Toggle */}
            <View style={styles.modalFieldGroup}>
              <Text style={styles.modalFieldLabel}>
                {isHindi ? "वर्तमान पासवर्ड" : "Current Password"} *
              </Text>
              <View style={styles.passwordInputWrapper}>
                <Input
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPass}
                  placeholder={isHindi ? "वर्तमान पासवर्ड दर्ज करें" : "Enter current password"}
                  containerStyle={{ marginBottom: 0, flex: 1 }}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPass(!showCurrentPass)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  {showCurrentPass ? (
                    <Icons.EyeOff size={18} color="#71717a" />
                  ) : (
                    <Icons.Eye size={18} color="#71717a" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password with Eye Toggle */}
            <View style={styles.modalFieldGroup}>
              <Text style={styles.modalFieldLabel}>
                {isHindi ? "नया पासवर्ड" : "New Password"} *
              </Text>
              <View style={styles.passwordInputWrapper}>
                <Input
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPass}
                  placeholder={isHindi ? "नया पासवर्ड (न्यूनतम 8 अक्षर)" : "New password (min. 8 chars)"}
                  containerStyle={{ marginBottom: 0, flex: 1 }}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPass(!showNewPass)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  {showNewPass ? (
                    <Icons.EyeOff size={18} color="#71717a" />
                  ) : (
                    <Icons.Eye size={18} color="#71717a" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password with Eye Toggle */}
            <View style={styles.modalFieldGroup}>
              <Text style={styles.modalFieldLabel}>
                {isHindi ? "नए पासवर्ड की पुष्टि करें" : "Confirm New Password"} *
              </Text>
              <View style={styles.passwordInputWrapper}>
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPass}
                  placeholder={isHindi ? "नया पासवर्ड पुनः दर्ज करें" : "Re-enter new password"}
                  containerStyle={{ marginBottom: 0, flex: 1 }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPass(!showConfirmPass)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  {showConfirmPass ? (
                    <Icons.EyeOff size={18} color="#71717a" />
                  ) : (
                    <Icons.Eye size={18} color="#71717a" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Dialog Footer Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setIsPasswordModalOpen(false)}
                style={styles.modalCancelBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText}>
                  {isHindi ? "रद्द करें" : "Cancel"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={isUpdatingPassword}
                style={[styles.modalSaveBtn, isUpdatingPassword && { opacity: 0.7 }]}
                activeOpacity={0.7}
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>
                    {isHindi ? "पासवर्ड अपडेट करें" : "Update Password"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RNModal>
    </View>
  );
};

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: "transparent",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
  animatedScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    shadowColor: "#000000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerSafeArea: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    gap: 12,
  },
  contentBody: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  leftEdgeSwipeStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 36,
    zIndex: 999,
    elevation: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B2545",
    letterSpacing: -0.3,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === "android" ? 64 : 40,
  },

  // Centered Profile Hero
  profileHero: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginBottom: 16,
  },
  largeAvatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  largeAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#0B2545",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#e0e7ff",
    shadowColor: "#0B2545",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  onlineStatusBadge: {
    position: "absolute",
    bottom: 0,
    right: 2,
    backgroundColor: "#ffffff",
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
  },
  heroName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0B2545",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  roleBadgeContainer: {
    marginTop: 6,
    marginBottom: 4,
  },
  heroRoleBadge: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
  },
  heroRoleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534",
  },
  heroSubtext: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 3,
    textAlign: "center",
  },

  // Cards & Layout
  card: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderWithAction: {
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  editHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f4f4f5",
  },
  editHeaderBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0B2545",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Detail Rows
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
    gap: 12,
  },
  detailIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f0f4f8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#71717a",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#18181b",
    marginTop: 2,
  },
  lockedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  lockedPillText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#b45309",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    marginBottom: 12,
  },
  metaCol: {
    flex: 1,
  },
  metaDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 10,
  },
  metaLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "500",
  },
  metaVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  fontMono: {
    fontFamily: "Courier",
  },
  editActionButton: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    height: 40,
  },

  // Password & Inputs
  fieldGroup: {
    marginBottom: 12,
  },
  fieldHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 6,
  },
  readOnlyInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
    backgroundColor: "#f4f4f5",
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
  },
  readOnlyText: {
    fontSize: 12,
    fontFamily: "Courier",
    color: "#71717a",
  },
  helperText: {
    fontSize: 10.5,
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  actionBtn: {
    marginTop: 6,
    width: "100%",
  },
  logoutButton: {
    marginTop: 8,
    width: "100%",
  },
  statutoryFooter: {
    textAlign: "center",
    fontSize: 10,
    color: theme.colors.mutedForeground,
    marginTop: 24,
    lineHeight: 14,
  },

  // Modal / Dialog Box Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalDialogCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B2545",
  },
  modalSubtitle: {
    fontSize: 11,
    color: "#71717a",
    marginTop: 3,
  },
  modalCloseBtn: {
    padding: 4,
    marginLeft: 8,
  },
  modalFieldGroup: {
    marginBottom: 14,
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#18181b",
    marginBottom: 6,
  },
  modalActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f4f4f5",
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#52525b",
  },
  modalSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#0B2545",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});
