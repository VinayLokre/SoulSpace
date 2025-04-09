import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { typography, effects, borderRadius, colors } from '../utils/theme';

// Define mood options with icons
const getMoodOptions = (colors) => [
  {
    id: 'happy',
    icon: 'happy-outline',
    label: 'Happy',
    color: colors.mood.happy,
    glowColor: colors.mood.happyGlow,
  },
  {
    id: 'sad',
    icon: 'sad-outline',
    label: 'Sad',
    color: colors.mood.sad,
    glowColor: colors.mood.sadGlow,
  },
  {
    id: 'anxious',
    icon: 'alert-circle-outline',
    label: 'Anxious',
    color: colors.mood.anxious,
    glowColor: colors.mood.anxiousGlow,
  },
  {
    id: 'angry',
    icon: 'flame-outline',
    label: 'Angry',
    color: colors.mood.angry,
    glowColor: colors.mood.angryGlow,
  },
  {
    id: 'tired',
    icon: 'bed-outline',
    label: 'Tired',
    color: colors.mood.tired,
    glowColor: colors.mood.tiredGlow,
  },
  {
    id: 'calm',
    icon: 'water-outline',
    label: 'Calm',
    color: colors.mood.calm,
    glowColor: colors.mood.calmGlow,
  },
];

// Individual mood button component
const MoodButton = ({ mood, selected, onSelect, index }) => {
  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const [isGlowing, setIsGlowing] = useState(selected);

  // Handle press in
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // Handle press out
  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Update glow when selected state changes
  React.useEffect(() => {
    setIsGlowing(selected);
  }, [selected]);

  // Calculate shadow based on selected state
  const buttonShadow = {
    shadowColor: mood.color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isGlowing ? 1.0 : 0.2,
    shadowRadius: isGlowing ? 15 : 5,
    elevation: isGlowing ? 6 : 2,
  };

  return (
    <Animatable.View
      animation="zoomIn"
      duration={500}
      delay={index * 100}
      style={styles_static.moodButtonContainer}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onSelect(mood.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles_static.moodButtonShadow,
            buttonShadow,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={selected ? [mood.color, mood.glowColor] : ['rgba(40, 40, 60, 0.6)', 'rgba(20, 20, 40, 0.8)']}
            style={[
              styles_static.moodButton,
              selected && { borderColor: mood.color },
            ]}
          >
            <Ionicons
              name={mood.icon}
              size={28}
              color={selected ? '#FFFFFF' : mood.color}
            />
          </LinearGradient>
        </Animated.View>
        <Text style={[
          styles_static.moodLabel,
          selected && { color: mood.color, textShadowColor: mood.color }
        ]}>
          {mood.label}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

// Main mood selector component
const GlowingMoodSelector = ({ onMoodSelect, initialMood = null }) => {
  const [selectedMood, setSelectedMood] = useState(initialMood);
  const [moodOptions, setMoodOptions] = useState([]);

  // Initialize mood options with current theme colors
  useEffect(() => {
    setMoodOptions(getMoodOptions(colors));
  }, [colors]);

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
    if (onMoodSelect) {
      onMoodSelect(moodId);
    }
  };

  // Use static styles
  const styles = styles_static;

  return (
    <Animatable.View
      animation="fadeIn"
      duration={800}
      style={styles.container}
    >
      <Text style={styles.title}>How are you feeling?</Text>
      <View style={styles.moodGrid}>
        {moodOptions.map((mood, index) => (
          <MoodButton
            key={mood.id}
            mood={mood}
            selected={selectedMood === mood.id}
            onSelect={handleMoodSelect}
            index={index}
          />
        ))}
      </View>
    </Animatable.View>
  );
};

// Static styles
const styles_static = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  moodButtonContainer: {
    width: '33%',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodButtonShadow: {
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  moodButton: {
    width: 70,
    height: 70,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  moodLabel: {
    marginTop: 8,
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    fontFamily: typography.fontFamily.body,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default GlowingMoodSelector;
