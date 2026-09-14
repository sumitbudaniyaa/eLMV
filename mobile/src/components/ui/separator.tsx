import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { theme } from "./theme";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  style?: ViewStyle;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = "horizontal",
  style,
}) => {
  return (
    <View
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: "100%",
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  vertical: {
    width: 1,
    height: "100%",
    backgroundColor: theme.colors.border,
    marginHorizontal: 8,
  },
});

