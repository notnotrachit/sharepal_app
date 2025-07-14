import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { spacing, borderRadius, typography, shadows } from "../constants/theme";

interface ModernInputFieldProps extends TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  error?: string;
  containerStyle?: any;
  inputStyle?: any;
  variant?: "default" | "card" | "inline";
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function ModernInputField({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  icon,
  rightIcon,
  onRightIconPress,
  error,
  containerStyle,
  inputStyle,
  variant = "default",
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  ...props
}: ModernInputFieldProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    label: {
      ...typography.body,
      color: colors.text,
      fontWeight: "500",
    },
    required: {
      color: "#FF5722",
      marginLeft: spacing.xs,
    },
    inputContainer: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: error ? "#FF5722" : colors.border,
      flexDirection: "row",
      alignItems: multiline ? "flex-start" : "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      minHeight: multiline ? undefined : 56,
      ...shadows.small,
    },
    inputContainerCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      borderWidth: 0,
      ...shadows.medium,
    },
    inputContainerInline: {
      backgroundColor: "transparent",
      borderWidth: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      borderRadius: 0,
      paddingHorizontal: 0,
      paddingVertical: spacing.sm,
    },
    inputContainerFocused: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    inputContainerDisabled: {
      backgroundColor: colors.cardSecondary,
      opacity: 0.6,
    },
    iconContainer: {
      marginRight: spacing.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    input: {
      ...typography.body,
      color: colors.text,
      flex: 1,
      padding: 0,
      textAlignVertical: multiline ? "top" : "center",
    },
    inputDisabled: {
      color: colors.textSecondary,
    },
    rightIconContainer: {
      marginLeft: spacing.sm,
      padding: spacing.xs,
    },
    errorText: {
      ...typography.caption,
      color: "#FF5722",
      marginTop: spacing.xs,
      marginLeft: spacing.sm,
    },
    placeholder: {
      color: colors.textSecondary,
    },
  });

  const [isFocused, setIsFocused] = React.useState(false);

  const getInputContainerStyle = () => {
    let baseStyle = { ...styles.inputContainer };

    if (variant === "card") {
      baseStyle = { ...baseStyle, ...styles.inputContainerCard };
    } else if (variant === "inline") {
      baseStyle = { ...baseStyle, ...styles.inputContainerInline };
    }

    if (isFocused) {
      baseStyle = { ...baseStyle, ...styles.inputContainerFocused };
    }

    if (disabled) {
      baseStyle = { ...baseStyle, ...styles.inputContainerDisabled };
    }

    return baseStyle;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}

      <View style={[getInputContainerStyle()]}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? colors.primary : colors.textSecondary}
            />
          </View>
        )}

        <TextInput
          style={[styles.input, disabled && styles.inputDisabled, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            disabled={disabled}
          >
            <Ionicons name={rightIcon} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
