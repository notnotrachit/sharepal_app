import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';
import { spacing, borderRadius, shadows } from '../../constants/theme';

const TransactionDetailsSkeleton: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    headerCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      alignItems: 'center',
      ...shadows.medium,
    },
    detailsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.small,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    splitsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.small,
    },
    splitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    splitLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: spacing.md,
    },
    splitInfo: {
      flex: 1,
    },
    splitAmount: {
      alignItems: 'flex-end',
    },
    actionsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.small,
    },
    actionButton: {
      height: 48,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <SkeletonLoader width="60%" height={24} style={{ marginBottom: spacing.md }} />
        <SkeletonLoader width={120} height={32} style={{ marginBottom: spacing.sm }} />
        <SkeletonLoader width="40%" height={16} />
      </View>

      {/* Details Card */}
      <View style={styles.detailsCard}>
        <SkeletonLoader width="30%" height={18} style={{ marginBottom: spacing.lg }} />
        
        <View style={styles.detailRow}>
          <SkeletonLoader width="25%" height={16} />
          <SkeletonLoader width="50%" height={16} />
        </View>
        
        <View style={styles.detailRow}>
          <SkeletonLoader width="30%" height={16} />
          <SkeletonLoader width="40%" height={16} />
        </View>
        
        <View style={styles.detailRow}>
          <SkeletonLoader width="20%" height={16} />
          <SkeletonLoader width="35%" height={16} />
        </View>
        
        <View style={styles.detailRow}>
          <SkeletonLoader width="35%" height={16} />
          <SkeletonLoader width="60%" height={16} />
        </View>
      </View>

      {/* Splits Card */}
      <View style={styles.splitsCard}>
        <SkeletonLoader width="40%" height={18} style={{ marginBottom: spacing.lg }} />
        
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.splitItem}>
            <View style={styles.splitLeft}>
              <SkeletonLoader width={40} height={40} borderRadius={20} style={styles.avatar} />
              <View style={styles.splitInfo}>
                <SkeletonLoader width="70%" height={16} style={{ marginBottom: spacing.xs }} />
                <SkeletonLoader width="50%" height={12} />
              </View>
            </View>
            <View style={styles.splitAmount}>
              <SkeletonLoader width={80} height={16} style={{ marginBottom: spacing.xs }} />
              <SkeletonLoader width={60} height={12} />
            </View>
          </View>
        ))}
      </View>

      {/* Actions Card */}
      <View style={styles.actionsCard}>
        <SkeletonLoader width="100%" height={48} style={styles.actionButton} />
        <SkeletonLoader width="100%" height={48} style={styles.actionButton} />
        <SkeletonLoader width="100%" height={48} borderRadius={borderRadius.md} />
      </View>
    </View>
  );
};

export default TransactionDetailsSkeleton;