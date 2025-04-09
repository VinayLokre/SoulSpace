// AI Manager for SoulSpace
// Handles AI interactions, emotion detection, and voice processing

import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initModels,
  detectEmotionWithModel,
  generateResponseWithLLM,
  areModelsLoaded
} from './modelManager';

// Initialize AI models
export const initializeAI = async () => {
  try {
    console.log('Initializing AI models...');
    const result = await initModels();
    console.log('AI models initialization result:', result);
    return result;
  } catch (error) {
    console.error('Error initializing AI models:', error);
    return {
      emotionModelLoaded: false,
      llmModelLoaded: false
    };
  }
};

// Check if AI models are loaded
export const checkAIModelsLoaded = async () => {
  try {
    const result = await areModelsLoaded();
    console.log('AI models loaded status:', result);
    return result;
  } catch (error) {
    console.error('Error checking AI models status:', error);
    return {
      emotionModelLoaded: false,
      llmModelLoaded: false
    };
  }
};

// AI Personality modes
export const AI_PERSONALITIES = {
  LISTENER: 'listener',
  MOTIVATOR: 'motivator',
  FUNNY: 'funny',
};

// Emotion detection keywords (simple implementation)
// In a real app, this would be replaced with a proper ML model
const EMOTION_KEYWORDS = {
  happy: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good', 'smile'],
  sad: ['sad', 'unhappy', 'depressed', 'down', 'blue', 'upset', 'cry', 'tears'],
  anxious: ['anxious', 'nervous', 'worry', 'stress', 'afraid', 'fear', 'panic', 'overwhelm'],
  angry: ['angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'furious', 'rage'],
  tired: ['tired', 'exhausted', 'sleepy', 'fatigue', 'drained', 'weary'],
  calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content'],
};

// Emotion detection using ML model with fallback to keyword-based detection
export const detectEmotion = async (text) => {
  if (!text) return null;

  try {
    // First try to use the ML model for emotion detection
    const modelEmotion = await detectEmotionWithModel(text);

    // If model detection was successful, return the result
    if (modelEmotion) {
      console.log('Using ML model for emotion detection');
      return modelEmotion;
    }

    // Fall back to keyword-based detection if model fails
    console.log('Falling back to keyword-based emotion detection');
    const lowercaseText = text.toLowerCase();
    let detectedEmotion = null;
    let highestCount = 0;

    Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
      const count = keywords.filter(keyword => lowercaseText.includes(keyword)).length;
      if (count > highestCount) {
        highestCount = count;
        detectedEmotion = emotion;
      }
    });

    return highestCount > 0 ? detectedEmotion : 'neutral';
  } catch (error) {
    console.error('Error in emotion detection:', error);
    return 'neutral'; // Default to neutral on error
  }
};

// Track conversation history for context
let conversationHistory = [];

// AI response generator based on user input and selected personality
export const generateAIResponse = async (userInput, personality = AI_PERSONALITIES.LISTENER) => {
  try {
    // Check if we're in offline mode
    const isOffline = await AsyncStorage.getItem('offlineMode') === 'true';

    // Detect emotion in user's message
    const emotion = await detectEmotion(userInput);
    console.log(`Detected emotion: ${emotion}`);

    let response;

    if (isOffline) {
      // Try to use the LLM model first
      response = await generateResponseWithLLM(userInput, personality, emotion, conversationHistory);

      // Fall back to rule-based responses if LLM fails
      if (!response) {
        console.log('Falling back to rule-based response generation');
        response = generateOfflineResponse(userInput, personality, emotion);
      } else {
        console.log('Using LLM for response generation');
      }
    } else {
      // In a real app, this might call a cloud API
      // For now, we'll try the local LLM first, then fall back to rule-based
      response = await generateResponseWithLLM(userInput, personality, emotion, conversationHistory);

      if (!response) {
        // Simulate network delay for rule-based fallback
        response = await new Promise((resolve) => {
          setTimeout(() => {
            resolve(generateOfflineResponse(userInput, personality, emotion));
          }, 1000);
        });
      }
    }

    // Update conversation history
    conversationHistory.push({ text: userInput, isUser: true });
    conversationHistory.push({ text: response, isUser: false });

    // Keep conversation history limited to last 10 messages
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    return response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm having trouble processing that right now. Can we try again?";
  }
};

