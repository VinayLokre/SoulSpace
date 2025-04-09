import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { spacing, typography, effects, animation, colors } from '../utils/theme';
import StarryBackground from '../components/StarryBackground';
import GlowingMoodSelector from '../components/GlowingMoodSelector';
import GlowButton from '../components/GlowButton';
import GlowingActionButton from '../components/GlowingActionButton';
import GlowingProgressCard from '../components/GlowingProgressCard';
import GlowCard from '../components/GlowCard';
import { useAuth } from '../context/AuthContext';
import { getJournalStats } from '../services/journalService';
import { getMeditationStats } from '../services/meditationService';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  // Use static colors
  const currentMood = null;

  // State variables
  const [selectedMood, setSelectedMood] = useState(currentMood);
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
    // We're not changing theme colors anymore
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
          <GlowingMoodSelector
            onMoodSelect={handleMoodSelect}
            initialMood={selectedMood}
            style={styles.moodSelector}
          />

          {/* Quick Actions */}
          <Animatable.View
            animation="fadeIn"
            duration={800}
            delay={300}
            style={styles.actionsContainer}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <GlowingActionButton
                title="Talk to AI"
                icon="chatbubble"
                glowColor={colors.neon.purple}
                onPress={() => navigateTo('AI Companion')}
                animation="fadeInUp"
                delay={400}
                size="medium"
              />

              <GlowingActionButton
                title="Journal"
                icon="book"
                glowColor={colors.neon.blue}
                onPress={() => navigateTo('Journal')}
                animation="fadeInUp"
                delay={500}
                size="medium"
              />

              <GlowingActionButton
                title="Meditate"
                icon="moon"
                glowColor={colors.neon.pink}
                onPress={() => navigateTo('Meditation')}
                animation="fadeInUp"
                delay={600}
                size="medium"
              />
            </View>
          </Animatable.View>

          {/* Stats Section */}
          <Animatable.View
            animation="fadeIn"
            duration={800}
            delay={500}
            style={styles.statsContainer}
          >
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsGrid}>
              <GlowingProgressCard
                title="Journal Entries"
                value={journalStats?.totalEntries || 0}
                icon="book-outline"
                unit={journalStats?.streakDays > 0 ? `${journalStats.streakDays} day streak` : ''}
                glowColor={colors.neon.blue}
                animation="fadeInUp"
                delay={600}
              />

              <GlowingProgressCard
                title="Meditation"
                value={meditationStats?.totalSessions || 0}
                icon="moon-outline"
                unit={`${meditationStats?.totalMinutes || 0} min total`}
                glowColor={colors.neon.pink}
                animation="fadeInUp"
                delay={700}
              />
            </View>
          </Animatable.View>

          {/* Mood-based Recommendation */}
          {selectedMood && (
            <Animatable.View
              animation="fadeIn"
              duration={800}
              delay={800}
              style={styles.recommendationContainer}
            >
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <GlowCard
                glowColor={colors.mood[selectedMood] || colors.neon.purple}
                animation="fadeInUp"
                delay={900}
                borderWidth={1.5}
                borderColor={`${colors.mood[selectedMood]}50` || 'rgba(255, 255, 255, 0.2)'}
                gradientColors={[
                  'rgba(30, 30, 60, 0.8)',
                  'rgba(20, 20, 40, 0.9)',
                ]}
              >
                <View style={styles.recommendationContent}>
                  <Animatable.Text
                    animation="fadeIn"
                    delay={1000}
                    style={[styles.recommendationTitle, { color: colors.mood[selectedMood] || colors.text.primary }]}
                  >
                    {selectedMood === 'anxious'
                      ? 'Calm Your Mind'
                      : selectedMood === 'sad'
                      ? 'Uplift Your Mood'
                      : selectedMood === 'angry'
                      ? 'Find Your Center'
                      : selectedMood === 'tired'
                      ? 'Restore Your Energy'
                      : 'Enhance Your Wellbeing'}
                  </Animatable.Text>
                  <Animatable.Text
                    animation="fadeIn"
                    delay={1100}
                    style={styles.recommendationText}
                  >
                    {selectedMood === 'anxious'
                      ? 'Try a breathing exercise to reduce anxiety and find calm.'
                      : selectedMood === 'sad'
                      ? 'Journal about three things you appreciate right now.'
                      : selectedMood === 'angry'
                      ? 'A short meditation can help release tension and frustration.'
                      : selectedMood === 'tired'
                      ? 'A quick energizing breathing practice might help restore your energy.'
                      : 'Maintain your positive state with a gratitude practice.'}
                  </Animatable.Text>
                  <Animatable.View animation="fadeIn" delay={1200}>
                    <GlowButton
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
                      size="medium"
                      glowColor={colors.mood[selectedMood] || colors.neon.purple}
                      gradientColors={[
                        colors.mood[selectedMood] || colors.primary,
                        selectedMood ? colors.mood[`${selectedMood}Glow`] || colors.secondary : colors.secondary,
                      ]}
                      style={styles.recommendationButton}
                    />
                  </Animatable.View>
                </View>
              </GlowCard>
            </Animatable.View>
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
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  welcomeText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  profileButton: {
    padding: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.neon.purple,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  moodSelector: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  actionsContainer: {
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  actionItem: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
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
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: colors.background.medium,
    borderRadius: 8,
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
  recommendationContent: {
    padding: spacing.sm,
  },
  recommendationCard: {
    backgroundColor: colors.background.medium,
    borderRadius: 8,
    padding: spacing.lg,
  },
  recommendationTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  recommendationText: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeights.relaxed,
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
