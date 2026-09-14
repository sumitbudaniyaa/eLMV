import React, { useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { ApplicationStatus } from "@sih/shared";
import { Icons } from "../ui/icons";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import i18n from "../../i18n";

interface RosterCardProps {
  application: any;
  onPress: (app: any) => void;
  onStartInspection: (app: any) => void;
  onViewCertificate: (certNumber: string, app: any) => void;
}

export const RosterCard: React.FC<RosterCardProps> = ({
  application,
  onPress,
  onStartInspection,
  onViewCertificate,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.978,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const status = application.status as ApplicationStatus;
  const instrument = application.instrument || {};
  const applicant = application.applicant || {};

  const getStatusBadge = () => {
    switch (status) {
      case ApplicationStatus.CERTIFIED:
        return (
          <Badge
            variant="certified"
            icon={<Icons.CheckCircle2 size={11} color="#059669" />}
          >
            {i18n.t("roster.tabs.certified", { defaultValue: "Certified" })}
          </Badge>
        );
      case ApplicationStatus.SCHEDULED:
        return (
          <Badge
            variant="scheduled"
            icon={<Icons.Clock size={11} color="#0284c7" />}
          >
            {i18n.t("roster.tabs.scheduled", { defaultValue: "Scheduled" })}
          </Badge>
        );
      case ApplicationStatus.REJECTED:
        return (
          <Badge
            variant="rejected"
            icon={<Icons.XCircle size={11} color="#e11d48" />}
          >
            {i18n.t("roster.tabs.rejected", { defaultValue: "Rejected" })}
          </Badge>
        );
      case ApplicationStatus.SUBMITTED:
      default:
        return <Badge variant="secondary">{i18n.t("status.SUBMITTED", { defaultValue: "Submitted" })}</Badge>;
    }
  };

  const formattedDate = application.scheduledDate
    ? new Date(application.scheduledDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(application)}
        style={styles.card}
      >
        {/* Top Header Row: Store Name & Status Badge */}
        <View style={styles.headerRow}>
          <View style={styles.titleArea}>
            <Text style={styles.establishmentName} numberOfLines={1}>
              {applicant.name || "Commercial Trader"}
            </Text>
            <Text style={styles.equipmentSubtitle} numberOfLines={1}>
              {instrument.make} {instrument.model ? `• ${instrument.model}` : ""}
              {instrument.serialNumber ? ` (#${instrument.serialNumber})` : ""}
            </Text>
          </View>
          <View style={styles.badgeRow}>
            {instrument.type ? (
              <Badge
                variant="outline"
                style={{ paddingHorizontal: 6, paddingVertical: 1 }}
              >
                {instrument.type === "NON_AUTOMATIC_WEIGHING_INSTRUMENT"
                  ? "NAWI"
                  : instrument.type === "AUTOMATIC_WEIGHING_INSTRUMENT"
                  ? "AWI"
                  : instrument.type === "FUEL_DISPENSER"
                  ? "Fuel"
                  : instrument.type === "STORAGE_TANK"
                  ? "Tank"
                  : instrument.type === "LENGTH_MEASURE"
                  ? "Length"
                  : instrument.type === "CAPACITY_MEASURE"
                  ? "Capacity"
                  : "Specialized"}
              </Badge>
            ) : null}
            {getStatusBadge()}
            <Icons.ChevronRight size={14} color="#a1a1aa" />
          </View>
        </View>

        {/* Meta Row: Location, Date & App # */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icons.MapPin size={12} color="#71717a" />
            <Text style={styles.metaText} numberOfLines={1}>
              {instrument.district || "Jaipur"}
            </Text>
          </View>

          {formattedDate ? (
            <View style={styles.metaItem}>
              <Icons.Calendar size={12} color="#71717a" />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
          ) : null}

          <Text style={styles.appRefText}>{application.applicationNumber}</Text>
        </View>

        {/* Primary Action Button */}
        {(status === ApplicationStatus.SCHEDULED || status === ApplicationStatus.SUBMITTED) ? (
          <Button
            size="sm"
            onPress={() => onStartInspection(application)}
            icon={<Icons.Play size={12} color="#ffffff" />}
            style={styles.actionBtn}
          >
            {i18n.t("roster.startMpe", { defaultValue: "Inspect" })}
          </Button>
        ) : null}


        {(status === ApplicationStatus.CERTIFIED && application.certificate?.certificateNumber) ? (
          <Button
            size="sm"
            variant="outline"
            onPress={() =>
              onViewCertificate(application.certificate.certificateNumber, application)
            }
            icon={<Icons.QrCode size={13} color="#18181b" />}
            style={styles.outlineActionBtn}
          >
            {i18n.t("roster.viewCert", { defaultValue: "View Certificate" })}
          </Button>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  titleArea: {
    flex: 1,
  },
  establishmentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#09090b",
    letterSpacing: -0.2,
  },
  equipmentSubtitle: {
    fontSize: 12.5,
    color: "#71717a",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#71717a",
  },
  appRefText: {
    fontSize: 10.5,
    color: "#a1a1aa",
    marginLeft: "auto",
  },
  actionBtn: {
    height: 38,
    borderRadius: 10,
    backgroundColor: "#09090b",
  },
  outlineActionBtn: {
    height: 38,
    borderRadius: 10,
    borderColor: "#e4e4e7",
  },
});

