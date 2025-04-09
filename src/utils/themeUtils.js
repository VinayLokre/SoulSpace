import { colors as defaultColors } from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Current theme colors
let currentColors = { ...defaultColors };
let currentMood = null;

// Get the current theme colors
export const getColors = () => {
  return currentColors;
};

// Get the current mood
export const getCurrentMood = () => {
  return currentMood;
};

// Apply theme based on mood
export const applyMoodTheme = async (mood) => {
  // If no mood or 'reset', use default theme
  if (!mood) {
    currentColors = { ...defaultColors };
    currentMood = null;
    try {
      await AsyncStorage.removeItem('currentMood');
    } catch (error) {
      console.error('Error resetting theme:', error);
    }
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
  const newColors = { ...defaultColors };
  
  // Update primary colors
  newColors.primary = moodColor;
  newColors.primaryGlow = moodGlowColor || moodColor;
  newColors.secondary = moodGlowColor || moodColor;
  newColors.secondaryGlow = moodGlowColor || moodColor;
  
  // Update neon colors
  newColors.neon.purple = moodColor;
  newColors.neon.blue = moodGlowColor || moodColor;
  
  // Save the current mood
  currentMood = mood;
  currentColors = newColors;
  
  // Save to AsyncStorage
  try {
    await AsyncStorage.setItem('currentMood', mood);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

// Reset to default theme
export const resetTheme = async () => {
  currentColors = { ...defaultColors };
  currentMood = null;
  try {
    await AsyncStorage.removeItem('currentMood');
  } catch (error) {
    console.error('Error resetting theme:', error);
  }
};

// Initialize theme from AsyncStorage
export const initializeTheme = async () => {
  try {
    const savedMood = await AsyncStorage.getItem('currentMood');
    if (savedMood) {
      await applyMoodTheme(savedMood);
    }
  } catch (error) {
    console.error('Error loading saved theme:', error);
  }
};
