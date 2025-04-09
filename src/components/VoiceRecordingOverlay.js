import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { colors, typography, spacing } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VoiceRecordingOverlay = ({ isRecording, onStop, voiceLevel = 0 }) => {
  // Animation values for the wave effect
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  
  // Animation for the mic icon
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      // Start wave animations
      Animated.loop(
        Animated.sequence([
          Animated.timing(wave1, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(wave1, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(wave2, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
            delay: 200,
          }),
          Animated.timing(wave2, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(wave3, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
            delay: 400,
          }),
          Animated.timing(wave3, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Pulse animation for the mic icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animations when not recording
      wave1.stopAnimation();
      wave2.stopAnimation();
      wave3.stopAnimation();
      pulseAnim.stopAnimation();
    }

    return () => {
      // Cleanup animations
      wave1.stopAnimation();
      wave2.stopAnimation();
      wave3.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [isRecording, wave1, wave2, wave3, pulseAnim]);

  // Calculate wave sizes based on voice level (0-1)
  const dynamicVoiceLevel = Math.min(1, Math.max(0.3, voiceLevel));
  
  // Interpolate wave opacity and size
  const wave1Opacity = wave1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.3, 0.1],
  });
  
  const wave2Opacity = wave2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.2, 0.1],
  });
  
  const wave3Opacity = wave3.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.05, 0.1, 0.05],
  });

  const wave1Size = wave1.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 120 * dynamicVoiceLevel + 80],
  });
  
  const wave2Size = wave2.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 160 * dynamicVoiceLevel + 100],
  });
  
  const wave3Size = wave3.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 200 * dynamicVoiceLevel + 120],
  });

  if (!isRecording) return null;

  return (
    <Animatable.View 
      style={styles.overlay}
      animation="fadeIn"
      duration={300}
    >
      <View style={styles.container}>
        {/* Wave animations */}
        <Animated.View
          style={[
            styles.wave,
            {
              width: wave3Size,
              height: wave3Size,
              borderRadius: wave3Size,
              opacity: wave3Opacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            {
              width: wave2Size,
              height: wave2Size,
              borderRadius: wave2Size,
              opacity: wave2Opacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.wave,
            {
              width: wave1Size,
              height: wave1Size,
              borderRadius: wave1Size,
              opacity: wave1Opacity,
            },
          ]}
        />

        {/* Central button */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.buttonContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={onStop}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="mic" size={36} color="#FFFFFF" />
            </Animated.View>
          </TouchableOpacity>
        </LinearGradient>

        {/* Listening text */}
        <Animatable.Text
          style={styles.listeningText}
          animation="pulse"
          iterationCount="infinite"
          duration={1500}
        >
          Listening...
        </Animatable.Text>

        {/* Stop button */}
        <TouchableOpacity
          style={styles.stopButton}
          onPress={onStop}
          activeOpacity={0.8}
        >
          <Text style={styles.stopText}>Tap to Stop</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  wave: {
    position: 'absolute',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: `${colors.primary}50`,
  },
  buttonContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  button: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listeningText: {
    marginTop: 30,
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.heading,
    color: colors.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  stopButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stopText: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.body,
  },
});

export default VoiceRecordingOverlay;
