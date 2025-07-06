import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';
import { spacing, borderRadius, shadows } from '../../constants/theme';

interface TransactionListSkeletonProps {
  count?: number;
}

const TransactionListSkeleton: React.FC<TransactionListSkeletonProps> = ({ count = 8 }) => {
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
      ...shadows.small,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    leftSection: {
      flex: 1,
      marginRight: spacing.md,
    },
    rightSection: {
      alignItems: 'flex-end',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    badge: {
      width: 60,
      height: 20,
      borderRadius: borderRadius.sm,
    },
  });

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonItem}>
          <View style={styles.header}>
            <View style={styles.leftSection}>
              <SkeletonLoader width="80%" height={18} style={{ marginBottom: spacing.xs }} />
              <SkeletonLoader width="50%" height={14} />
            </View>
            <View style={styles.rightSection}>
              <SkeletonLoader width={80} height={18} style={{ marginBottom: spacing.xs }} />
              <SkeletonLoader width={50} height={14} />
            </View>
          </View>
          
          <View style={styles.footer}>
            <SkeletonLoader width={60} height={20} borderRadius={borderRadius.sm} />
            <SkeletonLoader width={80} height={14} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default TransactionListSkeleton;