import React, { useEffect, ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

interface AnimatedScreenProps {
  children: ReactNode;
  animationType?: "slideUp" | "slideRight" | "fade" | "scale";
  duration?: number;
  onEnterComplete?: () => void;
}

export default function AnimatedScreen({
  children,
  animationType = "slideUp",
  duration = 300,
  onEnterComplete,
}: AnimatedScreenProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const translateX = useSharedValue(50);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const animateIn = () => {
      if (animationType === "fade") {
        opacity.value = withTiming(1, { duration }, (finished) => {
          if (finished && onEnterComplete) {
            runOnJS(onEnterComplete)();
          }
        });
      } else if (animationType === "slideUp") {
        opacity.value = withTiming(1, { duration: duration / 2 });
        translateY.value = withSpring(
          0,
          {
            damping: 20,
            stiffness: 90,
          },
          (finished) => {
            if (finished && onEnterComplete) {
              runOnJS(onEnterComplete)();
            }
          }
        );
      } else if (animationType === "slideRight") {
        opacity.value = withTiming(1, { duration: duration / 2 });
        translateX.value = withSpring(
          0,
          {
            damping: 20,
            stiffness: 90,
          },
          (finished) => {
            if (finished && onEnterComplete) {
              runOnJS(onEnterComplete)();
            }
          }
        );
      } else if (animationType === "scale") {
        opacity.value = withTiming(1, { duration: duration / 2 });
        scale.value = withSpring(
          1,
          {
            damping: 15,
            stiffness: 150,
          },
          (finished) => {
            if (finished && onEnterComplete) {
              runOnJS(onEnterComplete)();
            }
          }
        );
      }
    };

    animateIn();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const baseStyle = {
      opacity: opacity.value,
    };

    if (animationType === "slideUp") {
      return {
        ...baseStyle,
        transform: [{ translateY: translateY.value }],
      };
    } else if (animationType === "slideRight") {
      return {
        ...baseStyle,
        transform: [{ translateX: translateX.value }],
      };
    } else if (animationType === "scale") {
      return {
        ...baseStyle,
        transform: [{ scale: scale.value }],
      };
    }

    return baseStyle;
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
