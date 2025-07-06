import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../SkeletonLoader';
import { spacing, borderRadius, shadows } from '../../constants/theme';

const CreateExpenseSkeleton: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.small,
    },
    formGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      marginBottom: spacing.sm,
    },
    input: {
      height: 48,
      borderRadius: borderRadius.md,
    },
    textArea: {
      height: 80,
      borderRadius: borderRadius.md,
    },
    splitCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.small,
    },
    splitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    memberItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    memberInfo: {
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
    memberDetails: {
      flex: 1,
    },
    splitAmount: {
      alignItems: 'flex-end',
    },
    buttonContainer: {
      marginTop: spacing.xl,
    },
    button: {
      height: 48,
      borderRadius: borderRadius.md,
    },
  });

  return (
    <View style={styles.container}>
      {/* Basic Info Form */}
      <View style={styles.formCard}>
        <View style={styles.formGroup}>
          <SkeletonLoader width="30%" height={16} style={styles.label} />
          <SkeletonLoader width="100%" height={48} style={styles.input} />
        </View>
        
        <View style={styles.formGroup}>
          <SkeletonLoader width="25%" height={16} style={styles.label} />
          <SkeletonLoader width="100%" height={48} style={styles.input} />
        </View>
        
        <View style={styles.formGroup}>
          <SkeletonLoader width="35%" height={16} style={styles.label} />
          <SkeletonLoader width="100%" height={48} style={styles.input} />
        </View>
        
        <View style={styles.formGroup}>
          <SkeletonLoader width="40%" height={16} style={styles.label} />
          <SkeletonLoader width="100%" height={80} style={styles.textArea} />
        </View>
      </View>

      {/* Split Details */}
      <View style={styles.splitCard}>
        <View style={styles.splitHeader}>
          <SkeletonLoader width="40%" height={20} />
          <SkeletonLoader width={80} height={32} borderRadius={borderRadius.md} />
        </View>
        
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={styles.memberItem}>
            <View style={styles.memberInfo}>
              <SkeletonLoader width={40} height={40} borderRadius={20} style={styles.avatar} />
              <View style={styles.memberDetails}>
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

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <SkeletonLoader width="100%" height={48} style={styles.button} />
      </View>
    </View>
  );
};

export default CreateExpenseSkeleton;