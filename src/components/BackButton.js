import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../utils/theme';

/**
 * A reusable back button component that navigates to the previous screen
 * @param {Object} props - Component props
 * @param {Object} props.style - Additional styles for the button
 * @param {string} props.color - Color of the back icon (defaults to white)
 * @param {number} props.size - Size of the back icon (defaults to 24)
 * @param {Function} props.onPress - Custom onPress function (defaults to navigation.goBack)
 */
const BackButton = ({ style, color = colors.text.primary, size = 24, onPress }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
    borderRadius: 20,
    zIndex: 10,
  },
});

export default BackButton;
