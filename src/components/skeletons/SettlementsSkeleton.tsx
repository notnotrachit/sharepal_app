import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';
import { spacing, borderRadius, shadows } from '../../constants/theme';

interface SettlementsSkeletonProps {
  count?: number;
}

const SettlementsSkeleton: React.FC<SettlementsSkeletonProps> = ({ count = 4 }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: spacing.lg,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.medium,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    settlementItem: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.small,
    },
    settlementHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: spacing.md,
    },
    userInfo: {
      flex: 1,
    },
    amount: {
      alignItems: 'flex-end',
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    actionButton: {
      width: 100,
      height: 36,
      borderRadius: borderRadius.md,
    },
  });

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <SkeletonLoader width="60%" height={20} style={{ marginBottom: spacing.md }} />
        <View style={styles.summaryRow}>
          <SkeletonLoader width="40%" height={16} />
          <SkeletonLoader width={80} height={18} />
        </View>
        <View style={styles.summaryRow}>
          <SkeletonLoader width="50%" height={16} />
          <SkeletonLoader width={90} height={18} />
        </View>
        <View style={styles.summaryRow}>
          <SkeletonLoader width="45%" height={16} />
          <SkeletonLoader width={70} height={18} />
        </View>
      </View>

      {/* Settlement Items */}
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.settlementItem}>
          <View style={styles.settlementHeader}>
            <SkeletonLoader width={40} height={40} borderRadius={20} style={styles.avatar} />
            <View style={styles.userInfo}>
              <SkeletonLoader width="70%" height={16} style={{ marginBottom: spacing.xs }} />
              <SkeletonLoader width="50%" height={12} />
            </View>
            <View style={styles.amount}>
              <SkeletonLoader width={80} height={18} style={{ marginBottom: spacing.xs }} />
              <SkeletonLoader width={60} height={12} />
            </View>
          </View>
          
          <View style={styles.actionRow}>
            <SkeletonLoader width={100} height={36} borderRadius={borderRadius.md} />
            <SkeletonLoader width={80} height={36} borderRadius={borderRadius.md} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default SettlementsSkeleton;