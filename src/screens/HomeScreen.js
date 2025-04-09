import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../utils/theme';
import StarryBackground from '../components/StarryBackground';
import MoodSelector from '../components/MoodSelector';
import GlowingButton from '../components/GlowingButton';
import { useAuth } from '../context/AuthContext';
import { getJournalStats } from '../services/journalService';
import { getMeditationStats } from '../services/meditationService';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  // State variables
  const [selectedMood, setSelectedMood] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [journalStats, setJournalStats] = useState(null);
  const [meditationStats, setMeditationStats] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let greetingText = '';

    if (hour < 12) {
      greetingText = 'Good morning';
    } else if (hour < 18) {
      greetingText = 'Good afternoon';
    } else {
      greetingText = 'Good evening';
    }

    if (user) {
      greetingText += `, ${user.name.split(' ')[0]}`;
    }

    setGreeting(greetingText);

    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Load stats
    loadStats();
  }, []);

  // Load journal and meditation stats
  const loadStats = async () => {
    try {
      const jStats = await getJournalStats();
      const mStats = await getMeditationStats();

      setJournalStats(jStats);
      setMeditationStats(mStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  // Navigate to a specific screen
  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <StarryBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.welcomeText}>Welcome to your safe space</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => setShowProfileModal(true)}>
              <Ionicons name="person-circle-outline" size={32} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Mood Selector */}
          <MoodSelector
            onSelectMood={handleMoodSelect}
            selectedMood={selectedMood}
            style={styles.moodSelector}
          />

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => navigateTo('AI Companion')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
                  <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Talk to AI</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => navigateTo('Journal')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="book" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Journal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => navigateTo('Meditation')}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.accent }]}>
                  <Ionicons name="moon" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Meditate</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Journal Entries</Text>
                <Text style={styles.statValue}>{journalStats?.totalEntries || 0}</Text>
                {journalStats?.streakDays > 0 && (
                  <Text style={styles.statSubtext}>
                    {journalStats.streakDays} day streak
                  </Text>
                )}
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statTitle}>Meditation</Text>
                <Text style={styles.statValue}>{meditationStats?.totalSessions || 0}</Text>
                <Text style={styles.statSubtext}>
                  {meditationStats?.totalMinutes || 0} minutes total
                </Text>
              </View>
            </View>
          </View>

          {/* Mood-based Recommendation */}
          {selectedMood && (
            <View style={styles.recommendationContainer}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <View style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>
                  {selectedMood === 'anxious'
                    ? 'Calm Your Mind'
                    : selectedMood === 'sad'
                    ? 'Uplift Your Mood'
                    : selectedMood === 'angry'
                    ? 'Find Your Center'
                    : selectedMood === 'tired'
                    ? 'Restore Your Energy'
                    : 'Enhance Your Wellbeing'}
                </Text>
                <Text style={styles.recommendationText}>
                  {selectedMood === 'anxious'
                    ? 'Try a breathing exercise to reduce anxiety and find calm.'
                    : selectedMood === 'sad'
                    ? 'Journal about three things you appreciate right now.'
                    : selectedMood === 'angry'
                    ? 'A short meditation can help release tension and frustration.'
                    : selectedMood === 'tired'
                    ? 'A quick energizing breathing practice might help restore your energy.'
                    : 'Maintain your positive state with a gratitude practice.'}
                </Text>
                <GlowingButton
                  title={
                    selectedMood === 'anxious' || selectedMood === 'angry' || selectedMood === 'tired'
                      ? 'Start Meditation'
                      : 'Open Journal'
                  }
                  onPress={() =>
                    navigateTo(
                      selectedMood === 'anxious' || selectedMood === 'angry' || selectedMood === 'tired'
                        ? 'Meditation'
                        : 'Journal'
                    )
                  }
                  size="small"
                  style={styles.recommendationButton}
                />
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowProfileModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileContent}>
              <View style={styles.profileInfo}>
                <Ionicons name="person-circle" size={60} color={colors.primary} />
                <Text style={styles.profileName}>{user?.name || 'Guest User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'guest@soulspace.app'}</Text>
              </View>
              <TouchableOpacity style={styles.profileOption}>
                <Ionicons name="settings-outline" size={24} color={colors.text.primary} />
                <Text style={styles.optionText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileOption}>
                <Ionicons name="help-circle-outline" size={24} color={colors.text.primary} />
                <Text style={styles.optionText}>Help & Support</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                <Ionicons name="log-out-outline" size={24} color={colors.status.error} />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  profileButton: {
    padding: spacing.xs,
  },
  moodSelector: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionsContainer: {
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  actionText: {
    fontSize: 14,
    color: colors.text.primary,
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.background.medium,
    borderRadius: 12,
    padding: spacing.md,
    width: '48%',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  recommendationContainer: {
    marginBottom: spacing.lg,
  },
  recommendationCard: {
    backgroundColor: colors.background.medium,
    borderRadius: 12,
    padding: spacing.lg,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  recommendationButton: {
    alignSelf: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileModal: {
    width: '80%',
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
  profileContent: {
    padding: spacing.md,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.medium,
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  logoutText: {
    fontSize: 16,
    color: colors.status.error,
    marginLeft: spacing.md,
  },
});

export default HomeScreen;
