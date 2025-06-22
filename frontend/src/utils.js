// Utility: kg to lbs
export function kgToLbs(kg) {
  return +(kg * 2.20462).toFixed(2);
}

// Get a consistent user ID across the app
export function getUserId() {
  let userId = sessionStorage.getItem('userId');
  
  if (!userId) {
    userId = 'user-' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('userId', userId);
  }
  
  return userId;
}
