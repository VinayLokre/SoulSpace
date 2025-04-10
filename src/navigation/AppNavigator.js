import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Import screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import AICompanionScreen from '../screens/AICompanionScreen';
import JournalScreen from '../screens/JournalScreen';
import MeditationScreen from '../screens/MeditationScreen';
import LoadingScreen from '../screens/LoadingScreen';
import SplashScreen from '../screens/SplashScreen';
import PersonalityQuestScreen from '../screens/PersonalityQuestScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator (when user is authenticated)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AI Companion') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Journal') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Meditation') {
            iconName = focused ? 'moon' : 'moon-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8A2BE2', // Purple color
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#121212', // Dark background
          borderTopColor: '#333',
          height: 60, // Increased height for bottom nav bar
          paddingTop: 5,
          paddingBottom: 10,
        },
        headerShown: false, // Hide the header
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AI Companion" component={AICompanionScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Meditation" component={MeditationScreen} />
    </Tab.Navigator>
  );
};

// Main app navigator
const AppNavigator = () => {
  const { isLoading, isAuthenticated, shouldShowPersonalityQuest } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // If we're not loading auth state anymore, we can prepare to hide splash
    // but still show it for a minimum time for better UX
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1000); // Ensure splash shows for at least 1 second after auth loads

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : shouldShowPersonalityQuest ? (
        <Stack.Screen name="PersonalityQuest" component={PersonalityQuestScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
