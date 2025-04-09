/**
 * This script will find and fix all borderRadius issues in the codebase
 * by replacing theme references with direct numeric values.
 */

const fs = require('fs');
const path = require('path');

// Define the directory to search
const srcDir = path.join(__dirname, 'src');

// Define a mapping of borderRadius theme values to numeric values
const borderRadiusValues = {
  'borderRadius.xs': '4',
  'borderRadius.sm': '8',
  'borderRadius.md': '12',
  'borderRadius.lg': '16',
  'borderRadius.xl': '24',
  'borderRadius.xxl': '30',
  'borderRadius.round': '50',
  'borderRadius.circle': '9999'
};

// Function to recursively find all JS files
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix borderRadius in a file
function fixBorderRadius(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Replace all theme borderRadius references with direct values
  for (const [themeRef, numericValue] of Object.entries(borderRadiusValues)) {
    const regex = new RegExp(themeRef, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, numericValue);
      hasChanges = true;
    }
  }
  
  // Also fix any remaining borderRadius issues
  if (content.includes('borderRadius:')) {
    // Replace any non-numeric borderRadius values with a safe default
    content = content.replace(/borderRadius:\s*([^0-9][^,}]*)/g, 'borderRadius: 8');
    hasChanges = true;
  }
  
  // Write the changes back to the file if needed
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed borderRadius in ${filePath}`);
  }
}

// Main function
function main() {
  console.log('Finding JS files...');
  const jsFiles = findJsFiles(srcDir);
  console.log(`Found ${jsFiles.length} JS files.`);
  
  console.log('Fixing borderRadius issues...');
  jsFiles.forEach(file => {
    fixBorderRadius(file);
  });
  
  console.log('Done!');
}

main();
