// Simple logging utility with timestamps
function log(message, ...args) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, ...args);
}

module.exports = {
  log
};