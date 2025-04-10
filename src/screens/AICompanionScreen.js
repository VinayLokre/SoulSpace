import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../utils/theme';
import StarryBackground from '../components/StarryBackground';
import ChatInterface from '../components/ChatInterface';
import GlowingButton from '../components/GlowingButton';
import BackButton from '../components/BackButton';
import {
  AI_PERSONALITIES,
  getAISettings,
  setAIPersonality,
  toggleSpeech,
  toggleOfflineMode,
} from '../ai/aiManager';

const AICompanionScreen = () => {
  // State variables
  const [personality, setPersonality] = useState(AI_PERSONALITIES.LISTENER);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load AI settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getAISettings();
        setPersonality(settings.personality);
        setSpeechEnabled(settings.speechEnabled);
        setOfflineMode(settings.offlineMode);
      } catch (error) {
        console.error('Error loading AI settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Handle personality change
  const handlePersonalityChange = async (newPersonality) => {
    setPersonality(newPersonality);
    await setAIPersonality(newPersonality);
  };

  // Handle speech toggle
  const handleSpeechToggle = async (value) => {
    setSpeechEnabled(value);
    await toggleSpeech(value);
  };

  // Handle offline mode toggle
  const handleOfflineModeToggle = async (value) => {
    setOfflineMode(value);
    await toggleOfflineMode(value);
  };

  // Get personality display name
  const getPersonalityDisplayName = (personalityKey) => {
    switch (personalityKey) {
      case AI_PERSONALITIES.LISTENER:
        return 'Listener';
      case AI_PERSONALITIES.MOTIVATOR:
        return 'Motivator';
      case AI_PERSONALITIES.FUNNY:
        return 'Funny';
      default:
        return 'Listener';
    }
  };

  // Get personality description
  const getPersonalityDescription = (personalityKey) => {
    switch (personalityKey) {
      case AI_PERSONALITIES.LISTENER:
        return 'Calm and supportive. Focuses on understanding your feelings and providing a safe space.';
      case AI_PERSONALITIES.MOTIVATOR:
        return 'Uplifting and energetic. Helps you find motivation and overcome challenges.';
      case AI_PERSONALITIES.FUNNY:
        return 'Light-hearted and humorous. Uses gentle humor to brighten your mood.';
      default:
        return '';
    }
  };

  return (
    <StarryBackground>
      <View style={styles.container}>
        {/* Header with settings button */}
        <View style={styles.header}>
          <BackButton style={styles.backButton} />
          <Text style={styles.headerTitle}>
            AI Companion: {getPersonalityDisplayName(personality)}
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Chat Interface */}
        <ChatInterface aiPersonality={personality} />

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>AI Companion Settings</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowSettings(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Personality Selection */}
                <Text style={styles.sectionTitle}>Personality</Text>
                <Text style={styles.sectionDescription}>
                  Choose how your AI companion responds to you
                </Text>

                <View style={styles.personalityOptions}>
                  {Object.values(AI_PERSONALITIES).map((personalityKey) => (
                    <TouchableOpacity
                      key={personalityKey}
                      style={[
                        styles.personalityOption,
                        personality === personalityKey && styles.selectedPersonality,
                      ]}
                      onPress={() => handlePersonalityChange(personalityKey)}
                    >
                      <View style={styles.personalityHeader}>
                        <Text style={styles.personalityName}>
                          {getPersonalityDisplayName(personalityKey)}
                        </Text>
                        {personality === personalityKey && (
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        )}
                      </View>
                      <Text style={styles.personalityDescription}>
                        {getPersonalityDescription(personalityKey)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Voice Settings */}
                <Text style={styles.sectionTitle}>Voice Settings</Text>
                <View style={styles.settingItem}>
                  <View>
                    <Text style={styles.settingLabel}>Text-to-Speech</Text>
                    <Text style={styles.settingDescription}>
                      Allow AI to speak responses out loud
                    </Text>
                  </View>
                  <Switch
                    value={speechEnabled}
                    onValueChange={handleSpeechToggle}
                    trackColor={{ false: colors.background.light, true: colors.primary }}
                    thumbColor={speechEnabled ? colors.text.primary : colors.text.secondary}
                  />
                </View>

                {/* Offline Mode */}
                <Text style={styles.sectionTitle}>Connection</Text>
                <View style={styles.settingItem}>
                  <View>
                    <Text style={styles.settingLabel}>Offline Mode</Text>
                    <Text style={styles.settingDescription}>
                      Use simplified AI responses without internet connection
                    </Text>
                  </View>
                  <Switch
                    value={offlineMode}
                    onValueChange={handleOfflineModeToggle}
                    trackColor={{ false: colors.background.light, true: colors.primary }}
                    thumbColor={offlineMode ? colors.text.primary : colors.text.secondary}
                  />
                </View>

                {/* Close Button */}
                <GlowingButton
                  title="Save Settings"
                  onPress={() => setShowSettings(false)}
                  style={styles.saveButton}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    paddingVertical: spacing.md,
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
  backButton: {
    marginRight: spacing.sm,
    marginLeft: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
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
    borderRadius: 8,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  personalityOptions: {
    marginBottom: spacing.lg,
  },
  personalityOption: {
    backgroundColor: colors.background.medium,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedPersonality: {
    borderColor: colors.primary,
  },
  personalityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  personalityName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  personalityDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.medium,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    maxWidth: '80%',
  },
  saveButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});

export default AICompanionScreen;
