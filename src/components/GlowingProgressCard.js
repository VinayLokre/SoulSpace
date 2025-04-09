import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { typography, effects, colors } from '../utils/theme';

const GlowingProgressCard = ({
  title,
  value,
  icon,
  unit = '',
  gradientColors,
  glowColor,
  animation = 'fadeInUp',
  delay = 0,
  style,
}) => {
  // Use provided glowColor or default from theme
  const cardGlowColor = glowColor || colors.neon.blue;

  // Default gradient colors if not provided
  const defaultGradient = [
    'rgba(30, 30, 60, 0.8)',
    'rgba(20, 20, 40, 0.9)',
  ];

  // Use static styles
  const styles = styles_static;

  return (
    <Animatable.View
      animation={animation}
      duration={800}
      delay={delay}
      style={[
        styles.container,
        {
          shadowColor: cardGlowColor,
          ...Platform.select({
            ios: {
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 10,
            },
            android: {
              elevation: 6,
            },
          }),
        },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors || defaultGradient}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={3000}
          >
            <Ionicons
              name={icon}
              size={28}
              color={cardGlowColor}
              style={styles.icon}
            />
          </Animatable.View>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.valueContainer}>
            <Animatable.Text
              animation="fadeIn"
              duration={1000}
              delay={delay + 300}
              style={[
                styles.value,
                { color: cardGlowColor, textShadowColor: cardGlowColor },
              ]}
            >
              {value}
            </Animatable.Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </View>
        </View>
      </LinearGradient>
    </Animatable.View>
  );
};

// Static styles
const styles_static = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    margin: 8,
    flex: 1,
    minWidth: 150,
  },
  gradient: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    textShadowColor: colors.neon.blue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.body,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.heading,
    fontWeight: typography.fontWeights.bold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  unit: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginLeft: 4,
    fontFamily: typography.fontFamily.body,
  },
});

export default GlowingProgressCard;
