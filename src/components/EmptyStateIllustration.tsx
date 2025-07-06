import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { hapticFeedback } from '../utils/haptics';
import { spacing, borderRadius, typography } from '../constants/theme';

interface EmptyStateIllustrationProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onActionPress?: () => void;
  illustration?: 'expenses' | 'friends' | 'groups' | 'settlements' | 'transactions';
}

const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({
  icon,
  title,
  description,
  actionText,
  onActionPress,
  illustration,
}) => {
  const { colors } = useTheme();

  const handleActionPress = () => {
    hapticFeedback.light();
    onActionPress?.();
  };

  const renderIllustration = () => {
    const iconSize = 80;
    const secondaryIconSize = 40;

    switch (illustration) {
      case 'expenses':
        return (
          <View style={styles.illustrationContainer}>
            <View style={[styles.mainIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="receipt-outline" size={iconSize} color={colors.primary} />
            </View>
            <View style={[styles.floatingIcon, styles.topRight, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="add-circle" size={secondaryIconSize} color={colors.success} />
            </View>
            <View style={[styles.floatingIcon, styles.bottomLeft, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="card-outline" size={secondaryIconSize} color={colors.warning} />
            </View>
          </View>
        );

      case 'friends':
        return (
          <View style={styles.illustrationContainer}>
            <View style={[styles.mainIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="people-outline" size={iconSize} color={colors.primary} />
            </View>
            <View style={[styles.floatingIcon, styles.topRight, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="person-add" size={secondaryIconSize} color={colors.success} />
            </View>
            <View style={[styles.floatingIcon, styles.bottomLeft, { backgroundColor: `${colors.info}20` }]}>
              <Ionicons name="heart-outline" size={secondaryIconSize} color={colors.info} />
            </View>
          </View>
        );

      case 'groups':
        return (
          <View style={styles.illustrationContainer}>
            <View style={[styles.mainIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="people-circle-outline" size={iconSize} color={colors.primary} />
            </View>
            <View style={[styles.floatingIcon, styles.topRight, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="add" size={secondaryIconSize} color={colors.success} />
            </View>
            <View style={[styles.floatingIcon, styles.bottomLeft, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="settings-outline" size={secondaryIconSize} color={colors.warning} />
            </View>
          </View>
        );

      case 'settlements':
        return (
          <View style={styles.illustrationContainer}>
            <View style={[styles.mainIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="swap-horizontal-outline" size={iconSize} color={colors.primary} />
            </View>
            <View style={[styles.floatingIcon, styles.topRight, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="checkmark-circle" size={secondaryIconSize} color={colors.success} />
            </View>
            <View style={[styles.floatingIcon, styles.bottomLeft, { backgroundColor: `${colors.info}20` }]}>
              <Ionicons name="cash-outline" size={secondaryIconSize} color={colors.info} />
            </View>
          </View>
        );

      case 'transactions':
        return (
          <View style={styles.illustrationContainer}>
            <View style={[styles.mainIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="list-outline" size={iconSize} color={colors.primary} />
            </View>
            <View style={[styles.floatingIcon, styles.topRight, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="trending-up" size={secondaryIconSize} color={colors.success} />
            </View>
            <View style={[styles.floatingIcon, styles.bottomLeft, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="time-outline" size={secondaryIconSize} color={colors.warning} />
            </View>
          </View>
        );

      default:
        return (
          <View style={[styles.mainIconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name={icon as any} size={iconSize} color={colors.primary} />
          </View>
        );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxl,
    },
    illustrationContainer: {
      position: 'relative',
      marginBottom: spacing.xl,
    },
    mainIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    floatingIcon: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topRight: {
      top: -10,
      right: -10,
    },
    bottomLeft: {
      bottom: -10,
      left: -10,
    },
    title: {
      ...typography.h2,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.md,
      fontWeight: '700',
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: spacing.xl,
      maxWidth: 280,
    },
    actionButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionText: {
      ...typography.body,
      color: colors.surface,
      fontWeight: '600',
      marginLeft: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      {renderIllustration()}
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {actionText && onActionPress && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleActionPress}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={colors.surface} />
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyStateIllustration;