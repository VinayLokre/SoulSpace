// Theme configuration for the SoulSpace app
// This includes colors, spacing, typography, and other UI constants

export const colors = {
  // Primary colors
  primary: '#8A2BE2', // Blueviolet
  secondary: '#6A5ACD', // Slateblue
  accent: '#FF69B4', // Hot pink

  // Background colors
  background: {
    dark: '#121212', // Very dark (almost black)
    medium: '#1E1E1E', // Dark gray
    light: '#2D2D2D', // Medium dark gray
  },

  // Text colors
  text: {
    primary: '#FFFFFF', // White
    secondary: '#E0E0E0', // Light gray
    muted: '#9E9E9E', // Medium gray
    disabled: '#616161', // Dark gray
  },

  // Status colors
  status: {
    success: '#4CAF50', // Green
    warning: '#FFC107', // Amber
    error: '#F44336', // Red
    info: '#2196F3', // Blue
  },

  // Mood colors
  mood: {
    happy: '#FFD700', // Gold
    sad: '#4169E1', // Royal blue
    anxious: '#FF6347', // Tomato
    calm: '#48D1CC', // Medium turquoise
    angry: '#DC143C', // Crimson
    tired: '#778899', // Light slate gray
  },

  // Gradient colors for the starry background
  gradients: {
    space: ['#0F2027', '#203A43', '#2C5364'], // Dark blue gradient
    twilight: ['#4B0082', '#800080', '#9932CC'], // Purple gradient
    dawn: ['#FF6B6B', '#556270', '#4ECDC4'], // Colorful gradient
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
  },
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
  },
  fontFamily: {
    regular: 'System',
    // Add custom fonts here after installing them
  },
};

// Create a proxy object that returns 0 for any property access
// This is a temporary fix to prevent borderRadius errors
const borderRadiusHandler = {
  get: function(target, prop) {
    // Return 0 for any property access
    return 0;
  }
};

export const borderRadius = new Proxy({}, borderRadiusHandler);

// Alias for borderRadius to handle any case sensitivity issues
export const borderradius = borderRadius;

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
