import React from 'react';
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
        },
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
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
  const { isLoading, isAuthenticated } = useAuth();

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
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
