import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../utils/theme';
import StarryBackground from '../components/StarryBackground';
import BreathingAnimation from '../components/BreathingAnimation';
import GlowingButton from '../components/GlowingButton';
import {
  getMeditationSettings,
  saveMeditationSettings,
  MEDITATION_TYPES,
  getRecommendedMeditation,
  saveMeditationSession,
  speakMeditationInstruction,
  stopSpeaking,
} from '../services/meditationService';

const MeditationScreen = () => {
  // State variables
  const [settings, setSettings] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [currentMood, setCurrentMood] = useState('neutral');
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [recommendedMeditations, setRecommendedMeditations] = useState([]);

  // Load meditation settings on component mount
  useEffect(() => {
    loadSettings();
    loadRecommendedMeditations();

    return () => {
      // Clean up on unmount
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      stopSpeaking();
    };
  }, []);

  // Load meditation settings
  const loadSettings = async () => {
    try {
      const meditationSettings = await getMeditationSettings();
      setSettings(meditationSettings);
    } catch (error) {
      console.error('Error loading meditation settings:', error);
    }
  };

  // Load recommended meditations
  const loadRecommendedMeditations = () => {
    // In a real app, this would be based on user's mood history
    // For now, we'll just provide a few options
    const recommendations = [
      getRecommendedMeditation('anxious'),
      getRecommendedMeditation('tired'),
      getRecommendedMeditation('neutral'),
    ];

    setRecommendedMeditations(recommendations);
  };

  // Start a meditation session
  const startMeditation = (type, duration, title) => {
    // Clear any existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // Reset state
    setSessionCompleted(false);
    setTimer(duration * 60); // Convert minutes to seconds

    // Set up the active session
    setActiveSession({
      type,
      duration,
      title,
      startTime: new Date(),
    });

    // Start the timer
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          // Session completed
          clearInterval(interval);
          completeMeditation();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    setTimerInterval(interval);

    // If it's a guided meditation, start the first instruction
    if (type === MEDITATION_TYPES.GUIDED || type === MEDITATION_TYPES.BODY_SCAN || type === MEDITATION_TYPES.LOVING_KINDNESS) {
      const instruction = 'Find a comfortable position and close your eyes.';
      setCurrentInstruction(instruction);
      if (settings?.guidedVoice) {
        speakMeditationInstruction(instruction);
      }
    }
  };

  // Complete a meditation session
  const completeMeditation = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    setSessionCompleted(true);

    // In a real app, we would save the session to history
    try {
      await saveMeditationSession(
        activeSession.type,
        activeSession.duration,
        currentMood
      );
    } catch (error) {
      console.error('Error saving meditation session:', error);
    }
  };

  // End the current session
  const endSession = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    stopSpeaking();
    setActiveSession(null);
    setSessionCompleted(false);
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save updated settings
  const saveSettings = async () => {
    try {
      await saveMeditationSettings(settings);
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving meditation settings:', error);
    }
  };

  // Render meditation options
  const renderMeditationOptions = () => {
    return (
      <ScrollView style={styles.optionsContainer}>
        {/* Recommended Meditations */}
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedContainer}
        >
          {recommendedMeditations.map((meditation, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recommendedItem}
              onPress={() => startMeditation(meditation.type, meditation.duration, meditation.title)}
            >
              <View style={[styles.recommendedIcon, { backgroundColor: getTypeColor(meditation.type) }]}>
                <Ionicons name={getTypeIcon(meditation.type)} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.recommendedTitle}>{meditation.title}</Text>
              <Text style={styles.recommendedDuration}>{meditation.duration} min</Text>
              <Text style={styles.recommendedDescription}>{meditation.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Breathing Exercises */}
        <Text style={styles.sectionTitle}>Breathing Exercises</Text>
        <View style={styles.meditationGrid}>
          <TouchableOpacity
            style={styles.meditationItem}
            onPress={() => startMeditation(MEDITATION_TYPES.BREATHING, 5, 'Deep Breathing')}
          >
            <View style={[styles.meditationIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="pulse" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.meditationTitle}>Deep Breathing</Text>
            <Text style={styles.meditationDuration}>5 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.meditationItem}
            onPress={() => startMeditation(MEDITATION_TYPES.BREATHING, 10, 'Box Breathing')}
          >
            <View style={[styles.meditationIcon, { backgroundColor: colors.secondary }]}>
              <Ionicons name="square-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.meditationTitle}>Box Breathing</Text>
            <Text style={styles.meditationDuration}>10 min</Text>
          </TouchableOpacity>
        </View>

        {/* Guided Meditations */}
        <Text style={styles.sectionTitle}>Guided Meditations</Text>
        <View style={styles.meditationGrid}>
          <TouchableOpacity
            style={styles.meditationItem}
            onPress={() => startMeditation(MEDITATION_TYPES.BODY_SCAN, 10, 'Body Scan')}
          >
            <View style={[styles.meditationIcon, { backgroundColor: colors.accent }]}>
              <Ionicons name="body-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.meditationTitle}>Body Scan</Text>
            <Text style={styles.meditationDuration}>10 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.meditationItem}
            onPress={() => startMeditation(MEDITATION_TYPES.LOVING_KINDNESS, 15, 'Loving Kindness')}
          >
            <View style={[styles.meditationIcon, { backgroundColor: colors.mood.happy }]}>
              <Ionicons name="heart-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.meditationTitle}>Loving Kindness</Text>
            <Text style={styles.meditationDuration}>15 min</Text>
          </TouchableOpacity>
        </View>

        {/* Silent Meditation */}
        <Text style={styles.sectionTitle}>Silent Meditation</Text>
        <View style={styles.meditationGrid}>
          <TouchableOpacity
            style={styles.meditationItem}
            onPress={() => startMeditation(MEDITATION_TYPES.SILENT, 5, 'Quick Silent')}
          >
            <View style={[styles.meditationIcon, { backgroundColor: colors.mood.calm }]}>
              <Ionicons name="moon-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.meditationTitle}>Quick Silent</Text>
            <Text style={styles.meditationDuration}>5 min</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.meditationItem}
            onPress={() => startMeditation(MEDITATION_TYPES.SILENT, 20, 'Deep Silent')}
          >
            <View style={[styles.meditationIcon, { backgroundColor: colors.mood.calm }]}>
              <Ionicons name="moon" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.meditationTitle}>Deep Silent</Text>
            <Text style={styles.meditationDuration}>20 min</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Render active meditation session
  const renderActiveSession = () => {
    return (
      <View style={styles.sessionContainer}>
        <Text style={styles.sessionTitle}>{activeSession.title}</Text>
        <Text style={styles.sessionTimer}>{formatTime(timer)}</Text>

        {/* Breathing Animation */}
        {(activeSession.type === MEDITATION_TYPES.BREATHING) && (
          <BreathingAnimation
            inhaleTime={settings?.breathingPattern.inhale || 4}
            holdTime={settings?.breathingPattern.hold || 2}
            exhaleTime={settings?.breathingPattern.exhale || 6}
            holdAfterExhaleTime={settings?.breathingPattern.holdAfterExhale || 0}
            style={styles.breathingAnimation}
          />
        )}

        {/* Guided Meditation Instruction */}
        {(activeSession.type === MEDITATION_TYPES.GUIDED ||
          activeSession.type === MEDITATION_TYPES.BODY_SCAN ||
          activeSession.type === MEDITATION_TYPES.LOVING_KINDNESS) && (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>{currentInstruction}</Text>
          </View>
        )}

        {/* End Session Button */}
        <GlowingButton
          title="End Session"
          onPress={endSession}
          variant="outline"
          style={styles.endButton}
        />
      </View>
    );
  };

  // Render session completed view
  const renderSessionCompleted = () => {
    return (
      <View style={styles.completedContainer}>
        <View style={styles.completedIconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
        </View>
        <Text style={styles.completedTitle}>Session Complete</Text>
        <Text style={styles.completedSubtitle}>
          You've completed a {activeSession.duration} minute {getTypeDisplayName(activeSession.type)} session.
        </Text>

        <View style={styles.moodSelector}>
          <Text style={styles.moodTitle}>How do you feel now?</Text>
          <View style={styles.moodOptions}>
            <TouchableOpacity
              style={[styles.moodOption, currentMood === 'calm' && styles.selectedMood]}
              onPress={() => setCurrentMood('calm')}
            >
              <Ionicons
                name="water-outline"
                size={24}
                color={currentMood === 'calm' ? colors.text.primary : colors.text.secondary}
              />
              <Text style={styles.moodText}>Calm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moodOption, currentMood === 'refreshed' && styles.selectedMood]}
              onPress={() => setCurrentMood('refreshed')}
            >
              <Ionicons
                name="sunny-outline"
                size={24}
                color={currentMood === 'refreshed' ? colors.text.primary : colors.text.secondary}
              />
              <Text style={styles.moodText}>Refreshed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moodOption, currentMood === 'neutral' && styles.selectedMood]}
              onPress={() => setCurrentMood('neutral')}
            >
              <Ionicons
                name="ellipse-outline"
                size={24}
                color={currentMood === 'neutral' ? colors.text.primary : colors.text.secondary}
              />
              <Text style={styles.moodText}>Neutral</Text>
            </TouchableOpacity>
          </View>
        </View>

        <GlowingButton
          title="Done"
          onPress={endSession}
          style={styles.doneButton}
        />
      </View>
    );
  };

  // Get icon for meditation type
  const getTypeIcon = (type) => {
    switch (type) {
      case MEDITATION_TYPES.BREATHING:
        return 'pulse';
      case MEDITATION_TYPES.GUIDED:
        return 'mic-outline';
      case MEDITATION_TYPES.SILENT:
        return 'moon-outline';
      case MEDITATION_TYPES.BODY_SCAN:
        return 'body-outline';
      case MEDITATION_TYPES.LOVING_KINDNESS:
        return 'heart-outline';
      default:
        return 'moon-outline';
    }
  };

  // Get color for meditation type
  const getTypeColor = (type) => {
    switch (type) {
      case MEDITATION_TYPES.BREATHING:
        return colors.primary;
      case MEDITATION_TYPES.GUIDED:
        return colors.secondary;
      case MEDITATION_TYPES.SILENT:
        return colors.mood.calm;
      case MEDITATION_TYPES.BODY_SCAN:
        return colors.accent;
      case MEDITATION_TYPES.LOVING_KINDNESS:
        return colors.mood.happy;
      default:
        return colors.primary;
    }
  };

  // Get display name for meditation type
  const getTypeDisplayName = (type) => {
    switch (type) {
      case MEDITATION_TYPES.BREATHING:
        return 'breathing';
      case MEDITATION_TYPES.GUIDED:
        return 'guided';
      case MEDITATION_TYPES.SILENT:
        return 'silent';
      case MEDITATION_TYPES.BODY_SCAN:
        return 'body scan';
      case MEDITATION_TYPES.LOVING_KINDNESS:
        return 'loving kindness';
      default:
        return 'meditation';
    }
  };

  // Render settings modal
  const renderSettingsModal = () => {
    if (!settings) return null;

    return (
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meditation Settings</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSettings(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Breathing Pattern */}
              <Text style={styles.sectionTitle}>Breathing Pattern</Text>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Inhale (seconds)</Text>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={2}
                    maximumValue={8}
                    step={1}
                    value={settings.breathingPattern.inhale}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        breathingPattern: {
                          ...settings.breathingPattern,
                          inhale: value,
                        },
                      })
                    }
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.background.light}
                    thumbTintColor={colors.primary}
                  />
                  <Text style={styles.sliderValue}>{settings.breathingPattern.inhale}</Text>
                </View>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Hold (seconds)</Text>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={6}
                    step={1}
                    value={settings.breathingPattern.hold}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        breathingPattern: {
                          ...settings.breathingPattern,
                          hold: value,
                        },
                      })
                    }
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.background.light}
                    thumbTintColor={colors.primary}
                  />
                  <Text style={styles.sliderValue}>{settings.breathingPattern.hold}</Text>
                </View>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Exhale (seconds)</Text>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={3}
                    maximumValue={10}
                    step={1}
                    value={settings.breathingPattern.exhale}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        breathingPattern: {
                          ...settings.breathingPattern,
                          exhale: value,
                        },
                      })
                    }
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.background.light}
                    thumbTintColor={colors.primary}
                  />
                  <Text style={styles.sliderValue}>{settings.breathingPattern.exhale}</Text>
                </View>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Hold after exhale (seconds)</Text>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={4}
                    step={1}
                    value={settings.breathingPattern.holdAfterExhale}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        breathingPattern: {
                          ...settings.breathingPattern,
                          holdAfterExhale: value,
                        },
                      })
                    }
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.background.light}
                    thumbTintColor={colors.primary}
                  />
                  <Text style={styles.sliderValue}>{settings.breathingPattern.holdAfterExhale}</Text>
                </View>
              </View>

              {/* Other Settings */}
              <Text style={styles.sectionTitle}>Other Settings</Text>
              <View style={styles.switchItem}>
                <Text style={styles.settingLabel}>Guided Voice</Text>
                <Switch
                  value={settings.guidedVoice}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      guidedVoice: value,
                    })
                  }
                  trackColor={{ false: colors.background.light, true: colors.primary }}
                  thumbColor={settings.guidedVoice ? colors.text.primary : colors.text.secondary}
                />
              </View>

              <View style={styles.switchItem}>
                <Text style={styles.settingLabel}>Vibration</Text>
                <Switch
                  value={settings.vibration}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      vibration: value,
                    })
                  }
                  trackColor={{ false: colors.background.light, true: colors.primary }}
                  thumbColor={settings.vibration ? colors.text.primary : colors.text.secondary}
                />
              </View>

              <GlowingButton
                title="Save Settings"
                onPress={saveSettings}
                style={styles.saveButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <StarryBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meditation</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        {activeSession ? (
          sessionCompleted ? renderSessionCompleted() : renderActiveSession()
        ) : (
          renderMeditationOptions()
        )}

        {/* Settings Modal */}
        {renderSettingsModal()}
      </View>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.medium,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  optionsContainer: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  recommendedContainer: {
    paddingBottom: spacing.sm,
  },
  recommendedItem: {
    width: 200,
    backgroundColor: colors.background.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginRight: spacing.md,
  },
  recommendedIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  recommendedDuration: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  recommendedDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  meditationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  meditationItem: {
    width: '48%',
    backgroundColor: colors.background.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  meditationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  meditationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  meditationDuration: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  sessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  sessionTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  breathingAnimation: {
    marginBottom: spacing.xl,
  },
  instructionContainer: {
    backgroundColor: colors.background.medium,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  endButton: {
    marginTop: spacing.xl,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  completedIconContainer: {
    marginBottom: spacing.lg,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  completedSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  moodSelector: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    width: 80,
  },
  selectedMood: {
    borderColor: colors.primary,
    backgroundColor: colors.background.medium,
  },
  moodText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  doneButton: {
    width: '50%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background.dark,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.medium,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    padding: spacing.md,
  },
  settingItem: {
    marginBottom: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    width: 30,
    textAlign: 'center',
    fontSize: 16,
    color: colors.text.primary,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  saveButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});

export default MeditationScreen;
