import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { colors } from '../utils/theme';

const { width, height } = Dimensions.get('window');

// Star component with random size, position, and opacity
const Star = ({ size, top, left, animated = false, color = '#FFFFFF' }) => {
  const opacity = React.useRef(new Animated.Value(0.1 + Math.random() * 0.9)).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  const animationRef = React.useRef(null);

  useEffect(() => {
    if (animated) {
      // Create a twinkling effect with scaling
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0.1 + Math.random() * 0.5,
              duration: 1000 + Math.random() * 3000,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.8,
              duration: 1000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0.5 + Math.random() * 0.5,
              duration: 1000 + Math.random() * 3000,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.2,
              duration: 1000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ]),
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
  }, [animated, opacity, scale]);

  // Determine if this is a special star (larger with glow)
  const isSpecialStar = size > 2.5;

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          top,
          left,
          opacity,
          backgroundColor: color,
          transform: [{ scale }],
          shadowColor: color,
          shadowOpacity: isSpecialStar ? 0.8 : 0,
          shadowRadius: isSpecialStar ? 5 : 0,
          elevation: isSpecialStar ? 3 : 0,
        },
      ]}
    />
  );
};

// Generate a random number of stars
const generateStars = (count, animated = false) => {
  // Reduce the number of stars on Android to improve performance
  const adjustedCount = Platform.OS === 'android' ? Math.floor(count * 0.6) : count;

  // Star colors with probability weights
  const starColors = [
    { color: '#FFFFFF', weight: 0.7 }, // White (most common)
    { color: '#FFD700', weight: 0.1 }, // Gold
    { color: '#00FFFF', weight: 0.1 }, // Cyan
    { color: '#FF69B4', weight: 0.05 }, // Pink
    { color: '#9370DB', weight: 0.05 }, // Purple
  ];

  // Function to select a random color based on weights
  const getRandomStarColor = () => {
    const totalWeight = starColors.reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const { color, weight } of starColors) {
      if (random < weight) return color;
      random -= weight;
    }

    return '#FFFFFF'; // Default fallback
  };

  const stars = [];
  for (let i = 0; i < adjustedCount; i++) {
    const size = 1 + Math.random() * 3;
    const color = getRandomStarColor();

    stars.push(
      <Star
        key={i}
        size={size}
        top={Math.random() * height}
        left={Math.random() * width}
        animated={animated}
        color={color}
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
  const [starWidth, setStarWidth] = useState(100);
  const animationRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  // Random color for the shooting star
  const [starColor] = useState(() => {
    const colors = ['#FFFFFF', '#00FFFF', '#FFD700', '#FF69B4'];
    return colors[Math.floor(Math.random() * colors.length)];
  });

  useEffect(() => {
    // Start the animation after the specified delay
    timeoutRef.current = setTimeout(() => {
      // Randomize the starting position
      const startX = Math.random() * width;
      const startY = Math.random() * (height / 3);

      // Randomize the distance and angle
      const distance = 300 + Math.random() * 200;
      const angle = 30 + Math.random() * 30; // Between 30 and 60 degrees
      const radians = (angle * Math.PI) / 180;

      // Calculate end position based on angle
      const endX = startX + distance * Math.cos(radians);
      const endY = startY + distance * Math.sin(radians);

      // Set the initial position
      translateX.setValue(startX);
      translateY.setValue(startY);

      // Set the width directly (not animated)
      setStarWidth(150 + Math.random() * 50);

      // Animate the shooting star position and opacity
      animationRef.current = Animated.parallel([
        Animated.timing(translateX, {
          toValue: endX,
          duration: 1000 + Math.random() * 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: endY,
          duration: 1000 + Math.random() * 500,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.8,
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
          width: starWidth,
          backgroundColor: starColor,
          shadowColor: starColor,
          shadowOpacity: 0.8,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
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

// Nebula cloud component for additional space atmosphere
const NebulaCloud = ({ top, left, size, color, opacity }) => {
  return (
    <Animatable.View
      animation="pulse"
      iterationCount="infinite"
      duration={8000 + Math.random() * 4000}
      style={[
        styles.nebulaCloud,
        {
          top,
          left,
          width: size,
          height: size,
          backgroundColor: color,
          opacity,
          borderRadius: 8,
        },
      ]}
    />
  );
};

// Generate nebula clouds
const generateNebulaClouds = (count) => {
  // Reduce count on Android for performance
  const adjustedCount = Platform.OS === 'android' ? Math.min(count, 3) : count;

  const nebulaColors = [
    colors.neon.purple + '40', // Purple with 25% opacity
    colors.neon.blue + '30',   // Blue with 19% opacity
    colors.neon.pink + '25',   // Pink with 15% opacity
  ];

  const clouds = [];
  for (let i = 0; i < adjustedCount; i++) {
    const size = 100 + Math.random() * 200;
    clouds.push(
      <NebulaCloud
        key={i}
        top={Math.random() * height}
        left={Math.random() * width}
        size={size}
        color={nebulaColors[i % nebulaColors.length]}
        opacity={0.1 + Math.random() * 0.2}
      />
    );
  }
  return clouds;
};

// Main StarryBackground component
const StarryBackground = ({ children, gradientColors, animated = true }) => {
  // Use provided gradient colors or default to space gradient
  const bgColors = gradientColors || colors.gradients.cosmos;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bgColors}
        style={styles.gradient}
      >
        {/* Nebula clouds for depth */}
        {animated && generateNebulaClouds(5)}

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
  nebulaCloud: {
    position: 'absolute',
    backgroundColor: 'rgba(128, 0, 128, 0.1)',
    borderRadius: 8,
    zIndex: 0,
    // Apply blur effect
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default StarryBackground;
