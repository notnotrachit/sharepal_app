import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';
import { spacing, borderRadius, shadows } from '../../constants/theme';

interface FriendsListSkeletonProps {
  count?: number;
}

const FriendsListSkeleton: React.FC<FriendsListSkeletonProps> = ({ count = 6 }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: spacing.lg,
    },
    skeletonItem: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      ...shadows.small,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: spacing.md,
    },
    content: {
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      width: 60,
      height: 32,
      borderRadius: borderRadius.md,
    },
  });

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <SkeletonLoader width={50} height={50} borderRadius={25} style={styles.avatar} />
          
          <View style={styles.content}>
            <SkeletonLoader width="70%" height={16} style={{ marginBottom: spacing.xs }} />
            <SkeletonLoader width="50%" height={12} />
          </View>
          
          <View style={styles.actions}>
            <SkeletonLoader width={60} height={32} borderRadius={borderRadius.md} />
            <SkeletonLoader width={60} height={32} borderRadius={borderRadius.md} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default FriendsListSkeleton;