import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing } from '../utils/theme';

const BreathingAnimation = ({
  inhaleTime = 4,
  holdTime = 2,
  exhaleTime = 6,
  holdAfterExhaleTime = 0,
  cycles = -1, // -1 for infinite
  onComplete,
  style,
}) => {
  // Animation values
  const circleScale = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  // State for tracking current phase and cycle
  const [phase, setPhase] = useState('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [instruction, setInstruction] = useState('Breathe In');

  // Refs to track animation and mounted state
  const animationRef = useRef(null);
  const isMountedRef = useRef(true);

  // Function to create and run the animation for the current phase
  const runPhaseAnimation = useCallback(() => {
    // Only start if we haven't reached the cycle limit and component is mounted
    if (!isMountedRef.current || (cycles !== -1 && cycleCount >= cycles)) {
      if (onComplete && isMountedRef.current) {
        onComplete();
      }
      return;
    }

    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    let animationSequence;

    // Define the animation sequence based on the current phase
    switch (phase) {
      case 'inhale':
        setInstruction('Breathe In');
        animationSequence = Animated.parallel([
          Animated.timing(circleScale, {
            toValue: 1.5,
            duration: inhaleTime * 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.7,
            duration: inhaleTime * 1000,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'hold':
        setInstruction('Hold');
        animationSequence = Animated.timing(textOpacity, {
          toValue: 0.7,
          duration: holdTime * 1000,
          useNativeDriver: true,
        });
        break;

      case 'exhale':
        setInstruction('Breathe Out');
        animationSequence = Animated.parallel([
          Animated.timing(circleScale, {
            toValue: 1,
            duration: exhaleTime * 1000,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.3,
            duration: exhaleTime * 1000,
            useNativeDriver: true,
          }),
        ]);
        break;

      case 'holdAfterExhale':
        setInstruction('Rest');
        animationSequence = Animated.timing(textOpacity, {
          toValue: 0.5,
          duration: holdAfterExhaleTime * 1000,
          useNativeDriver: true,
        });
        break;

      default:
        break;
    }

    // Start the animation and set up the next phase
    if (animationSequence && isMountedRef.current) {
      // Store the animation reference
      animationRef.current = animationSequence;

      animationSequence.start(({ finished }) => {
        if (finished && isMountedRef.current) {
          // Move to the next phase
          switch (phase) {
            case 'inhale':
              setPhase(holdTime > 0 ? 'hold' : 'exhale');
              break;
            case 'hold':
              setPhase('exhale');
              break;
            case 'exhale':
              if (holdAfterExhaleTime > 0) {
                setPhase('holdAfterExhale');
              } else {
                setPhase('inhale');
                setCycleCount(prev => prev + 1);
              }
              break;
            case 'holdAfterExhale':
              setPhase('inhale');
              setCycleCount(prev => prev + 1);
              break;
            default:
              break;
          }
        }
      });
    }
  }, [
    phase,
    cycleCount,
    cycles,
    inhaleTime,
    holdTime,
    exhaleTime,
    holdAfterExhaleTime,
    circleScale,
    opacityValue,
    textOpacity,
    onComplete,
  ]);

  // Run the animation when phase changes
  useEffect(() => {
    runPhaseAnimation();
  }, [runPhaseAnimation, phase]);

  // Set up and clean up
  useEffect(() => {
    // Reset values on mount
    setPhase('inhale');
    setCycleCount(0);

    // Mark as mounted
    isMountedRef.current = true;

    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.breathCircle,
          {
            transform: [{ scale: circleScale }],
            opacity: opacityValue,
          },
        ]}
      />
      <Animated.Text
        style={[
          styles.instructionText,
          {
            opacity: textOpacity,
          },
        ]}
      >
        {instruction}
      </Animated.Text>
      {cycles !== -1 && (
        <Text style={styles.cycleText}>
          Cycle {cycleCount + 1} of {cycles}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  breathCircle: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  cycleText: {
    marginTop: spacing.lg,
    fontSize: 16,
    color: colors.text.secondary,
  },
});

export default BreathingAnimation;
