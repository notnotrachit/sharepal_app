import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { spacing, borderRadius, typography } from "../constants/theme";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "outline" | "ghost" | "success" | "error";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: any;
}

export default function SecondaryButton({
  title,
  onPress,
  icon,
  variant = "outline",
  size = "medium",
  disabled = false,
  style,
}: SecondaryButtonProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: borderRadius.md,
      paddingVertical:
        size === "small"
          ? spacing.sm
          : size === "large"
          ? spacing.lg
          : spacing.md,
      paddingHorizontal:
        size === "small"
          ? spacing.md
          : size === "large"
          ? spacing.xl
          : spacing.lg,
      minHeight: size === "small" ? 36 : size === "large" ? 56 : 44,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    success: {
      backgroundColor: colors.success,
    },
    error: {
      backgroundColor: colors.error,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      ...typography.button,
      fontSize: size === "small" ? 14 : size === "large" ? 18 : 16,
      color:
        variant === "outline"
          ? colors.primary
          : variant === "success" || variant === "error"
          ? colors.text
          : colors.text,
    },
    disabledText: {
      color: colors.textSecondary,
    },
    icon: {
      marginRight: spacing.sm,
    },
  });

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        variant === "success" && styles.success,
        variant === "error" && styles.error,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === "small" ? 16 : size === "large" ? 24 : 20}
          color={
            disabled
              ? colors.textSecondary
              : variant === "outline"
              ? colors.primary
              : variant === "success" || variant === "error"
              ? colors.text
              : colors.text
          }
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, disabled && styles.disabledText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
