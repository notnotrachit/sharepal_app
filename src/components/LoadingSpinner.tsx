import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../contexts/ThemeContext";
import { spacing, typography } from "../constants/theme";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
}

export default function LoadingSpinner({
  message = "Loading...",
  size = "large",
}: LoadingSpinnerProps) {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const iconSize = size === "large" ? 32 : 24;
  const containerStyle =
    size === "large" ? styles.container : styles.containerSmall;

  return (
    <View style={[containerStyle, { backgroundColor: colors.background }]}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name="reload-outline"
          size={iconSize}
          color={colors.primary}
        />
      </Animated.View>
      <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  containerSmall: {
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  text: {
    ...typography.body,
    textAlign: "center",
  },
});
