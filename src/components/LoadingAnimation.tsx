import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'medium',
  color,
  style,
}) => {
  const { colors } = useTheme();
  const animationColor = color || colors.primary;

  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  const sizes = {
    small: { dotSize: 6, spacing: 4 },
    medium: { dotSize: 8, spacing: 6 },
    large: { dotSize: 10, spacing: 8 },
  };

  const { dotSize, spacing } = sizes[size];

  useEffect(() => {
    const animateDot = (dot: Animated.SharedValue<number>, delay: number) => {
      dot.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400 }),
            withTiming(0.3, { duration: 400 })
          ),
          -1,
          false
        )
      );
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, []);

  const createDotStyle = (dot: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: dot.value,
      transform: [
        {
          scale: 0.8 + (dot.value - 0.3) * 0.4,
        },
      ],
    }));

  const dot1Style = createDotStyle(dot1);
  const dot2Style = createDotStyle(dot2);
  const dot3Style = createDotStyle(dot3);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: animationColor,
      marginHorizontal: spacing / 2,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
};

export default LoadingAnimation;