import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../utils/theme';
import StarryBackground from '../components/StarryBackground';
import GlowingButton from '../components/GlowingButton';
import BackButton from '../components/BackButton';
import { useAuth } from '../context/AuthContext';

const AuthScreen = () => {
  // Authentication context
  const { login, register, skipLogin } = useAuth();

  // State variables
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const formPosition = React.useRef(new Animated.Value(isLogin ? 0 : 1)).current;
  const errorOpacity = React.useRef(new Animated.Value(0)).current;

  // Toggle between login and register
  const toggleAuthMode = () => {
    setError('');
    // Set the form position immediately to ensure visibility
    formPosition.setValue(isLogin ? 1 : 0);
    setIsLogin(!isLogin);
  };

  // Show error message with animation
  const showError = (message) => {
    setError(message);
    Animated.sequence([
      Animated.timing(errorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(errorOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (!result.success) {
        showError(result.message || 'Login failed');
      }
    } catch (error) {
      showError('An error occurred during login');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    if (!name || !email || !password) {
      showError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(name, email, password);
      if (!result.success) {
        showError(result.message || 'Registration failed');
      }
    } catch (error) {
      showError('An error occurred during registration');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle guest mode
  const handleSkipLogin = async () => {
    setIsLoading(true);
    try {
      await skipLogin();
    } catch (error) {
      showError('An error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // This is a placeholder for actual Google Sign-in implementation
      // You would typically use Expo AuthSession or react-native-google-signin
      showError('Google Sign-in will be implemented soon');
      // Example of what the actual implementation might look like:
      // const result = await Google.logInAsync({...});
      // if (result.type === 'success') {
      //   // Handle successful login
      // }
    } catch (error) {
      showError('Google Sign-in failed');
      console.error('Google Sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StarryBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* App Logo and Title */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <View style={styles.innerCircle} />
            </View>
            <Text style={styles.title}>SoulSpace</Text>
            <Text style={styles.subtitle}>Your emotional wellness companion</Text>
          </View>

          {/* Error Message */}
          <Animated.View
            style={[
              styles.errorContainer,
              {
                opacity: errorOpacity,
                transform: [
                  {
                    translateY: errorOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>

          {/* Auth Form */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                transform: [
                  {
                    translateX: formPosition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -Dimensions.get('window').width], // Use actual width
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Login Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.text.disabled}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.text.disabled}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              <GlowingButton
                title={isLoading ? 'Logging in...' : 'Login'}
                onPress={handleLogin}
                disabled={isLoading}
                fullWidth
              />

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={() => handleGoogleSignIn()}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={20} color={colors.text.primary} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchButton} onPress={toggleAuthMode}>
                <Text style={styles.switchText}>
                  Don't have an account? <Text style={styles.switchTextHighlight}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Form */}
            <View style={styles.form}>
              <Text style={styles.formTitle}>Create Account</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={colors.text.disabled}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  placeholderTextColor={colors.text.disabled}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.text.disabled}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number (Optional)"
                  placeholderTextColor={colors.text.disabled}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.text.disabled}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>

              <GlowingButton
                title={isLoading ? 'Creating account...' : 'Sign Up'}
                onPress={handleRegister}
                disabled={isLoading}
                fullWidth
              />

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={() => handleGoogleSignIn()}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={20} color={colors.text.primary} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.switchButton} onPress={toggleAuthMode}>
                <Text style={styles.switchText}>
                  Already have an account? <Text style={styles.switchTextHighlight}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Skip Login Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipLogin} disabled={isLoading}>
            <Text style={styles.skipText}>Continue as Guest</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  backButtonContainer: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
    zIndex: 10,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    paddingBottom: 100, // Add extra padding at the bottom
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: spacing.md,
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background.dark,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    backgroundColor: colors.status.error,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.text.primary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%', // Use percentage instead of fixed width
    flexDirection: 'row',
    overflow: 'visible', // Show overflow content
    alignSelf: 'center',
    minHeight: 300, // Ensure minimum height for visibility
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add semi-transparent background
    borderRadius: 8,
    marginVertical: spacing.md,
  },
  form: {
    width: '100%', // Use full width of container
    backgroundColor: colors.background.medium,
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    minHeight: 300, // Ensure minimum height for visibility
    opacity: 1, // Ensure full opacity
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5, // For Android
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.dark,
    borderRadius: 8,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '100%',
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    paddingVertical: spacing.sm,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  switchButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  switchText: {
    color: colors.text.secondary,
  },
  switchTextHighlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  skipText: {
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.text.disabled,
  },
  dividerText: {
    color: colors.text.secondary,
    paddingHorizontal: spacing.sm,
    fontSize: 12,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.dark,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.text.disabled,
  },
  googleButtonText: {
    color: colors.text.primary,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
});

export default AuthScreen;
