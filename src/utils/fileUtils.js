import * as FileSystem from 'expo-file-system';

/**
 * Save user data to a local file
 * @param {Object} userData - User data to save
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const saveUserDataToFile = async (userData) => {
  try {
    // Create a formatted string with user data
    const formattedData = `
User Data:
---------
Name: ${userData.name || 'N/A'}
Email: ${userData.email || 'N/A'}
ID: ${userData.id || 'N/A'}
Created: ${new Date().toISOString()}
`;

    // Define the file path
    const filePath = `${FileSystem.documentDirectory}user_data.txt`;
    
    // Write the data to the file
    await FileSystem.writeAsStringAsync(filePath, formattedData);
    
    console.log('User data saved to file:', filePath);
    return true;
  } catch (error) {
    console.error('Error saving user data to file:', error);
    return false;
  }
};

/**
 * Read user data from a local file
 * @returns {Promise<string|null>} - User data as string or null if error
 */
export const readUserDataFromFile = async () => {
  try {
    const filePath = `${FileSystem.documentDirectory}user_data.txt`;
    
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      console.log('User data file does not exist');
      return null;
    }
    
    // Read the file
    const data = await FileSystem.readAsStringAsync(filePath);
    return data;
  } catch (error) {
    console.error('Error reading user data from file:', error);
    return null;
  }
};
