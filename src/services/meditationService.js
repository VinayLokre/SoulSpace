// Meditation Service for SoulSpace
// Handles meditation sessions, breathing exercises, and related functionality

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

// Keys for AsyncStorage
const MEDITATION_HISTORY_KEY = 'meditation_history';
const MEDITATION_SETTINGS_KEY = 'meditation_settings';

// Default meditation settings
const DEFAULT_SETTINGS = {
  breathingPattern: {
    inhale: 4,    // seconds
    hold: 2,      // seconds
    exhale: 6,    // seconds
    holdAfterExhale: 0, // seconds
  },
  backgroundSound: 'nature', // 'nature', 'rain', 'ocean', 'silence'
  guidedVoice: true,
  vibration: true,
  defaultDuration: 5, // minutes
};

// Meditation types
export const MEDITATION_TYPES = {
  BREATHING: 'breathing',       // Focus on breathing patterns
  GUIDED: 'guided',             // Guided meditation with voice instructions
  SILENT: 'silent',             // Silent meditation with timer only
  BODY_SCAN: 'body_scan',       // Progressive body awareness meditation
  LOVING_KINDNESS: 'loving_kindness', // Compassion and loving-kindness practice
};

// Meditation type descriptions
export const MEDITATION_DESCRIPTIONS = {
  [MEDITATION_TYPES.BREATHING]: 'Focus on your breath with guided breathing patterns to calm your mind and reduce stress.',
  [MEDITATION_TYPES.GUIDED]: 'Follow along with guided instructions to help focus your mind and achieve deeper relaxation.',
  [MEDITATION_TYPES.SILENT]: 'Practice in silence with minimal guidance, allowing your mind to settle naturally.',
  [MEDITATION_TYPES.BODY_SCAN]: 'Progressively focus attention on different parts of your body to release tension and increase awareness.',
  [MEDITATION_TYPES.LOVING_KINDNESS]: 'Develop feelings of goodwill, kindness and warmth towards others and yourself.',
};

// Guided meditation scripts
const GUIDED_MEDITATION_SCRIPTS = {
  [MEDITATION_TYPES.BREATHING]: [
    "Find a comfortable position and close your eyes.",
    "Take a deep breath in through your nose.",
    "Hold your breath for a moment.",
    "Slowly exhale through your mouth.",
    "Feel your body becoming more relaxed with each breath.",
    "Continue breathing at your own pace.",
    "Notice the sensation of the air entering and leaving your body.",
    "If your mind wanders, gently bring your attention back to your breath.",
    "Each breath is an opportunity to become more present.",
    "You're doing great. Continue this peaceful breathing.",
  ],
  [MEDITATION_TYPES.BODY_SCAN]: [
    "Find a comfortable position and close your eyes.",
    "Take a few deep breaths to center yourself.",
    "Bring your awareness to your feet and toes.",
    "Notice any sensations without judgment.",
    "Slowly move your attention up to your calves and knees.",
    "Continue to your thighs and hips, noticing any tension.",
    "Bring awareness to your abdomen and chest, feeling them rise and fall with each breath.",
    "Notice your back, shoulders, and arms.",
    "Bring attention to your neck and head.",
    "Finally, become aware of your whole body as one connected system.",
    "Take a deep breath and when you're ready, slowly open your eyes.",
  ],
  [MEDITATION_TYPES.LOVING_KINDNESS]: [
    "Find a comfortable position and close your eyes.",
    "Take a few deep breaths to center yourself.",
    "Bring to mind someone you care deeply about.",
    "Silently repeat: May you be happy. May you be healthy. May you be safe. May you live with ease.",
    "Now bring to mind yourself.",
    "Repeat: May I be happy. May I be healthy. May I be safe. May I live with ease.",
    "Extend these wishes to someone you feel neutral about.",
    "May they be happy, healthy, safe, and live with ease.",
    "Now extend these wishes to someone you find difficult.",
    "May they too be happy, healthy, safe, and live with ease.",
    "Finally, extend these wishes to all beings everywhere.",
    "May all beings be happy, healthy, safe, and live with ease.",
    "Take a deep breath and when you're ready, slowly open your eyes.",
  ],
};

