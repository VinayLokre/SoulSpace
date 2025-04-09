// Journal Service for SoulSpace
// Handles journal entries storage and retrieval

import AsyncStorage from '@react-native-async-storage/async-storage';
import { detectEmotion } from '../ai/aiManager';

// Keys for AsyncStorage
const JOURNAL_ENTRIES_KEY = 'journal_entries';
const JOURNAL_PROMPTS_KEY = 'journal_prompts';

// Default journal prompts
const DEFAULT_PROMPTS = [
  "What made you smile today?",
  "What's something you're grateful for right now?",
  "How are you feeling, and why might you be feeling this way?",
  "What's one small win you had today?",
  "What's something you're looking forward to?",
  "What's a challenge you're facing, and how might you overcome it?",
  "What's something you learned recently?",
  "What's a quality you appreciate about yourself?",
  "What's a moment of peace you experienced today?",
  "If your emotions were weather, what would today's forecast be?",
  "What's something you'd like to tell your future self?",
  "What's a boundary you need to set or maintain?",
  "What's a small act of self-care you can do today?",
  "What's something that brought you comfort recently?",
  "What's a thought pattern you'd like to change?",
];

// Get all journal entries
export const getJournalEntries = async () => {
  try {
    const entriesJson = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
    return entriesJson ? JSON.parse(entriesJson) : [];
  } catch (error) {
    console.error('Error getting journal entries:', error);
    return [];
  }
};

// Save a new journal entry
export const saveJournalEntry = async (content, prompt = null) => {
  try {
    // Get existing entries
    const entries = await getJournalEntries();
    
    // Create new entry
    const newEntry = {
      id: Date.now().toString(),
      content,
      prompt,
      timestamp: new Date().toISOString(),
      emotion: detectEmotion(content) || 'neutral',
    };
    
    // Add to entries and save
    const updatedEntries = [newEntry, ...entries];
    await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(updatedEntries));
    
    return newEntry;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (entryId) => {
  try {
    const entries = await getJournalEntries();
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// Update a journal entry
export const updateJournalEntry = async (entryId, updatedContent) => {
  try {
    const entries = await getJournalEntries();
    const updatedEntries = entries.map(entry => {
      if (entry.id === entryId) {
        return {
          ...entry,
          content: updatedContent,
          emotion: detectEmotion(updatedContent) || entry.emotion,
          updatedAt: new Date().toISOString(),
        };
      }
      return entry;
    });
    
    await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

// Get a random journal prompt
export const getRandomPrompt = async () => {
  try {
    // Try to get custom prompts
    const promptsJson = await AsyncStorage.getItem(JOURNAL_PROMPTS_KEY);
    const prompts = promptsJson ? JSON.parse(promptsJson) : DEFAULT_PROMPTS;
    
    // Return a random prompt
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  } catch (error) {
    console.error('Error getting random prompt:', error);
    // Fallback to a default prompt
    return "How are you feeling today?";
  }
};

// Add a custom journal prompt
export const addCustomPrompt = async (prompt) => {
  try {
    const promptsJson = await AsyncStorage.getItem(JOURNAL_PROMPTS_KEY);
    const prompts = promptsJson ? JSON.parse(promptsJson) : DEFAULT_PROMPTS;
    
    // Add new prompt if it doesn't already exist
    if (!prompts.includes(prompt)) {
      const updatedPrompts = [...prompts, prompt];
      await AsyncStorage.setItem(JOURNAL_PROMPTS_KEY, JSON.stringify(updatedPrompts));
    }
  } catch (error) {
    console.error('Error adding custom prompt:', error);
    throw error;
  }
};

// Get journal statistics
export const getJournalStats = async () => {
  try {
    const entries = await getJournalEntries();
    
    // If no entries, return empty stats
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        streakDays: 0,
        emotionBreakdown: {},
        averageLength: 0,
      };
    }
    
    // Calculate emotion breakdown
    const emotionBreakdown = entries.reduce((acc, entry) => {
      const emotion = entry.emotion || 'neutral';
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate average entry length
    const totalLength = entries.reduce((sum, entry) => sum + entry.content.length, 0);
    const averageLength = Math.round(totalLength / entries.length);
    
    // Calculate streak (consecutive days with entries)
    const dateMap = new Map();
    entries.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      dateMap.set(date, true);
    });
    
    let streakDays = 0;
    const today = new Date();
    let currentDate = new Date(today);
    
    while (dateMap.has(currentDate.toLocaleDateString())) {
      streakDays++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return {
      totalEntries: entries.length,
      streakDays,
      emotionBreakdown,
      averageLength,
    };
  } catch (error) {
    console.error('Error getting journal stats:', error);
    return {
      totalEntries: 0,
      streakDays: 0,
      emotionBreakdown: {},
      averageLength: 0,
    };
  }
};
