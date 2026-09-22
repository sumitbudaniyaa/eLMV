import React, { useEffect, useRef, useState } from "react";
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
  Platform,
} from "react-native";
import { ApplicationStatus } from "@sih/shared";
import { Icons } from "../ui/icons";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import i18n from "../../i18n";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ApplicationDrawerProps {
  visible: boolean;
  onClose: () => void;
  application: any | null;
  onSchedule?: (app: any) => void;
  onStartInspection?: (app: any) => void;
  onViewCertificate?: (certNumber: string, app: any) => void;
}

export const ApplicationDrawer: React.FC<ApplicationDrawerProps> = ({
  visible,
  onClose,
  application,
  onSchedule,
  onStartInspection,
  onViewCertificate,
}) => {
  const [modalVisible, setModalVisible] = useState(visible);
  const [cachedApp, setCachedApp] = useState(application);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (application) {
      setCachedApp(application);
    }
  }, [application]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
      if (callback) callback();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 0.55) {
          handleDismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 70,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!modalVisible && !visible) return null;

  const app = application || cachedApp;
  if (!app) return null;

  const status = app.status as ApplicationStatus;
  const instrument = app.instrument || {};
  const applicant = app.applicant || {};
  const certificate = app.certificate || {};

  const getStatusBadge = () => {
    switch (status) {
      case ApplicationStatus.CERTIFIED:
        return (
          <Badge
            variant="certified"
            icon={<Icons.CheckCircle2 size={12} color="#059669" />}
          >
            Certified & Stamped
          </Badge>
        );
      case ApplicationStatus.SCHEDULED:
        return (
          <Badge
            variant="scheduled"
            icon={<Icons.Clock size={12} color="#0284c7" />}
          >
            Scheduled Visit
          </Badge>
        );
      case ApplicationStatus.REJECTED:
        return (
          <Badge
            variant="rejected"
            icon={<Icons.XCircle size={12} color="#e11d48" />}
          >
            Rejected (Exceeds MPE)
          </Badge>
        );
      case ApplicationStatus.SUBMITTED:
      default:
        return <Badge variant="secondary">Submitted</Badge>;
    }
  };

  const formattedDate = app.scheduledDate
    ? new Date(app.scheduledDate).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const formattedTime = app.scheduledDate
    ? new Date(app.scheduledDate).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <RNModal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={() => handleDismiss()}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => handleDismiss()}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.drawerInner}>
            {/* Drag Handle with PanResponder */}
            <View {...panResponder.panHandlers} style={styles.handleWrapper}>
              <View style={styles.handle} />
            </View>

            {/* Header with PanResponder for drag-down */}
            <View {...panResponder.panHandlers} style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.titleRow}>
                  <Text style={styles.appNumber}>{app.applicationNumber}</Text>
                  {getStatusBadge()}
                </View>
                <Text style={styles.appType}>
                  {app.type === "NEW" ? "New Stamping" : "Periodic Renewal"}
                  {app.submittedAt
                    ? ` • Applied ${new Date(app.submittedAt).toLocaleDateString()}`
                    : ""}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDismiss()}
                style={styles.closeBtn}
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              >
                <Icons.X size={16} color="#71717a" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {/* Section: Establishment / Owner */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Commercial Establishment</Text>
                <View style={styles.cardBox}>
                  <View style={styles.infoRow}>
                    <Icons.Building size={15} color="#71717a" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.infoTitle}>{applicant.name || "Commercial Establishment"}</Text>
                      <Text style={styles.infoSubtitle}>
                        {instrument.district || "Jaipur"}, {instrument.state || "Rajasthan"}
                      </Text>
                    </View>
                  </View>

                  {applicant.email ? (
                    <View style={styles.subRow}>
                      <Text style={styles.rowLabel}>Email</Text>
                      <Text style={styles.rowValue}>{applicant.email}</Text>
                    </View>
                  ) : null}

                  {applicant.phone ? (
                    <View style={styles.subRow}>
                      <Text style={styles.rowLabel}>Phone</Text>
                      <Text style={styles.rowValue}>{applicant.phone}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Section: Measuring Equipment */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>{i18n.t("drawer.equipment", { defaultValue: "Equipment Specifications" })}</Text>
                <View style={styles.cardBox}>
                  <View style={styles.infoRow}>
                    <Icons.Scale size={15} color="#71717a" style={styles.rowIcon} />
                    <View style={styles.rowContent}>
                      <Text style={styles.infoTitle}>
                        {instrument.make} {instrument.model ? `• ${instrument.model}` : ""}
                      </Text>
                      <Text style={styles.infoSubtitle}>
                        {instrument.type ? instrument.type.replace(/_/g, " ") : "Measuring Instrument"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.subRow}>
                    <Text style={styles.rowLabel}>{i18n.t("drawer.serialNumber", { defaultValue: "Serial Number" })}</Text>
                    <Text style={[styles.rowValue, styles.monoText]}>#{instrument.serialNumber || "N/A"}</Text>
                  </View>

                  <View style={styles.subRow}>
                    <Text style={styles.rowLabel}>{i18n.t("drawer.capacity", { defaultValue: "Capacity" })}</Text>
                    <Text style={styles.rowValue}>{instrument.capacity} {instrument.unit}</Text>
                  </View>

                  <View style={styles.subRow}>
                    <Text style={styles.rowLabel}>{i18n.t("drawer.accuracyClass", { defaultValue: "Accuracy Class" })}</Text>
                    <Text style={styles.rowValue}>{instrument.accuracyClass || "Class III"}</Text>
                  </View>

                  {instrument.verificationInterval ? (
                    <View style={styles.subRow}>
                      <Text style={styles.rowLabel}>{i18n.t("drawer.interval", { defaultValue: "Verification Interval" })}</Text>
                      <Text style={styles.rowValue}>{instrument.verificationInterval}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Section: Visit Details */}
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>{i18n.t("drawer.verificationSchedule", { defaultValue: "Verification Schedule" })}</Text>
                <View style={styles.cardBox}>
                  <View style={styles.subRow}>
                    <Text style={styles.rowLabel}>{i18n.t("drawer.scheduledDate", { defaultValue: "Scheduled Date" })}</Text>
                    <Text style={styles.rowValue}>
                      {formattedDate ? `${formattedDate}${formattedTime ? ` at ${formattedTime}` : ""}` : "Pending Scheduling"}
                    </Text>
                  </View>

                  {app.feeAmount ? (
                    <View style={styles.subRow}>
                      <Text style={styles.rowLabel}>{i18n.t("drawer.statutoryFee", { defaultValue: "Statutory Fee" })}</Text>
                      <Text style={styles.rowValue}>₹{app.feeAmount} ({app.feeStatus || "PAID"})</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Section: Certificate Details (if present) */}
              {certificate.certificateNumber ? (
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>{i18n.t("drawer.issuedCertificate", { defaultValue: "Issued Certificate" })}</Text>
                  <View style={[styles.cardBox, styles.certBox]}>
                    <View style={styles.subRow}>
                      <Text style={styles.rowLabel}>{i18n.t("drawer.certNumber", { defaultValue: "Certificate Number" })}</Text>
                      <Text style={[styles.rowValue, styles.monoText]}>{certificate.certificateNumber}</Text>
                    </View>
                    <View style={styles.subRow}>
                      <Text style={styles.rowLabel}>{i18n.t("drawer.validUntil", { defaultValue: "Valid Until" })}</Text>
                      <Text style={[styles.rowValue, styles.validDate]}>
                        {certificate.validUntil ? new Date(certificate.validUntil).toLocaleDateString() : "Active"}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </ScrollView>

            {/* Bottom Action Footer */}
            <View style={styles.footer}>
              {status === ApplicationStatus.SUBMITTED && onSchedule ? (
                <Button
                  size="lg"
                  onPress={() => {
                    handleDismiss(() => {
                      onSchedule(app);
                    });
                  }}
                  icon={<Icons.Calendar size={15} color="#ffffff" />}
                  style={styles.primaryCta}
                >
                  {i18n.t("roster.scheduleVisit", { defaultValue: "Schedule Inspection Visit" })}
                </Button>
              ) : null}

              {status === ApplicationStatus.SCHEDULED && onStartInspection ? (
                <Button
                  size="lg"
                  onPress={() => {
                    handleDismiss(() => {
                      onStartInspection(app);
                    });
                  }}
                  icon={<Icons.Play size={15} color="#ffffff" />}
                  style={styles.primaryCta}
                >
                  {i18n.t("roster.startMpe", { defaultValue: "Start MPE Inspection" })}
                </Button>
              ) : null}

              {(status === ApplicationStatus.CERTIFIED && certificate.certificateNumber) && onViewCertificate ? (
                <Button
                  size="lg"
                  variant="outline"
                  onPress={() => {
                    handleDismiss(() => {
                      onViewCertificate(certificate.certificateNumber, app);
                    });
                  }}
                  icon={<Icons.QrCode size={16} color="#09090b" />}
                  style={styles.outlineCta}
                >
                  {i18n.t("roster.viewCert", { defaultValue: "View Certificate / QR" })}
                </Button>
              ) : null}
            </View>
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  drawer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  drawerInner: {
    maxHeight: "100%",
  },
  handleWrapper: {
    width: "100%",
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: "center",
  },
  handle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: "#d4d4d8",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f5",
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  appNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#09090b",
    letterSpacing: -0.4,
  },
  appType: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  section: {
    gap: 6,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "600",
    color: "#71717a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardBox: {
    backgroundColor: "#fafafa",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f4f4f5",
    padding: 14,
    gap: 8,
  },
  certBox: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowIcon: {
    marginTop: 1,
  },
  rowContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#09090b",
    letterSpacing: -0.2,
  },
  infoSubtitle: {
    fontSize: 12,
    color: "#71717a",
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#e4e4e7",
    marginVertical: 4,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  rowLabel: {
    fontSize: 12,
    color: "#71717a",
  },
  rowValue: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#09090b",
    maxWidth: "65%",
    textAlign: "right",
  },
  monoText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: -0.3,
  },
  validDate: {
    color: "#059669",
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 8 : 28,
    borderTopWidth: 1,
    borderTopColor: "#f4f4f5",
    backgroundColor: "#ffffff",
  },
  primaryCta: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#09090b",
  },
  outlineCta: {
    height: 48,
    borderRadius: 12,
    borderColor: "#e4e4e7",
  },
});