// Simple rule-based response generator for offline mode
const generateOfflineResponse = (userInput, personality, emotion) => {
  // If emotion is not provided, use the synchronous version of detectEmotion
  if (!emotion) {
    // This is a simplified synchronous version for backward compatibility
    const lowercaseText = userInput.toLowerCase();
    let detectedEmotion = null;
    let highestCount = 0;

    Object.entries(EMOTION_KEYWORDS).forEach(([em, keywords]) => {
      const count = keywords.filter(keyword => lowercaseText.includes(keyword)).length;
      if (count > highestCount) {
        highestCount = count;
        detectedEmotion = em;
      }
    });

    emotion = highestCount > 0 ? detectedEmotion : 'neutral';
  }
  const lowercaseInput = userInput.toLowerCase();

  // Add more variety to responses
  const responses = {
    greeting: [
      "Hello there! How are you feeling today?",
      "Hi! It's good to see you. How's your day going?",
      "Welcome back! How are you doing right now?",
      "Hello! I'm here to support you. How are you feeling?"
    ],
    about: [
      "I'm your SoulSpace companion, here to support your emotional wellbeing.",
      "I'm an AI designed to help you navigate your emotions and find peace.",
      "Think of me as your emotional wellness partner, here whenever you need support.",
      "I'm your digital companion in SoulSpace, focused on helping you feel better."
    ]
  };

  // Check for greetings with more variety
  if (lowercaseInput.includes('hello') || lowercaseInput.includes('hi')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  }

  // Check for questions about the AI with more variety
  if (lowercaseInput.includes('who are you') || lowercaseInput.includes('what are you')) {
    return responses.about[Math.floor(Math.random() * responses.about.length)];
  }

  // Generate response based on detected emotion and personality
  switch (personality) {
    case AI_PERSONALITIES.LISTENER:
      return generateListenerResponse(emotion, userInput);
    case AI_PERSONALITIES.MOTIVATOR:
      return generateMotivatorResponse(emotion, userInput);
    case AI_PERSONALITIES.FUNNY:
      return generateFunnyResponse(emotion, userInput);
    default:
      return generateListenerResponse(emotion, userInput);
  }
};

// Response generators for different AI personalities
const generateListenerResponse = (emotion, userInput) => {
  // Create arrays of responses for each emotion
  const responses = {
    happy: [
      "I'm genuinely happy to hear you're feeling good! What specific moments or achievements are bringing you joy today?",
      "Your positive energy is wonderful to hear. Could you share what's been the highlight of your day so far?",
      "It's great that you're feeling happy! In what ways has this positive mood influenced your thoughts or actions today?",
      "I'm so glad you're in good spirits. What practices or habits have been helping you maintain this positive outlook?"
    ],
    sad: [
      "I notice you're feeling down, and that's completely valid. Would you like to talk about what specifically triggered these feelings?",
      "I'm here with you in this difficult moment. Sometimes putting words to our sadness can help - what's weighing on your heart right now?",
      "When we're sad, it can feel isolating. I want you to know I'm here to listen without judgment. What's troubling you most at this moment?",
      "I'm sorry you're experiencing sadness. Would it help to explore what might bring you even a small moment of comfort right now?"
    ],
    anxious: [
      "Anxiety can feel overwhelming. Let's take a moment together - can you identify what specific worries are at the forefront of your mind?",
      "I hear that you're feeling anxious. Sometimes naming our fears can reduce their power - what uncertainties are you facing right now?",
      "When anxiety rises, our breathing often changes. Would you like to try a brief breathing exercise with me to help center yourself?",
      "Your anxiety is a valid response to what you're experiencing. What has helped you navigate similar feelings in the past?"
    ],
    angry: [
      "I can sense your frustration, and it's completely understandable. What specific situation has triggered these intense feelings?",
      "Anger often masks deeper emotions. When you feel ready, would you like to explore what might be beneath this anger?",
      "Your feelings of anger are valid. Sometimes it helps to express exactly what you wish you could say or do - would that be helpful?",
      "I'm here to listen without judgment about what's making you angry. What would feel most supportive right now?"
    ],
    tired: [
      "Being exhausted affects us physically and mentally. Beyond sleep, what other factors might be contributing to your fatigue?",
      "I hear that you're feeling drained. What activities or responsibilities have been taking the most energy from you lately?",
      "Sometimes tiredness is our body's way of asking for something. What do you think your body or mind might need right now?",
      "It's important to honor your need for rest. What small adjustment could you make today to give yourself more space to recharge?"
    ],
    calm: [
      "This sense of calm you're experiencing is valuable. What practices or circumstances have helped you achieve this balanced state?",
      "I'm glad you're feeling centered. What insights or perspectives become clearer to you when you're in this peaceful state?",
      "Moments of tranquility can be powerful. How might you extend or revisit this feeling when challenges arise in the future?",
      "It's wonderful that you're feeling at peace. How does this calmness manifest in your body and thoughts right now?"
    ],
    default: [
      "I'm here as a supportive presence. What's on your mind that you'd like to explore together?",
      "I'm interested in understanding your current experience. What would feel meaningful to discuss right now?",
      "I'm here to listen with care and without judgment. What thoughts or feelings would you like to share?",
      "Our conversations can go wherever you need them to. What matters to you in this moment?"
    ]
  };

  // Return a random response based on the detected emotion
  if (responses[emotion]) {
    return responses[emotion][Math.floor(Math.random() * responses[emotion].length)];
  } else {
    // Default responses if emotion not recognized
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  }
};

