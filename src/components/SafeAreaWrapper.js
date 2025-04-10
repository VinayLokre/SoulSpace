import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/theme';

/**
 * A wrapper component that provides safe area insets and status bar padding
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.style - Additional styles for the container
 * @param {string} props.backgroundColor - Background color for the safe area
 */
const SafeAreaWrapper = ({ 
  children, 
  style, 
  backgroundColor = colors.background.dark,
  edges = ['top', 'right', 'left']
}) => {
  // Calculate status bar height for Android
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor },
        style
      ]}
      edges={edges}
    >
      <View 
        style={[
          styles.content,
          Platform.OS === 'android' && { paddingTop: statusBarHeight }
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
