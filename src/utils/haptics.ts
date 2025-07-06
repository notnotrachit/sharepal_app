import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utility for enhanced user interactions
 */

export const hapticFeedback = {
  /**
   * Light haptic feedback for subtle interactions
   * Use for: Button taps, toggle switches, selection changes
   */
  light: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not supported on device
    }
  },

  /**
   * Medium haptic feedback for standard interactions
   * Use for: Navigation, form submissions, confirmations
   */
  medium: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Haptics not supported on device
    }
  },

  /**
   * Heavy haptic feedback for important interactions
   * Use for: Errors, warnings, important confirmations
   */
  heavy: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Haptics not supported on device
    }
  },

  /**
   * Success haptic feedback
   * Use for: Successful operations, completions
   */
  success: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Haptics not supported on device
    }
  },

  /**
   * Warning haptic feedback
   * Use for: Warnings, cautions
   */
  warning: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      // Haptics not supported on device
    }
  },

  /**
   * Error haptic feedback
   * Use for: Errors, failures, invalid actions
   */
  error: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Haptics not supported on device
    }
  },

  /**
   * Selection haptic feedback
   * Use for: Picker selections, menu selections
   */
  selection: () => {
    try {
      Haptics.selectionAsync();
    } catch (error) {
      // Haptics not supported on device
    }
  },
};

/**
 * Enhanced button press with haptic feedback
 * @param callback - Function to execute
 * @param feedbackType - Type of haptic feedback
 */
export const hapticPress = (
  callback: () => void,
  feedbackType: keyof typeof hapticFeedback = 'light'
) => {
  hapticFeedback[feedbackType]();
  callback();
};

/**
 * Haptic feedback for swipe actions
 */
export const swipeHaptics = {
  start: () => hapticFeedback.light(),
  confirm: () => hapticFeedback.medium(),
  cancel: () => hapticFeedback.light(),
};