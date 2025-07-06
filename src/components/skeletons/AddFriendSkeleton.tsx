import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';
import { spacing, borderRadius, shadows } from '../../constants/theme';

const AddFriendSkeleton: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    searchCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.small,
    },
    searchInput: {
      height: 48,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    searchButton: {
      height: 48,
      borderRadius: borderRadius.md,
    },
    resultsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.small,
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: spacing.md,
    },
    userInfo: {
      flex: 1,
    },
    actionButton: {
      width: 80,
      height: 36,
      borderRadius: borderRadius.md,
    },
    suggestionsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.small,
    },
  });

  return (
    <View style={styles.container}>
      {/* Search Card */}
      <View style={styles.searchCard}>
        <SkeletonLoader width="40%" height={18} style={{ marginBottom: spacing.md }} />
        <SkeletonLoader width="100%" height={48} style={styles.searchInput} />
        <SkeletonLoader width="100%" height={48} style={styles.searchButton} />
      </View>

      {/* Search Results */}
      <View style={styles.resultsCard}>
        <SkeletonLoader width="50%" height={18} style={{ marginBottom: spacing.lg }} />
        
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.resultItem}>
            <SkeletonLoader width={50} height={50} borderRadius={25} style={styles.avatar} />
            <View style={styles.userInfo}>
              <SkeletonLoader width="70%" height={16} style={{ marginBottom: spacing.xs }} />
              <SkeletonLoader width="50%" height={12} />
            </View>
            <SkeletonLoader width={80} height={36} style={styles.actionButton} />
          </View>
        ))}
      </View>

      {/* Suggestions */}
      <View style={styles.suggestionsCard}>
        <SkeletonLoader width="60%" height={18} style={{ marginBottom: spacing.lg }} />
        
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={styles.resultItem}>
            <SkeletonLoader width={50} height={50} borderRadius={25} style={styles.avatar} />
            <View style={styles.userInfo}>
              <SkeletonLoader width="70%" height={16} style={{ marginBottom: spacing.xs }} />
              <SkeletonLoader width="50%" height={12} />
            </View>
            <SkeletonLoader width={80} height={36} style={styles.actionButton} />
          </View>
        ))}
      </View>
    </View>
  );
};

export default AddFriendSkeleton;