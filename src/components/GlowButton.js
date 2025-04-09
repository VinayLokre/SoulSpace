import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { typography, effects, animation, colors } from '../utils/theme';

// Define animations
const pulseAnimation = {
  0: {
    scale: 1,
  },
  0.5: {
    scale: 1.05,
  },
  1: {
    scale: 1,
  },
};

const GlowButton = ({
  title,
  onPress,
  style,
  textStyle,
  gradientColors,
  size = 'medium',
  glowColor,
  animated = true,
  icon,
  disabled = false,
}) => {
  // Use provided glowColor or default from theme
  const buttonGlowColor = glowColor || colors.neon.purple;

  // Use static styles
  const styles = styles_static;

  // State to track press
  const [isPressed, setIsPressed] = useState(false);

  // Animation value for glow effect
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  // Handle press in
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  // Handle press out
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Default gradient colors if not provided
  const defaultGradient = [
    colors.primary,
    colors.secondary,
  ];

  // Size styles
  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: typography.fontSizes.sm,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      fontSize: typography.fontSizes.md,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      fontSize: typography.fontSizes.lg,
    },
  };

  // Calculate glow shadow based on animation
  const glowShadow = {
    shadowColor: buttonGlowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: Animated.add(0.5, Animated.multiply(glowAnim, 0.5)),
    shadowRadius: Animated.add(5, Animated.multiply(glowAnim, 10)),
    elevation: isPressed ? 8 : 4,
  };

  return (
    <Animatable.View
      animation={animated ? 'fadeIn' : undefined}
      duration={800}
      style={[styles.container, style]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View style={[styles.buttonShadow, glowShadow]}>
          <Animatable.View
            animation={animated ? pulseAnimation : undefined}
            iterationCount="infinite"
            duration={3000}
            style={styles.animatedContainer}
          >
            <LinearGradient
              colors={gradientColors || defaultGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.button,
                sizeStyles[size],
                disabled && styles.disabled,
              ]}
            >
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text
                style={[
                  styles.text,
                  { fontSize: sizeStyles[size].fontSize },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </LinearGradient>
          </Animatable.View>
        </Animated.View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

// Static styles
const styles_static = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonShadow: {
    borderRadius: 8,
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
  animatedContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  text: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.accent,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  iconContainer: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default GlowButton;
