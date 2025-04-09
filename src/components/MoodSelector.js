import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../utils/theme';

// Mood options with icons and colors
const MOOD_OPTIONS = [
  {
    id: 'happy',
    label: 'Happy',
    icon: 'sunny-outline',
    color: colors.mood.happy,
  },
  {
    id: 'calm',
    label: 'Calm',
    icon: 'water-outline',
    color: colors.mood.calm,
  },
  {
    id: 'anxious',
    label: 'Anxious',
    icon: 'thunderstorm-outline',
    color: colors.mood.anxious,
  },
  {
    id: 'sad',
    label: 'Sad',
    icon: 'rainy-outline',
    color: colors.mood.sad,
  },
  {
    id: 'angry',
    label: 'Angry',
    icon: 'flame-outline',
    color: colors.mood.angry,
  },
  {
    id: 'tired',
    label: 'Tired',
    icon: 'moon-outline',
    color: colors.mood.tired,
  },
];

const MoodSelector = ({ onSelectMood, selectedMood, style }) => {
  // Animation values for each mood option
  const scaleValues = MOOD_OPTIONS.reduce((acc, mood) => {
    acc[mood.id] = new Animated.Value(1);
    return acc;
  }, {});

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    // Animate the selected mood
    Animated.sequence([
      Animated.timing(scaleValues[mood.id], {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValues[mood.id], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the onSelectMood callback
    onSelectMood(mood.id);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.moodGrid}>
        {MOOD_OPTIONS.map((mood) => (
          <Animated.View
            key={mood.id}
            style={[
              styles.moodItemContainer,
              {
                transform: [{ scale: scaleValues[mood.id] }],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.moodItem,
                {
                  backgroundColor: selectedMood === mood.id ? mood.color : colors.background.medium,
                  borderColor: mood.color,
                },
              ]}
              onPress={() => handleMoodSelect(mood)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={mood.icon}
                size={28}
                color={selectedMood === mood.id ? '#FFFFFF' : mood.color}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.moodLabel,
                {
                  color: selectedMood === mood.id ? mood.color : colors.text.secondary,
                  fontWeight: selectedMood === mood.id ? '600' : '400',
                },
              ]}
            >
              {mood.label}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: -spacing.xs,
  },
  moodItemContainer: {
    width: '33%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moodItem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MoodSelector;
