// Run this file with Node.js to install server dependencies
const { execSync } = require('child_process');
const path = require('path');

console.log('Installing required server packages...');
try {
  execSync('cd server && npm install jsonwebtoken cors express', { stdio: 'inherit' });
  console.log('Server packages installed successfully!');
} catch (error) {
  console.error('Failed to install server packages:', error);
}