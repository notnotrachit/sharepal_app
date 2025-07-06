import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';
import { spacing, borderRadius, shadows } from '../../constants/theme';

interface GroupListSkeletonProps {
  count?: number;
}

const GroupListSkeleton: React.FC<GroupListSkeletonProps> = ({ count = 5 }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: spacing.lg,
    },
    skeletonItem: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.small,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    titleSection: {
      flex: 1,
      marginRight: spacing.md,
    },
    memberSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    memberAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: -spacing.xs,
    },
    balanceSection: {
      alignItems: 'flex-end',
    },
  });

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <SkeletonLoader width="70%" height={20} style={{ marginBottom: spacing.xs }} />
              <SkeletonLoader width="40%" height={14} />
            </View>
            <View style={styles.balanceSection}>
              <SkeletonLoader width={80} height={18} style={{ marginBottom: spacing.xs }} />
              <SkeletonLoader width={60} height={12} />
            </View>
          </View>
          
          <View style={styles.memberSection}>
            {Array.from({ length: 3 }).map((_, memberIndex) => (
              <SkeletonLoader
                key={memberIndex}
                width={24}
                height={24}
                borderRadius={12}
                style={styles.memberAvatar}
              />
            ))}
            <SkeletonLoader width={40} height={12} style={{ marginLeft: spacing.sm }} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default GroupListSkeleton;