// Get meditation settings
export const getMeditationSettings = async () => {
  try {
    const settingsJson = await AsyncStorage.getItem(MEDITATION_SETTINGS_KEY);
    return settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting meditation settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Save meditation settings
export const saveMeditationSettings = async (settings) => {
  try {
    const updatedSettings = { ...DEFAULT_SETTINGS, ...settings };
    await AsyncStorage.setItem(MEDITATION_SETTINGS_KEY, JSON.stringify(updatedSettings));
    return updatedSettings;
  } catch (error) {
    console.error('Error saving meditation settings:', error);
    throw error;
  }
};

// Get meditation history
export const getMeditationHistory = async () => {
  try {
    const historyJson = await AsyncStorage.getItem(MEDITATION_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting meditation history:', error);
    return [];
  }
};

// Save meditation session to history
export const saveMeditationSession = async (type, duration, mood) => {
  try {
    const history = await getMeditationHistory();

    const newSession = {
      id: Date.now().toString(),
      type,
      duration, // in minutes
      timestamp: new Date().toISOString(),
      mood, // mood after meditation
    };

    const updatedHistory = [newSession, ...history];
    await AsyncStorage.setItem(MEDITATION_HISTORY_KEY, JSON.stringify(updatedHistory));

    return newSession;
  } catch (error) {
    console.error('Error saving meditation session:', error);
    throw error;
  }
};

// Get meditation statistics
export const getMeditationStats = async () => {
  try {
    const history = await getMeditationHistory();

    if (history.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        longestStreak: 0,
        currentStreak: 0,
        favoriteType: null,
      };
    }

    // Calculate total minutes
    const totalMinutes = history.reduce((sum, session) => sum + session.duration, 0);

    // Calculate favorite type
    const typeCounts = history.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {});

    const favoriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0];

    // Calculate streaks
    const dateMap = new Map();
    history.forEach(session => {
      const date = new Date(session.timestamp).toLocaleDateString();
      dateMap.set(date, true);
    });

    // Current streak
    let currentStreak = 0;
    const today = new Date();
    let currentDate = new Date(today);

    while (dateMap.has(currentDate.toLocaleDateString())) {
      currentStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Longest streak (would require more complex calculation in a real app)
    // For simplicity, we'll just use the current streak for now
    const longestStreak = currentStreak;

    return {
      totalSessions: history.length,
      totalMinutes,
      longestStreak,
      currentStreak,
      favoriteType,
    };
  } catch (error) {
    console.error('Error getting meditation stats:', error);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      longestStreak: 0,
      currentStreak: 0,
      favoriteType: null,
    };
  }
};

// Get guided meditation script
export const getGuidedMeditationScript = (type) => {
  return GUIDED_MEDITATION_SCRIPTS[type] || GUIDED_MEDITATION_SCRIPTS[MEDITATION_TYPES.BREATHING];
};

// Speak guided meditation instruction
export const speakMeditationInstruction = (instruction) => {
  Speech.speak(instruction, {
    language: 'en',
    pitch: 0.9,
    rate: 0.8,
  });
};

// Stop speaking
export const stopSpeaking = () => {
  Speech.stop();
};

// Get recommended meditation based on mood
export const getRecommendedMeditation = (mood) => {
  switch (mood) {
    case 'anxious':
      return {
        type: MEDITATION_TYPES.BREATHING,
        duration: 5,
        title: 'Calming Breath',
        description: 'A simple breathing meditation to reduce anxiety and find calm.',
      };
    case 'sad':
      return {
        type: MEDITATION_TYPES.LOVING_KINDNESS,
        duration: 7,
        title: 'Self-Compassion',
        description: 'A loving-kindness meditation to nurture self-compassion and warmth.',
      };
    case 'angry':
      return {
        type: MEDITATION_TYPES.BODY_SCAN,
        duration: 10,
        title: 'Release Tension',
        description: 'A body scan to identify and release physical tension from anger.',
      };
    case 'tired':
      return {
        type: MEDITATION_TYPES.BREATHING,
        duration: 3,
        title: 'Energy Renewal',
        description: 'A short, energizing breathing practice to combat fatigue.',
      };
    default:
      return {
        type: MEDITATION_TYPES.BREATHING,
        duration: 5,
        title: 'Mindful Moment',
        description: 'A simple mindfulness meditation to center yourself.',
      };
  }
};
