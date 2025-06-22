/**
 * Simple in-memory session store to handle multi-tab sessions
 * In a production environment, this would be replaced with Redis or a database
 */

const { log } = require('./utils');

// Session store for multi-tab support
const sessions = new Map();

// Session expiry time (30 minutes)
const SESSION_TTL = 30 * 60 * 1000;

/**
 * Get or create a session for a user
 * @param {string} userId - User ID
 * @param {string} tabId - Optional tab ID for multi-tab support
 * @returns {Object} Session data
 */
function getUserSession(userId, tabId = 'default') {
  const sessionKey = `${userId}:${tabId}`;
  
  // Check if session exists and is not expired
  if (sessions.has(sessionKey)) {
    const session = sessions.get(sessionKey);
    session.lastAccessed = Date.now();
    return session.data;
  }
  
  // Create new session
  const newSession = {
    userId,
    tabId,
    created: Date.now(),
    lastAccessed: Date.now(),
    data: {
      donationCount: 0,
      totalSaved: 0,
      recentActivity: []
    }
  };
  
  sessions.set(sessionKey, newSession);
  return newSession.data;
}

/**
 * Update a user's session data
 * @param {string} userId - User ID
 * @param {string} tabId - Tab ID
 * @param {Object} data - Session data to update
 */
function updateUserSession(userId, tabId = 'default', data = {}) {
  const sessionKey = `${userId}:${tabId}`;
  
  if (sessions.has(sessionKey)) {
    const session = sessions.get(sessionKey);
    session.lastAccessed = Date.now();
    session.data = { ...session.data, ...data };
    return session.data;
  }
  
  return getUserSession(userId, tabId);
}

/**
 * Clean up expired sessions (should be called periodically)
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  let count = 0;
  
  for (const [key, session] of sessions.entries()) {
    if (now - session.lastAccessed > SESSION_TTL) {
      sessions.delete(key);
      count++;
    }
  }
  
  if (count > 0) {
    log(`Cleaned up ${count} expired sessions`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

module.exports = {
  getUserSession,
  updateUserSession
};