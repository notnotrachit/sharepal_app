import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import {
  getColors,
  getComponents,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "./theme";

interface ThemeContextType {
  colors: any;
  components: any;
  typography: any;
  spacing: any;
  borderRadius: any;
  shadows: any;
  colorScheme: ColorSchemeName;
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  console.log("ThemeProvider - Initial colorScheme:", colorScheme);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log("ThemeProvider - Appearance changed to:", colorScheme);
      setColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const colors = getColors(colorScheme);
  const components = getComponents(colors);

  console.log("ThemeProvider - Current theme:", {
    colorScheme,
    backgroundColor: colors.background,
    textColor: colors.text,
  });

  const value = {
    colors,
    components,
    typography,
    spacing,
    borderRadius,
    shadows,
    colorScheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
