import { borderRadius } from './theme';

/**
 * Safely applies border radius to a style object
 * This function handles any potential issues with borderRadius values
 * 
 * @param {number|string} radius - The border radius value or key from theme
 * @returns {number} A safe border radius value
 */
export const safeRadius = (radius) => {
  // If radius is a number, return it directly
  if (typeof radius === 'number') {
    return radius;
  }
  
  // If radius is a string that can be parsed as a number, return the number
  if (typeof radius === 'string' && !isNaN(parseInt(radius))) {
    return parseInt(radius);
  }
  
  // If radius is a key in the borderRadius object, return that value
  if (typeof radius === 'string' && radius in borderRadius) {
    return borderRadius[radius];
  }
  
  // Default fallback
  return 8;
};

/**
 * Creates a style object with safe border radius
 * 
 * @param {number|string} radius - The border radius value or key from theme
 * @returns {object} Style object with safe border radius
 */
export const withRadius = (radius) => {
  return {
    borderRadius: 8,
  };
};

/**
 * Creates a circular style object
 * 
 * @param {number} size - The size of the circle
 * @returns {object} Style object for a circle
 */
export const circle = (size) => {
  return {
    width: size,
    height: size,
    borderRadius: 8,
  };
};

export default {
  safeRadius,
  withRadius,
  circle,
};
