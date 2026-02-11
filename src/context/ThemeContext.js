import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../constants/colors';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // Get system setting
  const [themeMode, setThemeMode] = useState('system'); // 'light' | 'dark' | 'system'

  // Load saved preference on startup
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('user-theme');
      if (savedTheme) setThemeMode(savedTheme);
    };
    loadTheme();
  }, []);

  // Save preference when changed
  const updateTheme = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('user-theme', mode);
  };

  // Logic to determine the actual colors to show
  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;
  const fonts = THEME.fonts;

  return (
    <ThemeContext.Provider value={{ themeMode, updateTheme, colors, fonts, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

