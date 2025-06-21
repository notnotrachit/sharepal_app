import React, { useEffect } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  iconColor = "#fff",
  delay = 300,
  style,
  ...props
}: AnimatedFABProps) {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

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
      style={[style, animatedStyle]}
      onPress={handlePress}
    >
      <Ionicons name={iconName} size={iconSize} color={iconColor} />
    </AnimatedTouchableOpacity>
  );
}
