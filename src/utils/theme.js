// Theme configuration for the SoulSpace app
// This includes colors, spacing, typography, and other UI constants
import { Platform } from 'react-native';

export const colors = {
  // Primary colors with glow effects
  primary: '#8A2BE2', // Blueviolet
  primaryGlow: '#B76AFE', // Glowing blueviolet
  secondary: '#6A5ACD', // Slateblue
  secondaryGlow: '#9F8FFF', // Glowing slateblue
  accent: '#FF69B4', // Hot pink
  accentGlow: '#FF9ED2', // Glowing hot pink

  // Neon colors for highlights and effects
  neon: {
    blue: '#00F3FF', // Neon blue
    purple: '#AD00FF', // Neon purple
    pink: '#FF00E4', // Neon pink
    green: '#00FF94', // Neon green
    yellow: '#FBFF00', // Neon yellow
  },

  // Background colors for space theme
  background: {
    dark: '#050714', // Deep space black
    medium: '#0C1445', // Dark space blue
    light: '#1A237E', // Deep indigo
    overlay: 'rgba(10, 10, 30, 0.8)', // Transparent overlay
  },

  // Text colors
  text: {
    primary: '#FFFFFF', // White
    secondary: '#E0E0FF', // Light blue-white
    muted: '#A9B8FF', // Soft blue
    disabled: '#616194', // Muted purple-gray
    glow: '#FFFFFF99', // White with glow
  },

  // Status colors with glow
  status: {
    success: '#4CAF50', // Green
    successGlow: '#7FFF83', // Glowing green
    warning: '#FFC107', // Amber
    warningGlow: '#FFE07A', // Glowing amber
    error: '#F44336', // Red
    errorGlow: '#FF7B73', // Glowing red
    info: '#2196F3', // Blue
    infoGlow: '#7BC8FF', // Glowing blue
  },

  // Mood colors with glow effects
  mood: {
    happy: '#FFD700', // Gold
    happyGlow: '#FFF494', // Glowing gold
    sad: '#4169E1', // Royal blue
    sadGlow: '#84A9FF', // Glowing royal blue
    anxious: '#FF6347', // Tomato
    anxiousGlow: '#FFA494', // Glowing tomato
    calm: '#48D1CC', // Medium turquoise
    calmGlow: '#94FFF9', // Glowing turquoise
    angry: '#DC143C', // Crimson
    angryGlow: '#FF6B87', // Glowing crimson
    tired: '#778899', // Light slate gray
    tiredGlow: '#A4B4C4', // Glowing light slate gray
  },

  // Gradient colors for the starry background and components
  gradients: {
    space: ['#0F0C29', '#302B63', '#24243E'], // Deep space gradient
    cosmos: ['#000000', '#220033', '#330044'], // Dark cosmos gradient
    nebula: ['#330867', '#30CFD0'], // Nebula gradient
    aurora: ['#009FFF', '#ec2F4B'], // Aurora gradient
    twilight: ['#4B0082', '#800080', '#9932CC'], // Purple gradient
    dawn: ['#FF6B6B', '#556270', '#4ECDC4'], // Colorful gradient
    galaxy: ['#0F2027', '#203A43', '#2C5364'], // Galaxy gradient
    stardust: ['#12C2E9', '#C471ED', '#F64F59'], // Stardust gradient
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    title: 36,
    header: 28,
  },
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  fontFamily: {
    // Using system fonts since custom fonts are not available
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    // Space-themed fonts with system fallbacks
    title: Platform.OS === 'ios' ? 'Futura' : 'sans-serif-condensed',
    heading: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    body: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    accent: 'SpaceMono', // The only custom font we have
  },
  // Text shadow for glowing effect
  textShadow: {
    sm: '0 0 2px rgba(255, 255, 255, 0.5)',
    md: '0 0 4px rgba(255, 255, 255, 0.5)',
    lg: '0 0 8px rgba(255, 255, 255, 0.5)',
    glow: '0 0 10px #AD00FF, 0 0 20px #AD00FF, 0 0 30px #AD00FF',
    neonBlue: '0 0 5px #00F3FF, 0 0 10px #00F3FF, 0 0 15px #00F3FF',
    neonPurple: '0 0 5px #AD00FF, 0 0 10px #AD00FF, 0 0 15px #AD00FF',
    neonPink: '0 0 5px #FF00E4, 0 0 10px #FF00E4, 0 0 15px #FF00E4',
  },
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

// Simple border radius values without any proxy
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 30,
  round: 50,
  circle: 9999,
};

// Alias for borderRadius to handle any case sensitivity issues
export const borderradius = borderRadius;

// Animation timing constants
export const animation = {
  durations: {
    fast: 300,
    normal: 500,
    slow: 800,
    verySlow: 1200,
  },
  delays: {
    short: 100,
    medium: 300,
    long: 500,
  },
  easing: {
    // Standard easing functions
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Custom easing functions
    bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// Glow and shadow effects
export const effects = {
  // Box shadows for elements
  boxShadow: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.14)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
    // Glowing shadows
    glowPurple: '0 0 10px rgba(173, 0, 255, 0.5), 0 0 20px rgba(173, 0, 255, 0.3)',
    glowBlue: '0 0 10px rgba(0, 243, 255, 0.5), 0 0 20px rgba(0, 243, 255, 0.3)',
    glowPink: '0 0 10px rgba(255, 0, 228, 0.5), 0 0 20px rgba(255, 0, 228, 0.3)',
    glowMulti: '0 0 10px rgba(173, 0, 255, 0.5), 0 0 20px rgba(0, 243, 255, 0.3), 0 0 30px rgba(255, 0, 228, 0.2)',
  },
  // Blur effects
  blur: {
    sm: 'blur(2px)',
    md: 'blur(4px)',
    lg: 'blur(8px)',
  },
  // Opacity levels
  opacity: {
    faint: 0.3,
    semi: 0.5,
    medium: 0.7,
    high: 0.9,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
};

// Animation timing constants
export const timing = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Screen dimensions helper
export const dimensions = {
  fullWidth: '100%',
  fullHeight: '100%',
};

// Default theme object that combines all the above
export default {
  colors,
  spacing,
  typography,
  borderRadius,
  borderradius, // Include the alias
  shadows,
  timing,
  dimensions,
};
