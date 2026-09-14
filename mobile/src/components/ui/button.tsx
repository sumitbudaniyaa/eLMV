import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { theme } from "./theme";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "certified";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps {
  onPress: () => void;
  children: any;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: any;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = "default",
  size = "md",
  disabled = false,
  isLoading = false,
  style,
  textStyle,
  icon,
}) => {
  const getVariantContainerStyle = (): ViewStyle => {
    switch (variant) {
      case "destructive":
        return { backgroundColor: theme.colors.destructive, borderColor: theme.colors.destructive };
      case "outline":
        return { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.colors.border };
      case "secondary":
        return { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary };
      case "ghost":
        return { backgroundColor: "transparent", borderColor: "transparent" };
      case "certified":
        return { backgroundColor: theme.colors.certified.solid, borderColor: theme.colors.certified.solid };
      case "default":
      default:
        return { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary };
    }
  };

  const getVariantTextStyle = (): TextStyle => {
    switch (variant) {
      case "destructive":
        return { color: theme.colors.destructiveForeground };
      case "outline":
      case "ghost":
        return { color: theme.colors.foreground };
      case "secondary":
        return { color: theme.colors.secondaryForeground };
      case "certified":
        return { color: "#ffffff" };
      case "default":
      default:
        return { color: theme.colors.primaryForeground };
    }
  };

  const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case "sm":
        return {
          container: { paddingVertical: 6, paddingHorizontal: 10, minHeight: 32 },
          text: { fontSize: 12 },
        };
      case "lg":
        return {
          container: { paddingVertical: 14, paddingHorizontal: 20, minHeight: 48 },
          text: { fontSize: 15 },
        };
      case "icon":
        return {
          container: { width: 36, height: 36, padding: 0, justifyContent: "center", alignItems: "center" },
          text: { fontSize: 14 },
        };
      case "md":
      default:
        return {
          container: { paddingVertical: 10, paddingHorizontal: 14, minHeight: 40 },
          text: { fontSize: 13 },
        };
    }
  };

  const sizeStyles = getSizeStyle();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.base,
        getVariantContainerStyle(),
        sizeStyles.container,
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? theme.colors.primary : "#ffffff"}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          {React.isValidElement(children) ? (
            children
          ) : (
            <Text
              style={[
                styles.textBase,
                getVariantTextStyle(),
                sizeStyles.text,
                icon ? { marginLeft: 6 } : undefined,
                textStyle,
              ]}
            >
              {children}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  textBase: {
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  disabled: {
    opacity: 0.5,
  },
});
