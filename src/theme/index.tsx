import React, {createContext, useContext, useState} from 'react';
import {useColorScheme} from 'react-native';
import {lightColors, darkColors, AppColors} from './colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colors: AppColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  isDark: false,
  themeMode: 'system',
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{colors, isDark, themeMode, setThemeMode}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
