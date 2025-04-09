// AI Manager for SoulSpace
// Handles AI interactions, emotion detection, and voice processing

import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Simple emotion detection based on keywords
// This would be replaced with a proper ML model in a production app
export const detectEmotion = (text) => {
  if (!text) return null;

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
};

// AI response generator based on user input and selected personality
export const generateAIResponse = async (userInput, personality = AI_PERSONALITIES.LISTENER) => {
  try {
    // Check if we're in offline mode
    const isOffline = await AsyncStorage.getItem('offlineMode') === 'true';

    if (isOffline) {
      // Use simple rule-based responses when offline
      return generateOfflineResponse(userInput, personality);
    } else {
      // In a real app, this would call an API
      // For now, we'll simulate a network request
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateOfflineResponse(userInput, personality));
        }, 1000);
      });
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm having trouble processing that right now. Can we try again?";
  }
};

// Simple rule-based response generator for offline mode
const generateOfflineResponse = (userInput, personality) => {
  const emotion = detectEmotion(userInput);
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
      "I'm glad to hear you're feeling positive! What's bringing you joy right now?",
      "That's wonderful! What specifically is making you feel happy today?",
      "It's great that you're in good spirits. What's contributing to your happiness?",
      "I'm happy to hear that! Would you like to share what's going well for you?"
    ],
    sad: [
      "I'm sorry you're feeling down. Would you like to talk more about what's troubling you?",
      "It sounds like you're going through a difficult time. I'm here to listen if you want to share more.",
      "I understand feeling sad can be hard. What's on your mind right now?",
      "I'm here for you during this tough time. Would it help to talk about what's making you feel sad?"
    ],
    anxious: [
      "It sounds like you're feeling anxious. Remember to take deep breaths. Would you like to try a breathing exercise together?",
      "Anxiety can be challenging. What's causing you to feel this way right now?",
      "I notice you're feeling anxious. Let's take a moment to ground ourselves. What are five things you can see around you?",
      "When anxiety rises, it can help to focus on the present moment. Would you like to try a quick mindfulness exercise?"
    ],
    angry: [
      "I can sense that you're frustrated. It's okay to feel this way. Would it help to explore what triggered these feelings?",
      "Anger is a natural emotion. What happened that made you feel this way?",
      "It sounds like something has upset you. Would talking about it help process these feelings?",
      "I understand you're feeling angry. Sometimes expressing it in a healthy way can help. What might help you feel better?"
    ],
    tired: [
      "You seem tired. It's important to rest and recharge. Is there something specific that's draining your energy?",
      "Feeling exhausted can make everything harder. Have you been able to get enough rest lately?",
      "I notice you're feeling tired. What would help you recharge right now?",
      "It sounds like you could use some rest. What's been demanding your energy lately?"
    ],
    calm: [
      "It's wonderful that you're feeling peaceful. These moments are precious. What's helping you maintain this sense of calm?",
      "I'm glad you're feeling calm. What practices have been working well for you?",
      "That sense of peace is valuable. What helped you reach this state of mind?",
      "It's great that you're feeling centered. What would help you maintain this feeling?"
    ],
    default: [
      "I'm here to listen. How can I support you today?",
      "I'd like to understand more about how you're feeling. Can you tell me more?",
      "I'm here for you. What's on your mind right now?",
      "I'm listening. What would you like to talk about today?"
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
  try {
    const isSpeechEnabled = await AsyncStorage.getItem('speechEnabled') !== 'false';

    if (isSpeechEnabled) {
      Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
      });
    }
  } catch (error) {
    console.error('Error speaking text:', error);
  }
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
