import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';
import { spacing, borderRadius, shadows } from '../../constants/theme';

const ProfileSkeleton: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: spacing.lg,
    },
    profileCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      alignItems: 'center',
      marginBottom: spacing.lg,
      ...shadows.medium,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: spacing.lg,
    },
    infoSection: {
      alignItems: 'center',
      width: '100%',
    },
    actionCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.small,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    actionIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: spacing.md,
    },
    actionContent: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <SkeletonLoader width={100} height={100} borderRadius={50} style={styles.avatar} />
        <View style={styles.infoSection}>
          <SkeletonLoader width="60%" height={24} style={{ marginBottom: spacing.sm }} />
          <SkeletonLoader width="80%" height={16} style={{ marginBottom: spacing.xs }} />
          <SkeletonLoader width="40%" height={14} />
        </View>
      </View>

      {/* Action Items */}
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={styles.actionCard}>
          <View style={styles.actionRow}>
            <SkeletonLoader width={24} height={24} borderRadius={12} style={styles.actionIcon} />
            <View style={styles.actionContent}>
              <SkeletonLoader width="70%" height={16} style={{ marginBottom: spacing.xs }} />
              <SkeletonLoader width="50%" height={12} />
            </View>
            <SkeletonLoader width={20} height={12} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default ProfileSkeleton;