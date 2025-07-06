import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { spacing, borderRadius, typography } from "../constants/theme";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  rightElement?: React.ReactNode;
}

interface CardContentProps {
  children: React.ReactNode;
}

function Card({ children, onPress, style }: CardProps) {
  const { colors, components } = useTheme();

  const styles = StyleSheet.create({
    card: {
      ...components.card,
      marginBottom: spacing.md,
    },
  });

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

function CardHeader({
  title,
  subtitle,
  icon,
  iconColor,
  rightElement,
}: CardHeaderProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    leftContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      ...typography.h4,
      color: colors.text,
      marginBottom: subtitle ? spacing.xs / 2 : 0,
    },
    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.leftContent}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={20}
              color={iconColor || colors.primary}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement}
    </View>
  );
}

function CardContent({ children }: CardContentProps) {
  return <View>{children}</View>;
}

// Export compound component
export default Object.assign(Card, {
  Header: CardHeader,
  Content: CardContent,
});
