import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as defaultColors } from '../utils/theme';

// Create a deep copy of the default colors
const createDefaultTheme = () => JSON.parse(JSON.stringify(defaultColors));

// Create the Theme Context
export const ThemeContext = createContext({
  colors: defaultColors,
  currentMood: null,
  applyMoodTheme: () => {},
  resetTheme: () => {},
});

// Custom hook to use the Theme Context
export const useTheme = () => useContext(ThemeContext);

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  // Initialize with default colors
  const [colors, setColors] = useState(createDefaultTheme());
  const [currentMood, setCurrentMood] = useState(null);
  
  // Load saved theme on mount
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedMood = await AsyncStorage.getItem('currentMood');
        if (savedMood) {
          setCurrentMood(savedMood);
          applyMoodTheme(savedMood);
        }
      } catch (error) {
        console.error('Error loading saved theme:', error);
      }
    };
    
    loadSavedTheme();
  }, []);
  
  // Apply theme based on mood
  const applyMoodTheme = (mood) => {
    // If no mood or 'reset', use default theme
    if (!mood) {
      setColors(createDefaultTheme());
      setCurrentMood(null);
      return;
    }
    
    // Get the mood color from the default theme
    const moodColor = defaultColors.mood[mood];
    const moodGlowColor = defaultColors.mood[`${mood}Glow`];
    
    if (!moodColor) {
      console.warn(`No color defined for mood: ${mood}`);
      return;
    }
    
    // Create a new theme with the mood color as primary
    const newColors = createDefaultTheme();
    
    // Update primary colors
    newColors.primary = moodColor;
    newColors.primaryGlow = moodGlowColor || moodColor;
    newColors.secondary = moodGlowColor || moodColor;
    newColors.secondaryGlow = moodGlowColor || moodColor;
    
    // Update neon colors
    newColors.neon.purple = moodColor;
    newColors.neon.blue = moodGlowColor || moodColor;
    
    // Save the current mood
    setCurrentMood(mood);
    setColors(newColors);
    
    // Save to AsyncStorage
    try {
      AsyncStorage.setItem('currentMood', mood);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };
  
  // Reset to default theme
  const resetTheme = () => {
    setColors(createDefaultTheme());
    setCurrentMood(null);
    try {
      AsyncStorage.removeItem('currentMood');
    } catch (error) {
      console.error('Error resetting theme:', error);
    }
  };
  
  return (
    <ThemeContext.Provider
      value={{
        colors,
        currentMood,
        applyMoodTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