const generateMotivatorResponse = (emotion, userInput) => {
  // Create arrays of responses for each emotion
  const responses = {
    happy: [
      "That's fantastic! Hold onto this positive energy and let it fuel your day. What's your next goal?",
      "Amazing! This positive energy is your superpower. How will you use it to achieve something great today?",
      "Wonderful! Happiness is fuel for achievement. What exciting challenge would you like to tackle next?",
      "Excellent! When you're feeling this good, you can accomplish anything. What's on your achievement list?"
    ],
    sad: [
      "I believe in your strength to overcome this difficult time. Every emotion is temporary, and brighter days are ahead. What's one small step you could take today?",
      "This sadness is just a chapter, not your whole story. You have the power to write the next page. What tiny action could move you forward?",
      "Even in darkness, your inner light is still there. Let's find one small way to let it shine today. What could that be?",
      "Every champion faces setbacks. It's how we respond that defines us. What's one tiny victory you could aim for right now?"
    ],
    anxious: [
      "You've got this! Anxiety is just your body's way of preparing for a challenge. Let's channel that energy into positive action. What's one thing you can control right now?",
      "That anxious energy can be transformed into focused power! What's one small task you could complete to feel more in control?",
      "Anxiety shows you care deeply. Let's harness that passion productively. What's one step you can take toward what matters?",
      "This feeling is temporary, but your strength is permanent. What's one anxiety-busting action you could take right now?"
    ],
    angry: [
      "That fire inside you can be transformed into determination! Let's redirect that energy toward something constructive. What positive change would you like to make?",
      "Your passion is powerful! Let's channel that intensity into something amazing. What could you create with this energy?",
      "That anger shows you care deeply. What meaningful action could you take to address what matters to you?",
      "This powerful emotion can fuel positive change. What's one constructive thing you could do with this energy?"
    ],
    tired: [
      "Even champions need rest! Your body is telling you something important. After recharging, you'll be unstoppable again. What self-care activity could you do today?",
      "Rest is part of the success journey, not a detour. What rejuvenating activity would help you come back stronger?",
      "Your energy is a precious resource. What's one way you could recharge your inner battery today?",
      "Taking time to rest shows wisdom, not weakness. What restorative activity would serve you best right now?"
    ],
    calm: [
      "This peaceful state is your natural power mode! From this centered place, you can accomplish anything. What inspiring project would you like to focus on?",
      "This calm clarity is the perfect foundation for greatness. What meaningful goal would you like to pursue now?",
      "From this centered state, your potential is limitless. What important priority deserves your attention today?",
      "This tranquility is your launchpad for success. What meaningful action would you like to take from this peaceful place?"
    ],
    default: [
      "You have incredible potential! What would you like to achieve today?",
      "Your journey to greatness continues today. What's your next step?",
      "Every day brings new opportunities for growth. What will you accomplish today?",
      "Your potential is limitless. What meaningful goal are you working toward?"
    ]
  };

  // Return a random response based on the detected emotion
  if (responses[emotion]) {
    return responses[emotion][Math.floor(Math.random() * responses[emotion].length)];
  } else {
    // Default responses if emotion not recognized
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  }
};

