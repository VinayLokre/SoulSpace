import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import StarryBackground from '../components/StarryBackground';
import GlowingButton from '../components/GlowingButton';
import { colors, spacing, borderRadius } from '../utils/theme';
import { useAuth } from '../context/AuthContext';

// Define the questions for the personality quest
const QUESTIONS = [
  {
    id: 1,
    question: "How would you describe your emotional state most days?",
    options: [
      { id: 'a', text: "Calm and balanced" },
      { id: 'b', text: "Energetic and excited" },
      { id: 'c', text: "Thoughtful and introspective" },
      { id: 'd', text: "It varies widely day to day" },
    ]
  },
  {
    id: 2,
    question: "When you're feeling stressed, what helps you most?",
    options: [
      { id: 'a', text: "Quiet time alone" },
      { id: 'b', text: "Talking with friends" },
      { id: 'c', text: "Physical activity" },
      { id: 'd', text: "Creative expression" },
    ]
  },
  {
    id: 3,
    question: "What time of day do you feel most energized?",
    options: [
      { id: 'a', text: "Early morning" },
      { id: 'b', text: "Mid-day" },
      { id: 'c', text: "Evening" },
      { id: 'd', text: "Late night" },
    ]
  },
  {
    id: 4,
    question: "Which of these activities brings you the most joy?",
    options: [
      { id: 'a', text: "Reading or learning" },
      { id: 'b', text: "Spending time in nature" },
      { id: 'c', text: "Social gatherings" },
      { id: 'd', text: "Creative pursuits" },
    ]
  },
  {
    id: 5,
    question: "How would you like SoulSpace to help you most?",
    options: [
      { id: 'a', text: "Manage stress and anxiety" },
      { id: 'b', text: "Improve focus and productivity" },
      { id: 'c', text: "Better understand my emotions" },
      { id: 'd', text: "Find more joy and meaning" },
    ]
  },
];

const PersonalityQuestScreen = () => {
  const navigation = useNavigation();
  const { completePersonalityQuest } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const scrollViewRef = useRef(null);
  const { width } = Dimensions.get('window');

  // Handle selecting an answer
  const handleSelectOption = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
    
    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        goToNextQuestion();
      }
    }, 300);
  };

  // Go to the next question
  const goToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    scrollToQuestion(nextIndex);
  };

  // Skip the current question
  const skipQuestion = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      goToNextQuestion();
    }
  };

  // Scroll to a specific question
  const scrollToQuestion = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  };

  // Handle completing the quest
  const handleComplete = async () => {
    // Save answers (in a real app, you would process these)
    console.log('Personality quest answers:', answers);
    
    // Mark the quest as completed
    await completePersonalityQuest();
    
    // Navigate to the home screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <StarryBackground>
      <View style={styles.container}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {QUESTIONS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentQuestionIndex && styles.activeProgressDot
              ]}
            />
          ))}
        </View>

        {/* Questions */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.questionsContainer}
        >
          {QUESTIONS.map((question, index) => (
            <View key={question.id} style={[styles.questionContainer, { width }]}>
              <Text style={styles.questionText}>{question.question}</Text>
              
              <View style={styles.optionsContainer}>
                {question.options.map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      answers[question.id] === option.id && styles.selectedOption
                    ]}
                    onPress={() => handleSelectOption(question.id, option.id)}
                  >
                    <Text style={[
                      styles.optionText,
                      answers[question.id] === option.id && styles.selectedOptionText
                    ]}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Navigation buttons */}
        <View style={styles.navigationContainer}>
          {currentQuestionIndex < QUESTIONS.length - 1 ? (
            <GlowingButton
              title="Skip"
              onPress={skipQuestion}
              variant="outline"
              size="small"
              style={styles.skipButton}
            />
          ) : (
            <GlowingButton
              title="Submit"
              onPress={handleComplete}
              style={styles.submitButton}
              glowColor={colors.neon.green}
            />
          )}
        </View>
      </View>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.background.medium,
    marginHorizontal: 5,
  },
  activeProgressDot: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
  },
  questionsContainer: {
    flex: 1,
  },
  questionContainer: {
    padding: spacing.lg,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: colors.background.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.background.light,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryGlow,
  },
  optionText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  navigationContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  skipButton: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginBottom: spacing.md,
  },
});

export default PersonalityQuestScreen;
