// Server startup and dependency installation script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths
const serverDir = path.join(__dirname, 'server');
const frontendDir = path.join(__dirname, 'frontend');

// Check if server directory exists
if (!fs.existsSync(serverDir)) {
  console.log('Creating server directory...');
  fs.mkdirSync(serverDir, { recursive: true });
}

// Check if frontend directory exists
if (!fs.existsSync(frontendDir)) {
  console.log('Creating frontend directory...');
  fs.mkdirSync(frontendDir, { recursive: true });
}

// Install server dependencies
console.log('Installing server dependencies...');
try {
  if (!fs.existsSync(path.join(serverDir, 'node_modules'))) {
    const packageJson = path.join(serverDir, 'package.json');
    if (!fs.existsSync(packageJson)) {
      // Create basic package.json if not exists
      console.log('Creating server package.json...');
      const serverPackage = {
        "name": "waste2give-server",
        "version": "1.0.0",
        "main": "server.js",
        "dependencies": {
          "cors": "^2.8.5",
          "express": "^4.18.2",
          "dotenv": "^16.0.3"
        },
        "scripts": {
          "start": "node server.js",
          "test": "node test-server.js"
        }
      };
      fs.writeFileSync(packageJson, JSON.stringify(serverPackage, null, 2));
    }
    
    console.log('Running npm install in server directory...');
    execSync('cd server && npm install', { stdio: 'inherit' });
  } else {
    console.log('Server dependencies already installed');
  }
} catch (error) {
  console.error('Error installing server dependencies:', error.message);
}

// Install frontend dependencies
console.log('Installing frontend dependencies...');
try {
  if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
    const packageJson = path.join(frontendDir, 'package.json');
    if (fs.existsSync(packageJson)) {
      console.log('Running npm install in frontend directory...');
      execSync('cd frontend && npm install', { stdio: 'inherit' });
      
      // Install TailwindCSS
      console.log('Installing TailwindCSS...');
      execSync('cd frontend && npm install -D tailwindcss postcss autoprefixer', { stdio: 'inherit' });
      execSync('cd frontend && npx tailwindcss init -p', { stdio: 'inherit' });
    } else {
      console.error('Frontend package.json not found. Make sure you have a React project in the frontend directory.');
    }
  } else {
    console.log('Frontend dependencies already installed');
  }
} catch (error) {
  console.error('Error installing frontend dependencies:', error.message);
}

// Start servers
console.log('\nStartup complete!\n');
console.log('To start the server:');
console.log('cd server && npm start');
console.log('\nTo start the frontend:');
console.log('cd frontend && npm run dev');