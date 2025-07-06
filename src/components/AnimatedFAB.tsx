import React, { useEffect } from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedFABProps extends TouchableOpacityProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
  delay?: number;
}

export default function AnimatedFAB({
  iconName,
  iconSize = 28,
  iconColor,
  delay = 300,
  style,
  ...props
}: AnimatedFABProps) {
  const { colors, components } = useTheme();
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  const styles = StyleSheet.create({
    fab: {
      ...components.fab,
    },
  });

  const finalIconColor = iconColor || colors.text;

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 150 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      )
    );

    rotate.value = withDelay(delay, withTiming(360, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    };
  });

  const handlePress = (event: any) => {
    // Add a little bounce effect on press
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );

    if (props.onPress) {
      props.onPress(event);
    }
  };

  return (
    <AnimatedTouchableOpacity
      {...props}
      style={[styles.fab, style, animatedStyle]}
      onPress={handlePress}
    >
      <Ionicons name={iconName} size={iconSize} color={finalIconColor} />
    </AnimatedTouchableOpacity>
  );
}
