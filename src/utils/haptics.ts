import { Platform } from 'react-native';

// Platform-specific haptics
let Haptics: any = null;

if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch (error) {
    console.warn('expo-haptics not available on this platform');
  }
}

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
      if (Haptics && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
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
      if (Haptics && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
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
      if (Haptics && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
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
      if (Haptics && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
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
      if (Haptics && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
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
      if (Haptics && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
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
      if (Haptics && Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
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