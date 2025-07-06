import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { spacing, typography } from "../constants/theme";

interface InputGroupProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "decimal-pad";
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  style?: any;
  required?: boolean;
}

export default function InputGroup({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
  editable = true,
  autoCapitalize = "sentences",
  secureTextEntry = false,
  autoFocus = false,
  style,
  required = false,
}: InputGroupProps) {
  const { colors, components } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      ...typography.bodySmall,
      color: colors.text,
      marginBottom: spacing.xs,
      fontWeight: "600",
    },
    required: {
      color: colors.error || colors.primary,
    },
    input: {
      ...components.input,
      color: colors.text,
    },
    textArea: {
      height: 80,
      textAlignVertical: "top",
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        autoFocus={autoFocus}
      />
    </View>
  );
}
