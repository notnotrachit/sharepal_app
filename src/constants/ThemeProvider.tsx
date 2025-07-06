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

// This file is deprecated - use src/contexts/ThemeContext.tsx instead
export const useTheme = () => {
  throw new Error("Please import useTheme from '../../contexts/ThemeContext' instead");
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );


  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const colors = getColors(colorScheme);
  const components = getComponents(colors);


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
