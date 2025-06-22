// Run this file to install the JWT dependency
const { exec } = require('child_process');
const path = require('path');

console.log('Installing JWT dependency...');
const serverPath = path.join(__dirname, 'server');

exec('npm install jsonwebtoken', { cwd: serverPath }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error installing JWT: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log('JWT installed successfully!');
});