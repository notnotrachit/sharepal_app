import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { secureStorage } from "../utils/secureStorage";
import {
  getColors,
  getComponents,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../constants/theme";

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colors: any;
  components: any;
  typography: any;
  spacing: any;
  borderRadius: any;
  shadows: any;
  colorScheme: ColorSchemeName;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = 'theme_preference';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await secureStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await secureStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Determine the actual color scheme to use
  const getEffectiveColorScheme = (): ColorSchemeName => {
    if (themeMode === 'system') {
      return systemColorScheme;
    }
    return themeMode === 'dark' ? 'dark' : 'light';
  };

  const effectiveColorScheme = getEffectiveColorScheme();
  const colors = getColors(effectiveColorScheme);
  const components = getComponents(colors);

  const value = {
    colors,
    components,
    typography,
    spacing,
    borderRadius,
    shadows,
    colorScheme: effectiveColorScheme,
    themeMode,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};