const generateFunnyResponse = (emotion, userInput) => {
  // Create arrays of responses for each emotion
  const responses = {
    happy: [
      "You're so cheerful, I bet rainbows get jealous of your vibe! Keep spreading that joy like it's free wifi!",
      "You're glowing so bright, astronauts can probably see you from space! What's your happiness secret?",
      "If happiness were a currency, you'd be a billionaire! Can I have some of whatever you're having?",
      "Your good mood is more contagious than a yawn in a meeting! Keep that positivity pandemic going!"
    ],
    sad: [
      "Why did the smartphone go to therapy? It had too many app-xiety issues! Sorry for the bad joke, but I hope it brought a tiny smile.",
      "What did the grape say when it got stepped on? Nothing, it just let out a little wine! ...I'll see myself out.",
      "Remember, chocolate doesn't ask silly questions, chocolate understands. That's why it's better than most people!",
      "They say tears are a good moisturizer. At this rate, you'll have the most hydrated face in town! Premium skincare for free!"
    ],
    anxious: [
      "If worries were dollars, you'd be a billionaire by now! Let's spend some of that anxiety currency on a mental vacation instead.",
      "Your mind is like my internet browser—26 tabs open, 5 of them frozen, and you can't find where the anxiety music is coming from!",
      "Anxiety is just excitement in disguise. You're not nervous, you're just extremely enthusiastic about potential disasters!",
      "Your anxiety has anxiety! That's like worry-inception. We need to go deeper... or maybe just take a deep breath instead?"
    ],
    angry: [
      "You're so fired up, you could toast marshmallows from across the room! Let's channel that energy into something fun instead.",
      "You're not angry, you're just passionate about things being less annoying! I respect that level of quality control.",
      "If your frustration were electricity, we could power a small city! Let's use that energy to power something fun instead.",
      "You're so hot-headed right now, you could fry an egg on your forehead! Breakfast is served, I guess?"
    ],
    tired: [
      "You're not lazy, you're just on energy-saving mode! Even smartphones need charging, and you're way more sophisticated than Siri.",
      "Your energy level is so low, it needs a ladder to reach the bottom of the barrel! Time for a recharge, human battery!",
      "You're not tired, you're just operating at 1% battery with low power mode on. Where's your human charger?",
      "If tiredness were an Olympic sport, you'd be taking home the gold! Congratulations on your record-breaking exhaustion!"
    ],
    calm: [
      "You're so zen right now, meditation apps are taking notes! Whatever you're doing, bottle it and sell it - you'll make millions!",
      "You're calmer than a sloth on vacation! Can you teach me your ways, oh peaceful one?",
      "Your chill level is so high, penguins are asking for your advice on staying cool. That's impressive!",
      "You're more relaxed than a cat in a sunbeam after a big meal. Living the dream!"
    ],
    default: [
      "Why don't scientists trust atoms? Because they make up everything! Just like I'm making up this response to make you smile.",
      "I'd tell you a chemistry joke, but I know I wouldn't get a reaction. Unlike this AI conversation!",
      "What do you call an AI that sings? Artificial Harmonies! ...I'll work on my jokes, I promise.",
      "Life is short. Smile while you still have teeth! Or in my case, while I still have all my bits and bytes."
    ]
  };

  // Return a random response based on the detected emotion
  if (responses[emotion]) {
    return responses[emotion][Math.floor(Math.random() * responses[emotion].length)];
  } else {
    // Default responses if emotion not recognized
    return responses.default[Math.floor(Math.random() * responses.default.length)];
  }
};

// Text-to-speech function
export const speakText = async (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isSpeechEnabled = await AsyncStorage.getItem('speechEnabled') !== 'false';

      if (isSpeechEnabled) {
        const id = Speech.speak(text, {
          language: 'en',
          pitch: 1.0,
          rate: 0.9,
          onDone: () => resolve(),
          onError: (error) => reject(error),
        });
      } else {
        resolve(); // Resolve immediately if speech is disabled
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      reject(error);
    }
  });
};

// Stop speaking
export const stopSpeaking = () => {
  Speech.stop();
};

// Toggle speech setting
export const toggleSpeech = async (enabled) => {
  try {
    await AsyncStorage.setItem('speechEnabled', String(enabled));
  } catch (error) {
    console.error('Error toggling speech setting:', error);
  }
};

// Toggle online/offline mode
export const toggleOfflineMode = async (offline) => {
  try {
    await AsyncStorage.setItem('offlineMode', String(offline));
  } catch (error) {
    console.error('Error toggling offline mode:', error);
  }
};

// Get current AI settings
export const getAISettings = async () => {
  try {
    const [speechEnabled, offlineMode, personality] = await Promise.all([
      AsyncStorage.getItem('speechEnabled'),
      AsyncStorage.getItem('offlineMode'),
      AsyncStorage.getItem('aiPersonality'),
    ]);

    return {
      speechEnabled: speechEnabled !== 'false',
      offlineMode: offlineMode === 'true',
      personality: personality || AI_PERSONALITIES.LISTENER,
    };
  } catch (error) {
    console.error('Error getting AI settings:', error);
    return {
      speechEnabled: true,
      offlineMode: false,
      personality: AI_PERSONALITIES.LISTENER,
    };
  }
};

// Save AI personality preference
export const setAIPersonality = async (personality) => {
  try {
    await AsyncStorage.setItem('aiPersonality', personality);
  } catch (error) {
    console.error('Error setting AI personality:', error);
  }
};
