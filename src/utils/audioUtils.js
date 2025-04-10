import { Audio } from 'expo-av';

// Sound objects
let meditationMusic = null;
let currentSound = null;

// Dummy sound object for fallback
const dummySound = {
  playAsync: () => Promise.resolve(),
  stopAsync: () => Promise.resolve(),
  unloadAsync: () => Promise.resolve(),
};

// Initialize audio
export const initAudio = async () => {
  try {
    // Set audio mode for background playback
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    console.log('Audio initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing audio:', error);
    return false;
  }
};

// Load meditation music
export const loadMeditationMusic = async () => {
  try {
    if (meditationMusic) {
      return meditationMusic;
    }

    console.log('Loading meditation music...');
    // For now, return dummy sound until we have a real sound file
    meditationMusic = dummySound;
    return dummySound;
  } catch (error) {
    console.error('Error loading meditation music:', error);
    return dummySound;
  }
};

// Play meditation music
export const playMeditationMusic = async () => {
  try {
    const sound = await loadMeditationMusic();
    if (sound) {
      await sound.playAsync();
      currentSound = sound;
      console.log('Meditation music started playing');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error playing meditation music:', error);
    return false;
  }
};

// Stop meditation music
export const stopMeditationMusic = async () => {
  try {
    if (meditationMusic) {
      await meditationMusic.stopAsync();
      console.log('Meditation music stopped');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error stopping meditation music:', error);
    return false;
  }
};

// Clean up audio resources
export const unloadAudio = async () => {
  try {
    if (meditationMusic && meditationMusic !== dummySound) {
      await meditationMusic.unloadAsync();
      meditationMusic = null;
      console.log('Meditation music unloaded');
    }

    if (currentSound && currentSound !== meditationMusic && currentSound !== dummySound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    return true;
  } catch (error) {
    console.error('Error unloading audio:', error);
    return false;
  }
};
