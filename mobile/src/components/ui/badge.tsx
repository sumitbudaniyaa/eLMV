import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { theme } from "./theme";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "certified"
  | "scheduled"
  | "inspected"
  | "rejected"
  | "expired";

interface BadgeProps {
  children: any;
  variant?: BadgeVariant;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  icon?: any;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  style,
  textStyle,
  icon,
}) => {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "certified":
        return {
          container: { backgroundColor: theme.colors.certified.bg, borderColor: theme.colors.certified.border },
          text: { color: theme.colors.certified.text },
        };
      case "scheduled":
        return {
          container: { backgroundColor: theme.colors.scheduled.bg, borderColor: theme.colors.scheduled.border },
          text: { color: theme.colors.scheduled.text },
        };
      case "inspected":
        return {
          container: { backgroundColor: theme.colors.inspected.bg, borderColor: theme.colors.inspected.border },
          text: { color: theme.colors.inspected.text },
        };
      case "rejected":
        return {
          container: { backgroundColor: theme.colors.rejected.bg, borderColor: theme.colors.rejected.border },
          text: { color: theme.colors.rejected.text },
        };
      case "expired":
        return {
          container: { backgroundColor: theme.colors.expired.bg, borderColor: theme.colors.expired.border },
          text: { color: theme.colors.expired.text },
        };
      case "destructive":
        return {
          container: { backgroundColor: theme.colors.destructive, borderColor: theme.colors.destructive },
          text: { color: theme.colors.destructiveForeground },
        };
      case "secondary":
        return {
          container: { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary },
          text: { color: theme.colors.secondaryForeground },
        };
      case "outline":
        return {
          container: { backgroundColor: "transparent", borderColor: theme.colors.border },
          text: { color: theme.colors.foreground },
        };
      case "default":
      default:
        return {
          container: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
          text: { color: theme.colors.primaryForeground },
        };
    }
  };

  const currentStyles = getVariantStyles();

  return (
    <View style={[styles.badge, currentStyles.container, style]}>
      {icon ? <View style={{ marginRight: 4 }}>{icon}</View> : null}
      {React.isValidElement(children) ? (
        children
      ) : (
        <Text style={[styles.text, currentStyles.text, textStyle]}>{children}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
});

