import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';
import { spacing, borderRadius, shadows } from '../../constants/theme';

const GroupDetailsSkeleton: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      margin: spacing.lg,
      marginBottom: spacing.sm,
      padding: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...shadows.small,
    },
    groupInfo: {
      flex: 1,
    },
    membersPreview: {
      alignItems: 'flex-end',
    },
    memberAvatars: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    memberAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginLeft: -spacing.sm,
      borderWidth: 2,
      borderColor: colors.surface,
    },
    balanceCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      margin: spacing.lg,
      marginTop: spacing.sm,
      padding: spacing.lg,
      ...shadows.small,
    },
    balanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      margin: spacing.lg,
      marginTop: spacing.sm,
      padding: spacing.xs,
      ...shadows.small,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    contentContainer: {
      padding: spacing.lg,
      paddingTop: 0,
    },
    transactionItem: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadows.small,
    },
    transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    transactionLeft: {
      flex: 1,
      marginRight: spacing.md,
    },
    transactionRight: {
      alignItems: 'flex-end',
    },
    transactionFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      {/* Group Header */}
      <View style={styles.header}>
        <View style={styles.groupInfo}>
          <SkeletonLoader width="70%" height={24} style={{ marginBottom: spacing.xs }} />
          <SkeletonLoader width="40%" height={16} />
        </View>
        <View style={styles.membersPreview}>
          <View style={styles.memberAvatars}>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonLoader
                key={index}
                width={32}
                height={32}
                borderRadius={16}
                style={styles.memberAvatar}
              />
            ))}
          </View>
          <SkeletonLoader width={60} height={12} style={{ marginTop: spacing.xs }} />
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <SkeletonLoader width="50%" height={16} />
          <SkeletonLoader width={80} height={20} />
        </View>
        <View style={styles.balanceRow}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width={100} height={20} />
        </View>
        <View style={styles.balanceRow}>
          <SkeletonLoader width="40%" height={16} />
          <SkeletonLoader width={90} height={20} />
        </View>
      </View>

      {/* Tab Container */}
      <View style={styles.tabContainer}>
        <View style={styles.tab}>
          <SkeletonLoader width={80} height={16} />
        </View>
        <View style={styles.tab}>
          <SkeletonLoader width={70} height={16} />
        </View>
      </View>

      {/* Transaction List */}
      <View style={styles.contentContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={styles.transactionItem}>
            <View style={styles.transactionHeader}>
              <View style={styles.transactionLeft}>
                <SkeletonLoader width="80%" height={18} style={{ marginBottom: spacing.xs }} />
                <SkeletonLoader width="50%" height={14} />
              </View>
              <View style={styles.transactionRight}>
                <SkeletonLoader width={80} height={18} style={{ marginBottom: spacing.xs }} />
                <SkeletonLoader width={60} height={14} />
              </View>
            </View>
            <View style={styles.transactionFooter}>
              <SkeletonLoader width={60} height={20} borderRadius={borderRadius.sm} />
              <SkeletonLoader width={80} height={14} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default GroupDetailsSkeleton;