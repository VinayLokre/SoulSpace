import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserDataToFile } from '../utils/fileUtils';
import { resetNavigation } from '../../App';
import { logError } from '../components/ErrorLogger';

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

        // Reset navigation to main screen after successful login
        try {
          resetNavigation({ index: 0, routes: [{ name: 'Main' }] });
        } catch (navError) {
          logError(navError, 'Navigation');
        }

        return { success: true };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      logError(error, 'Login');
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

      // Reset navigation to personality quest after successful registration
      try {
        resetNavigation({ index: 0, routes: [{ name: 'PersonalityQuest' }] });
      } catch (navError) {
        logError(navError, 'Navigation');
      }

      return { success: true };
    } catch (error) {
      logError(error, 'Registration');
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);

      // Reset navigation to login screen after logout
      try {
        resetNavigation({ index: 0, routes: [{ name: 'Login' }] });
      } catch (navError) {
        logError(navError, 'Navigation');
      }
    } catch (error) {
      logError(error, 'Logout');
    }
  };

  // Skip login (guest mode)
  const skipLogin = async () => {
    try {
      const guestData = { id: 'guest', name: 'Guest', isGuest: true };
      await AsyncStorage.setItem('user', JSON.stringify(guestData));
      setUser(guestData);

      // Reset navigation to main screen after guest login
      try {
        resetNavigation({ index: 0, routes: [{ name: 'Main' }] });
      } catch (navError) {
        logError(navError, 'Navigation');
      }
    } catch (error) {
      logError(error, 'Skip Login');
    }
  };

  // Mark personality quest as completed
  const completePersonalityQuest = async () => {
    try {
      await AsyncStorage.setItem('personalityQuestCompleted', 'true');
      setHasCompletedQuest(true);

      // Reset navigation to main screen after completing personality quest
      try {
        resetNavigation({ index: 0, routes: [{ name: 'Main' }] });
      } catch (navError) {
        logError(navError, 'Navigation');
      }

      return true;
    } catch (error) {
      logError(error, 'Personality Quest');
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
