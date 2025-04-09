// Emotion labels mapping for the emotion detection model
// Maps the output indices to emotion labels

export const EMOTION_LABELS = {
  0: 'happy',
  1: 'sad',
  2: 'anxious',
  3: 'angry',
  4: 'tired',
  5: 'calm',
  6: 'neutral'
};

// Map model output to our app's emotion categories
export const mapModelEmotionToApp = (modelEmotion) => {
  // This mapping might need adjustment based on the actual model output
  const mapping = {
    'joy': 'happy',
    'happiness': 'happy',
    'excitement': 'happy',
    'love': 'happy',
    'optimism': 'happy',
    
    'sadness': 'sad',
    'grief': 'sad',
    'disappointment': 'sad',
    'depression': 'sad',
    
    'anxiety': 'anxious',
    'fear': 'anxious',
    'nervousness': 'anxious',
    'worry': 'anxious',
    
    'anger': 'angry',
    'annoyance': 'angry',
    'frustration': 'angry',
    'rage': 'angry',
    
    'exhaustion': 'tired',
    'fatigue': 'tired',
    'sleepiness': 'tired',
    
    'calmness': 'calm',
    'contentment': 'calm',
    'relaxation': 'calm',
    'serenity': 'calm',
    'peace': 'calm',
    
    'neutral': 'neutral'
  };
  
  return mapping[modelEmotion.toLowerCase()] || 'neutral';
};

// Get confidence threshold for emotion detection
export const getConfidenceThreshold = () => {
  return 0.5; // Default threshold, can be adjusted
};
