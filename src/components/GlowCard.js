import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { effects, colors } from '../utils/theme';

const GlowCard = ({
  children,
  style,
  gradientColors,
  glowColor,
  onPress,
  animation = 'fadeIn',
  duration = 800,
  delay = 0,
  borderWidth = 1,
  borderColor = 'rgba(255, 255, 255, 0.1)',
}) => {
  // Use provided glowColor or default from theme
  const cardGlowColor = glowColor || colors.neon.purple;

  // Default gradient colors if not provided
  const defaultGradient = [
    'rgba(20, 20, 40, 0.8)',
    'rgba(30, 30, 60, 0.8)',
  ];

  // Determine if card is pressable
  const isCardPressable = !!onPress;

  // Card content
  const cardContent = (
    <LinearGradient
      colors={gradientColors || defaultGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradient,
        { borderWidth, borderColor },
      ]}
    >
      {children}
    </LinearGradient>
  );

  return (
    <Animatable.View
      animation={animation}
      duration={duration}
      delay={delay}
      style={[
        styles.container,
        {
          shadowColor: cardGlowColor,
          ...Platform.select({
            ios: {
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
            },
            android: {
              elevation: 4,
            },
          }),
        },
        style,
      ]}
    >
      {isCardPressable ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          style={styles.touchable}
        >
          {cardContent}
        </TouchableOpacity>
      ) : (
        cardContent
      )}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    margin: 8,
  },
  touchable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 8,
    overflow: 'hidden',
    padding: 16,
  },
});

export default GlowCard;
