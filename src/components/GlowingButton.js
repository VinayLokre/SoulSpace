import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { colors, borderRadius, shadows } from '../utils/theme';

const GlowingButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon = null,
  glowing = true,
  style,
  textStyle,
}) => {
  // Animation value for the glow effect
  const glowOpacity = React.useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    if (glowing && !disabled) {
      // Create a pulsing glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset the animation if glowing is disabled
      glowOpacity.setValue(0.5);
    }
  }, [glowing, disabled, glowOpacity]);

  // Determine button colors based on variant
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: colors.primary,
          text: colors.text.primary,
          glow: colors.primary,
        };
      case 'secondary':
        return {
          background: colors.secondary,
          text: colors.text.primary,
          glow: colors.secondary,
        };
      case 'accent':
        return {
          background: colors.accent,
          text: colors.text.primary,
          glow: colors.accent,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: colors.primary,
          glow: colors.primary,
          border: colors.primary,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: colors.text.primary,
          glow: colors.primary,
        };
      default:
        return {
          background: colors.primary,
          text: colors.text.primary,
          glow: colors.primary,
        };
    }
  };

  // Determine button size
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
        };
    }
  };

  const buttonColors = getButtonColors();
  const buttonSize = getButtonSize();

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth]}>
      {/* Glow effect */}
      {glowing && !disabled && (
        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: buttonColors.glow,
              opacity: glowOpacity,
            },
          ]}
        />
      )}

      {/* Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: buttonColors.background,
            paddingVertical: buttonSize.paddingVertical,
            paddingHorizontal: buttonSize.paddingHorizontal,
            borderColor: buttonColors.border,
            borderWidth: buttonColors.border ? 1 : 0,
          },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          style={[
            styles.text,
            {
              color: buttonColors.text,
              fontSize: buttonSize.fontSize,
            },
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    ...shadows.md,
    zIndex: 2,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    backgroundColor: colors.background.medium,
    opacity: 0.7,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    zIndex: 1,
    transform: [{ scale: 1.1 }],
    ...shadows.lg,
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default GlowingButton;
