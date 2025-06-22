// Run this file with Node.js to install missing dependencies
const { execSync } = require('child_process');

console.log('Installing server dependencies...');
try {
  execSync('cd server && npm install jsonwebtoken', { stdio: 'inherit' });
  console.log('Server dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install server dependencies:', error);
}

// Install frontend dependencies if needed
console.log('Installing frontend dependencies...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('Frontend dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install frontend dependencies:', error);
}