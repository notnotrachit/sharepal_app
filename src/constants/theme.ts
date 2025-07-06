import { Appearance } from 'react-native';

// Light Theme
const lightColors = {
  // Background colors
  background: '#f8f9fa',
  surface: '#ffffff',
  cardBackground: '#ffffff',
  
  // Text colors
  text: '#1a1a1a',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  textDisabled: '#d1d5db',
  
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0056CC',
  primaryLight: '#4DA3FF',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Neutral colors
  border: '#e5e7eb',
  divider: '#f3f4f6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Input colors
  inputBackground: '#f9fafb',
  inputBorder: '#d1d5db',
  inputFocus: '#007AFF',
  
  // Tab colors
  tabActive: '#007AFF',
  tabInactive: '#9ca3af',
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Dark Theme - Inspired by Splitwise Design
const darkColors = {
  // Background colors
  background: '#1a1a1a',
  surface: '#2a2a2a',
  cardBackground: '#333333',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#e0e0e0',
  textMuted: '#999999',
  textDisabled: '#666666',
  
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0056CC',
  primaryLight: '#4DA3FF',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  
  // Neutral colors
  border: '#404040',
  divider: '#333333',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Input colors
  inputBackground: '#2a2a2a',
  inputBorder: '#404040',
  inputFocus: '#007AFF',
  
  // Tab colors
  tabActive: '#007AFF',
  tabInactive: '#666666',
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Get colors based on system theme
export const getColors = (colorScheme?: string | null) => {
  const scheme = colorScheme || Appearance.getColorScheme();
  
  const selectedColors = scheme === 'dark' ? darkColors : lightColors;
  
  return selectedColors;
};

// Default to current system theme
export const colors = getColors();

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const getComponents = (colors: any) => ({
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    text: {
      backgroundColor: 'transparent',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  fab: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'absolute' as const,
    bottom: spacing.lg,
    right: spacing.lg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...shadows.medium,
  },
});

export const components = getComponents(colors);
