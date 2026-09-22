import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { mobileApi } from "../../lib/api";
import { theme } from "../ui/theme";
import { Icons } from "../ui/icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import i18n from "../../i18n";

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  application: any;
  onScheduleComplete: () => void;
}

const TIME_SLOTS = [
  { label: "10:00 AM", hour: 10, minute: 0 },
  { label: "11:30 AM", hour: 11, minute: 30 },
  { label: "02:00 PM", hour: 14, minute: 0 },
  { label: "04:00 PM", hour: 16, minute: 0 },
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  visible,
  onClose,
  application,
  onScheduleComplete,
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(1); // default: Tomorrow (1)
  const [selectedTimeSlotIndex, setSelectedTimeSlotIndex] = useState<number>(0); // default: 10:00 AM
  const [customDateStr, setCustomDateStr] = useState<string>("");
  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);
  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      setSelectedDayOffset(1);
      setSelectedTimeSlotIndex(0);
      setIsCustomDate(false);
      setCustomDateStr("");
      setRemarks("");
    }
  }, [visible, application]);

  if (!application) return null;

  const instrument = application.instrument || {};
  const applicant = application.applicant || {};

  // Compute resolved appointment Date object
  const getAppointmentDate = (): Date => {
    const slot = TIME_SLOTS[selectedTimeSlotIndex] || TIME_SLOTS[0];
    if (isCustomDate && customDateStr.trim()) {
      const parsed = new Date(customDateStr.trim());
      if (!isNaN(parsed.getTime())) {
        parsed.setHours(slot.hour, slot.minute, 0, 0);
        return parsed;
      }
    }
    const d = new Date();
    d.setDate(d.getDate() + selectedDayOffset);
    d.setHours(slot.hour, slot.minute, 0, 0);
    return d;
  };

  const appointmentDate = getAppointmentDate();

  const formattedAppointment = appointmentDate.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (isCustomDate && customDateStr.trim() && isNaN(new Date(customDateStr.trim()).getTime())) {
      Alert.alert("Invalid Date", "Please enter a valid date in YYYY-MM-DD format.");
      return;
    }

    setIsSubmitting(true);
    try {
      await mobileApi.patch(`/applications/${application.id}/schedule`, {
        scheduledDate: appointmentDate.toISOString(),
        remarks: remarks.trim() || undefined,
      });

      Alert.alert(
        "Inspection Scheduled",
        `Verification visit confirmed for ${formattedAppointment}. Application status is now SCHEDULED.`,
        [
          {
            text: "OK",
            onPress: () => {
              onClose();
              onScheduleComplete();
            },
          },
        ]
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Could not schedule inspection appointment. Please try again.";
      Alert.alert("Scheduling Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={i18n.t("roster.scheduleVisit", { defaultValue: "Schedule Verification Visit" })}
      description={`Set appointment date for #${application.applicationNumber}`}
      footer={
        <View style={styles.footerRow}>
          <Button
            variant="outline"
            size="md"
            onPress={onClose}
            disabled={isSubmitting}
            style={[styles.footerBtn, { flex: 1 }]}
          >
            {i18n.t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="default"
            size="md"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            icon={<Icons.Calendar size={15} color="#ffffff" />}
            style={[styles.footerBtn, { flex: 2 }]}
          >
            {isSubmitting
              ? "Scheduling..."
              : i18n.t("roster.confirmSchedule", { defaultValue: "Confirm Schedule" })}
          </Button>
        </View>
      }
    >
      {/* Trader & Instrument Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Icons.Building size={14} color="#71717a" />
          <Text style={styles.summaryName} numberOfLines={1}>
            {applicant.name || "Commercial Trader"}
          </Text>
        </View>
        <Text style={styles.summaryDetails} numberOfLines={1}>
          {instrument.make} {instrument.model ? `• ${instrument.model}` : ""}
          {instrument.serialNumber ? ` (#${instrument.serialNumber})` : ""}
          {instrument.capacity ? ` • ${instrument.capacity} ${instrument.unit}` : ""}
        </Text>
      </View>

      {/* Date Presets */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {i18n.t("roster.selectDate", { defaultValue: "Select Visit Date" })}
        </Text>
        <View style={styles.chipGrid}>
          {[
            { label: "Today", offset: 0 },
            { label: "Tomorrow", offset: 1 },
            { label: "+2 Days", offset: 2 },
            { label: "+3 Days", offset: 3 },
            { label: "+1 Week", offset: 7 },
          ].map((item) => {
            const isSelected = !isCustomDate && selectedDayOffset === item.offset;
            return (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  setIsCustomDate(false);
                  setSelectedDayOffset(item.offset);
                }}
                style={[styles.chip, isSelected && styles.chipActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => setIsCustomDate(true)}
            style={[styles.chip, isCustomDate && styles.chipActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isCustomDate && styles.chipTextActive]}>
              Custom Date
            </Text>
          </TouchableOpacity>
        </View>

        {isCustomDate && (
          <View style={styles.customDateContainer}>
            <Input
              label="Custom Date (YYYY-MM-DD)"
              placeholder="e.g. 2026-09-25"
              value={customDateStr}
              onChangeText={setCustomDateStr}
              containerStyle={{ marginTop: 8 }}
            />
          </View>
        )}
      </View>

      {/* Time Slot Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {i18n.t("roster.selectTime", { defaultValue: "Select Appointment Time" })}
        </Text>
        <View style={styles.chipGrid}>
          {TIME_SLOTS.map((slot, idx) => {
            const isSelected = selectedTimeSlotIndex === idx;
            return (
              <TouchableOpacity
                key={slot.label}
                onPress={() => setSelectedTimeSlotIndex(idx)}
                style={[styles.chip, isSelected && styles.chipActive]}
                activeOpacity={0.7}
              >
                <Icons.Clock
                  size={12}
                  color={isSelected ? "#ffffff" : "#71717a"}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Appointment Live Summary Banner */}
      <View style={styles.appointmentBanner}>
        <Icons.Calendar size={16} color="#0284c7" />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Confirmed Appointment Slot</Text>
          <Text style={styles.bannerDateText}>{formattedAppointment}</Text>
        </View>
      </View>

      {/* Officer Remarks / Instructions */}
      <Input
        label={i18n.t("roster.instructionsLabel", {
          defaultValue: "Officer Remarks / Trader Instructions (Optional)",
        })}
        placeholder="e.g. Please ensure standard test weights and trader representative are present."
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={3}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#f4f4f5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#09090b",
    flex: 1,
  },
  summaryDetails: {
    fontSize: 11.5,
    color: "#71717a",
    marginTop: 4,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#09090b",
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e4e4e7",
    backgroundColor: "#ffffff",
  },
  chipActive: {
    backgroundColor: "#09090b",
    borderColor: "#09090b",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#09090b",
  },
  chipTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  customDateContainer: {
    marginTop: 2,
  },
  appointmentBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 10.5,
    fontWeight: "600",
    textTransform: "uppercase",
    color: "#0369a1",
    letterSpacing: 0.2,
  },
  bannerDateText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0c4a6e",
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
  },
  footerBtn: {
    height: 44,
  },
});

