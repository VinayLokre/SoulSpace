import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '../utils/theme';
import StarryBackground from '../components/StarryBackground';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const animationRef = useRef(null);

  useEffect(() => {
    // Start the animation and set a timeout to call onFinish
    if (animationRef.current) {
      animationRef.current.play();
      
      // Call onFinish after animation completes (or after a timeout)
      const timer = setTimeout(() => {
        if (onFinish) onFinish();
      }, 3000); // 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [onFinish]);

  return (
    <StarryBackground>
      <View style={styles.container}>
        <LottieView
          ref={animationRef}
          source={require('../../assets/animations/soulspace-text.json')}
          style={styles.animation}
          autoPlay={false}
          loop={false}
        />
      </View>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: width * 0.8,
    height: height * 0.3,
  },
});

export default SplashScreen;
