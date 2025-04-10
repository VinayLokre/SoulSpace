import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserDataToFile } from '../utils/fileUtils';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth Context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedQuest, setHasCompletedQuest] = useState(false);

  // Check if user is already logged in and if quest is completed
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }

        // Check if personality quest has been completed
        const questCompleted = await AsyncStorage.getItem('personalityQuestCompleted');
        if (questCompleted === 'true') {
          setHasCompletedQuest(true);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      // For now, we'll use a simple hardcoded check
      // In a real app, this would be an API call
      if (email === 'user@example.com' && password === 'password') {
        const userData = { id: '1', email, name: 'Test User' };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      // For now, we'll just simulate a successful registration
      // In a real app, this would be an API call
      const userData = { id: Date.now().toString(), email, name, password };

      // Save user data to AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Save user data to a local file
      await saveUserDataToFile(userData);

      // Reset quest completion status for new user
      await AsyncStorage.setItem('personalityQuestCompleted', 'false');
      setHasCompletedQuest(false);

      // Set the user in state
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Skip login (guest mode)
  const skipLogin = async () => {
    try {
      const guestData = { id: 'guest', name: 'Guest', isGuest: true };
      await AsyncStorage.setItem('user', JSON.stringify(guestData));
      setUser(guestData);
    } catch (error) {
      console.error('Skip login error:', error);
    }
  };

  // Mark personality quest as completed
  const completePersonalityQuest = async () => {
    try {
      await AsyncStorage.setItem('personalityQuestCompleted', 'true');
      setHasCompletedQuest(true);
      return true;
    } catch (error) {
      console.error('Error completing personality quest:', error);
      return false;
    }
  };

  // Check if personality quest is needed
  const shouldShowPersonalityQuest = () => {
    return !hasCompletedQuest && user && !user.isGuest;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        skipLogin,
        isAuthenticated: !!user,
        isGuest: user?.isGuest || false,
        completePersonalityQuest,
        shouldShowPersonalityQuest: shouldShowPersonalityQuest(),
        hasCompletedQuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
