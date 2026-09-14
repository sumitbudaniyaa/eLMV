import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { theme } from "./theme";

export const Card: React.FC<{
  children: any;
  style?: ViewStyle | ViewStyle[];
}> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

export const CardHeader: React.FC<{
  children: any;
  style?: ViewStyle | ViewStyle[];
}> = ({ children, style }) => {
  return <View style={[styles.header, style]}>{children}</View>;
};

export const CardTitle: React.FC<{
  children: any;
  style?: TextStyle | TextStyle[];
}> = ({ children, style }) => {
  return <Text style={[styles.title, style]}>{children}</Text>;
};

export const CardDescription: React.FC<{
  children: any;
  style?: TextStyle | TextStyle[];
}> = ({ children, style }) => {
  return <Text style={[styles.description, style]}>{children}</Text>;
};

export const CardContent: React.FC<{
  children: any;
  style?: ViewStyle | ViewStyle[];
}> = ({ children, style }) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

export const CardFooter: React.FC<{
  children: any;
  style?: ViewStyle | ViewStyle[];
}> = ({ children, style }) => {
  return <View style={[styles.footer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 2,
    lineHeight: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});

