import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeAI } from './src/ai/aiManager';
import FontLoader from './src/components/FontLoader';
import * as Updates from 'expo-updates';
import ErrorLogger, { logError } from './src/components/ErrorLogger';
import { ErrorUtils } from 'react-native';

// Create a navigation ref that can be used outside of components
const navigationRef = createNavigationContainerRef();

// Global function to navigate from anywhere
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    // Log navigation attempt when navigator isn't ready
    logError(new Error(`Failed to navigate to ${name}, navigator not ready`), 'Navigation');
  }
}

// Global function to reset navigation state
export function resetNavigation(state) {
  if (navigationRef.isReady()) {
    navigationRef.reset(state);
  } else {
    logError(new Error(`Failed to reset navigation, navigator not ready`), 'Navigation');
  }
}

export default function App() {
  const [aiStatus, setAiStatus] = useState({
    emotionModelLoaded: false,
    llmModelLoaded: false,
    initializing: true
  });

  // Handle uncaught errors
  const handleError = (error, isFatal) => {
    logError(error, isFatal ? 'Fatal Error' : 'Error');
  };

  // Set up error handler for uncaught errors
  useEffect(() => {
    // Set up global error handler using try-catch
    try {
      if (ErrorUtils) {
        const originalErrorHandler = ErrorUtils.getGlobalHandler();

        ErrorUtils.setGlobalHandler((error, isFatal) => {
          handleError(error, isFatal);
          originalErrorHandler(error, isFatal);
        });

        return () => {
          ErrorUtils.setGlobalHandler(originalErrorHandler);
        };
      }
    } catch (error) {
      console.log('Error setting up global error handler:', error);
    }
  }, []);

  // Disable update checking
  useEffect(() => {
    async function disableUpdates() {
      try {
        // Disable automatic updates
        if (Updates.isAvailable) {
          // Use the correct API based on what's available
          if (typeof Updates.setUpdatesCheckAutomaticallyAsync === 'function') {
            await Updates.setUpdatesCheckAutomaticallyAsync(Updates.UpdateCheckFrequency.ON_ERROR_RECOVERY);
          }
        }
      } catch (error) {
        logError(error, 'Updates');
      }
    }

    disableUpdates();
  }, []);

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
        logError(error, 'AI Initialization');
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
      logError(error, 'Critical Initialization');
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
          <NavigationContainer ref={navigationRef}
            onError={(error) => {
              logError(error, 'Navigation');
            }}
          >
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <AppNavigator />
            <ErrorLogger />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </FontLoader>
  );
}




