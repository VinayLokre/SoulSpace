import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { typography, effects, colors } from '../utils/theme';

const GlowingActionButton = ({
  title,
  icon,
  onPress,
  style,
  glowColor,
  gradientColors,
  animation = 'fadeInUp',
  delay = 0,
  size = 'medium',
}) => {
  // Use provided glowColor or default from theme
  const buttonGlowColor = glowColor || colors.neon.purple;

  // Use static styles
  const styles = styles_static;

  // Animation values - all using the same driver type
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Handle press in
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  // Handle press out
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Default gradient colors if not provided
  const defaultGradient = [
    'rgba(40, 40, 80, 0.8)',
    'rgba(20, 20, 40, 0.9)',
  ];

  // Size styles
  const sizeStyles = {
    small: {
      width: 80,
      height: 80,
      iconSize: 24,
      fontSize: typography.fontSizes.xs,
    },
    medium: {
      width: 100,
      height: 100,
      iconSize: 32,
      fontSize: typography.fontSizes.sm,
    },
    large: {
      width: 120,
      height: 120,
      iconSize: 40,
      fontSize: typography.fontSizes.md,
    },
  };

  // Calculate shadow based on pressed state
  const buttonShadow = {
    shadowColor: buttonGlowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isPressed ? 1.0 : 0.3,
    shadowRadius: isPressed ? 20 : 5,
    elevation: isPressed ? 8 : 4,
  };

  return (
    <Animatable.View
      animation={animation}
      duration={800}
      delay={delay}
      style={[styles.container, style]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.buttonShadow,
            buttonShadow,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View
            style={{
              width: sizeStyles[size].width,
              height: sizeStyles[size].height,
            }}
          >
          <LinearGradient
            colors={gradientColors || defaultGradient}
            style={styles.button}
          >
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={3000}
            >
              <Ionicons
                name={icon}
                size={sizeStyles[size].iconSize}
                color={buttonGlowColor}
                style={styles.icon}
              />
            </Animatable.View>
          </LinearGradient>
          </View>
        </Animated.View>
        <Text style={[
          styles.text,
          { fontSize: sizeStyles[size].fontSize }
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

// Static styles
const styles_static = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 8,
  },
  buttonShadow: {
    borderRadius: 50, // Make it round
    overflow: 'hidden',
    // Shadow properties are now applied dynamically based on press state
  },
  button: {
    borderRadius: 50, // Make it round
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1, // Fill the container
    width: '100%',
    height: '100%',
  },
  icon: {
    textShadowColor: colors.neon.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  text: {
    marginTop: 8,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.body,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default GlowingActionButton;
