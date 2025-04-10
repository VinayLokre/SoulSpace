import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeAI } from './src/ai/aiManager';
import FontLoader from './src/components/FontLoader';

export default function App() {
  const [aiStatus, setAiStatus] = useState({
    emotionModelLoaded: false,
    llmModelLoaded: false,
    initializing: true
  });

  // Initialize AI models when the app starts
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Starting AI model initialization...');
        // We'll just initialize the AI system
        // This will set up the necessary structures even if models aren't present
        const result = await initializeAI();
        console.log('AI initialization complete:', result);

        setAiStatus({
          ...result,
          initializing: false
        });
      } catch (error) {
        console.error('Error initializing AI system:', error);
        // Even if there's an error, we'll continue with the app
        // It will just use the rule-based fallback
        setAiStatus({
          emotionModelLoaded: false,
          llmModelLoaded: false,
          initializing: false
        });
      }
    };

    // Wrap in try-catch to prevent app crashes
    try {
      initialize();
    } catch (error) {
      console.error('Critical error in initialization:', error);
      // Ensure the app continues even if initialization fails completely
      setAiStatus({
        emotionModelLoaded: false,
        llmModelLoaded: false,
        initializing: false
      });
    }
  }, []);

  return (
    <FontLoader>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </FontLoader>
  );
}




