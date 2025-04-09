// Model Manager for SoulSpace
// Handles loading and running AI models for emotion detection and response generation

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMOTION_LABELS, getConfidenceThreshold } from '../utils/emotionLabels';

// Constants for model paths
const EMOTION_MODEL_PATH = FileSystem.documentDirectory + 'emotion_model.onnx';
const LLM_MODEL_PATH = FileSystem.documentDirectory + 'llm_model.onnx';

// Model loading status
let emotionModelLoaded = false;
let llmModelLoaded = false;

// Initialize models
export const initModels = async () => {
  try {
    // Check if models exist in the file system
    const emotionModelInfo = await FileSystem.getInfoAsync(EMOTION_MODEL_PATH);
    const llmModelInfo = await FileSystem.getInfoAsync(LLM_MODEL_PATH);
    
    const emotionModelExists = emotionModelInfo.exists;
    const llmModelExists = llmModelInfo.exists;

    console.log('Emotion model exists:', emotionModelExists);
    console.log('LLM model exists:', llmModelExists);

    // For now, we'll just check if the files exist but not try to load them
    // This is a placeholder for when we have the actual models and onnxruntime integration
    if (emotionModelExists) {
      emotionModelLoaded = true;
      console.log('Emotion model found in file system');
    } else {
      console.log('Emotion model not found in file system');
    }

    // Check if LLM model exists
    if (llmModelExists) {
      llmModelLoaded = true;
      console.log('LLM model found in file system');
    } else {
      console.log('LLM model not found in file system');
    }

    // Save model status to AsyncStorage
    await AsyncStorage.setItem('emotionModelLoaded', String(emotionModelLoaded));
    await AsyncStorage.setItem('llmModelLoaded', String(llmModelLoaded));

    return {
      emotionModelLoaded,
      llmModelLoaded
    };
  } catch (error) {
    console.error('Error initializing models:', error);
    return {
      emotionModelLoaded: false,
      llmModelLoaded: false
    };
  }
};

// Detect emotion using the model
export const detectEmotionWithModel = async (text) => {
  try {
    // Check if model is loaded
    if (!emotionModelLoaded) {
      console.log('Emotion model not loaded, falling back to rule-based detection');
      return null;
    }

    // This is a placeholder for when we have the actual model
    // For now, we'll always return null to fall back to rule-based detection
    console.log('Emotion detection model would process:', text);
    return null;
  } catch (error) {
    console.error('Error detecting emotion with model:', error);
    return null;
  }
};

// Generate response using the LLM model
export const generateResponseWithLLM = async (userInput, personality, emotion, conversationHistory = []) => {
  try {
    // Check if model is loaded
    if (!llmModelLoaded) {
      console.log('LLM model not loaded, falling back to rule-based response');
      return null;
    }
    
    // This is a placeholder for when we have the actual model
    // For now, we'll always return null to fall back to rule-based response
    console.log('LLM would process:', formatPrompt(userInput, personality, emotion, conversationHistory));
    return null;
  } catch (error) {
    console.error('Error generating response with LLM:', error);
    return null;
  }
};

// Format prompt for the LLM
const formatPrompt = (userInput, personality, emotion, conversationHistory) => {
  // Create a context from the conversation history (limited to last few exchanges)
  const context = conversationHistory
    .slice(-4) // Last 2 exchanges (4 messages)
    .map(msg => `${msg.isUser ? 'User' : 'AI'}: ${msg.text}`)
    .join('\n');
  
  // Format the prompt based on the personality and detected emotion
  return `You are a friendly mental health companion. The user feels ${emotion || 'neutral'}. Respond like a ${personality} AI.
${context ? `Previous conversation:\n${context}\n` : ''}
User: ${userInput}
AI:`;
};

// Check if models are loaded
export const areModelsLoaded = async () => {
  try {
    const emotionLoaded = await AsyncStorage.getItem('emotionModelLoaded') === 'true';
    const llmLoaded = await AsyncStorage.getItem('llmModelLoaded') === 'true';
    
    return {
      emotionModelLoaded: emotionLoaded,
      llmModelLoaded: llmLoaded
    };
  } catch (error) {
    console.error('Error checking if models are loaded:', error);
    return {
      emotionModelLoaded: false,
      llmModelLoaded: false
    };
  }
};
