// Setup script for the Waste2Give frontend
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up Waste2Give Frontend...');

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Create vite.config.js file with proxy setup
console.log('\n🔧 Setting up API proxy...');
const viteConfigPath = path.join(__dirname, 'vite.config.js');
const viteConfigContent = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
`;

try {
  fs.writeFileSync(viteConfigPath, viteConfigContent);
  console.log('✅ Created vite.config.js with API proxy');
} catch (error) {
  console.error('❌ Error creating vite config:', error.message);
}

console.log('\n🚀 Setup complete! Run "npm run dev" to start the development server.');
console.log('Make sure your backend server is running on http://localhost:3000');