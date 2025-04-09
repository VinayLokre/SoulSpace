import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/theme';

const { width, height } = Dimensions.get('window');

// Star component with random size, position, and opacity
const Star = ({ size, top, left, animated = false }) => {
  const opacity = React.useRef(new Animated.Value(0.1 + Math.random() * 0.9)).current;
  const animationRef = React.useRef(null);

  useEffect(() => {
    if (animated) {
      // Create a twinkling effect
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.1 + Math.random() * 0.5,
            duration: 1000 + Math.random() * 3000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5 + Math.random() * 0.5,
            duration: 1000 + Math.random() * 3000,
            useNativeDriver: true,
          }),
        ])
      );

      animationRef.current.start();
    }

    // Cleanup function to stop animations when component unmounts
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [animated, opacity]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          // Removed all borderRadius properties
          top,
          left,
          opacity,
        },
      ]}
    />
  );
};

// Generate a random number of stars
const generateStars = (count, animated = false) => {
  // Reduce the number of stars on Android to improve performance
  const adjustedCount = Platform.OS === 'android' ? Math.floor(count * 0.6) : count;

  const stars = [];
  for (let i = 0; i < adjustedCount; i++) {
    const size = 1 + Math.random() * 3;
    stars.push(
      <Star
        key={i}
        size={size}
        top={Math.random() * height}
        left={Math.random() * width}
        animated={animated}
      />
    );
  }
  return stars;
};

// Shooting star component
const ShootingStar = ({ delay }) => {
  const translateX = React.useRef(new Animated.Value(-100)).current;
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const animationRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  useEffect(() => {
    // Start the animation after the specified delay
    timeoutRef.current = setTimeout(() => {
      // Randomize the starting position
      const startX = Math.random() * width;
      const startY = Math.random() * (height / 3);

      // Set the initial position
      translateX.setValue(startX);
      translateY.setValue(startY);

      // Animate the shooting star
      animationRef.current = Animated.parallel([
        Animated.timing(translateX, {
          toValue: startX + 300,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: startY + 300,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]);

      animationRef.current.start();
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [delay, translateX, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.shootingStar,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { rotate: '45deg' },
          ],
        },
      ]}
    />
  );
};

// Generate shooting stars with random delays
const generateShootingStars = (count) => {
  // Reduce the number of shooting stars on Android
  const adjustedCount = Platform.OS === 'android' ? Math.min(count, 2) : count;

  const shootingStars = [];
  for (let i = 0; i < adjustedCount; i++) {
    shootingStars.push(
      <ShootingStar key={i} delay={2000 + Math.random() * 15000} />
    );
  }
  return shootingStars;
};

// Main StarryBackground component
const StarryBackground = ({ children, gradientColors, animated = true }) => {
  // Use provided gradient colors or default to space gradient
  const bgColors = gradientColors || colors.gradients.space;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bgColors}
        style={styles.gradient}
      >
        {/* Static stars */}
        {generateStars(100, false)}

        {/* Animated twinkling stars */}
        {animated && generateStars(50, true)}

        {/* Shooting stars */}
        {animated && generateShootingStars(5)}

        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  shootingStar: {
    position: 'absolute',
    width: 100,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default StarryBackground;
