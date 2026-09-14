import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { theme } from "./theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  hint,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error ? styles.inputError : undefined,
          props.multiline ? styles.inputMultiline : undefined,
          style,
        ]}
        placeholderTextColor={theme.colors.mutedForeground}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  input: {
    height: 42,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    fontSize: 13,
    color: theme.colors.foreground,
  },
  inputMultiline: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: theme.colors.destructive,
  },
  hint: {
    fontSize: 11,
    color: theme.colors.mutedForeground,
    marginTop: 4,
  },
  error: {
    fontSize: 11,
    color: theme.colors.destructive,
    marginTop: 4,
    fontWeight: "500",
  },
});

