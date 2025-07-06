import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius } from '../constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius: borderRadiusValue = borderRadius.sm,
  style,
}) => {
  const { colors } = useTheme();
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-200, 200],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  const styles = StyleSheet.create({
    container: {
      width,
      height,
      borderRadius: borderRadiusValue,
      backgroundColor: colors.border,
      overflow: 'hidden',
    },
    shimmer: {
      width: '50%',
      height: '100%',
      backgroundColor: colors.surface,
      opacity: 0.5,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
};

export default SkeletonLoader;