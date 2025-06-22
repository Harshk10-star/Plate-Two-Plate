// Authentication service for JWT token handling
const jwt = require('jsonwebtoken');
const { log } = require('./utils');

// Secret key for JWT signing - in production, use environment variable
const JWT_SECRET = 'waste2give-super-secret-key-change-in-production';

/**
 * Create a JWT token for a user
 * @param {Object} user - User object with id, name, email, userType
 * @returns {String} JWT token
 */
function createToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name,
      userType: user.userType 
    }, 
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify and decode a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded user info or null if invalid
 */
function verifyToken(token) {
  try {
    // Debug log for token verification
    log('Verifying token:', token.substring(0, 10) + '...');
    
    // For development environment, handle mock tokens
    if (token.includes('.mocksignature')) {
      log('Detected mock token, extracting payload...');
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          // Extract the payload from base64
          const payload = JSON.parse(atob(parts[1]));
          log('Mock token payload:', payload);
          return payload;
        } catch (err) {
          log('Error parsing mock token:', err);
          return null;
        }
      }
    }
    
    // Normal JWT verification for real tokens
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    log('JWT verification error:', error.message);
    return null;
  }
}

module.exports = {
  JWT_SECRET,
  createToken,
  verifyToken
};