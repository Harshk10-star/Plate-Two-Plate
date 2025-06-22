/**
 * User Service - Handles user identity and session management
 */

// Generate a random user ID
function generateUserId() {
  return 'user-' + Math.random().toString(36).substring(2, 9);
}

// A simple service to manage user identifiers
// In a real app, this would integrate with proper authentication

// Get the current user ID from storage
export function getCurrentUserId() {
  try {
    // Try to get from localStorage first (persists across sessions)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return user.id;
    }
    
    // Fall back to session ID if available
    const sessionUserId = sessionStorage.getItem('userId');
    if (sessionUserId) {
      return sessionUserId;
    }
    
    // Generate random ID if none exists
    const randomId = 'user-' + Math.floor(Math.random() * 1000);
    sessionStorage.setItem('userId', randomId);
    return randomId;
  } catch (err) {
    console.error('Error getting user ID:', err);
    return 'user-anonymous';
  }
}

// Get a unique session ID for multi-tab support
export function getSessionId() {
  let tabId = sessionStorage.getItem('tabId');
  
  if (!tabId) {
    tabId = `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('tabId', tabId);
  }
  
  return tabId;
}

// Check if the current user is the owner of a donation
export function isOwnDonation(donation) {
  const currentUserId = getCurrentUserId();
  return donation.donorId === currentUserId;
}

// For development/testing - switch between test users
export function switchUser() {
  const users = [
    'user-123',  // donor
    'user-456',  // receiver
    'user-789'   // another test user
  ];
  
  // Get current user ID
  const currentId = getCurrentUserId();
  
  // Find current index or default to 0
  let currentIndex = users.indexOf(currentId);
  if (currentIndex === -1) currentIndex = 0;
  
  // Switch to next user
  const nextIndex = (currentIndex + 1) % users.length;
  const newUserId = users[nextIndex];
  
  // Update sessionStorage
  sessionStorage.setItem('userId', newUserId);
  
  return newUserId;
}