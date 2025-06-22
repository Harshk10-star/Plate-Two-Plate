const express = require('express');
const router = express.Router();
const { log } = require('./utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Mock users database (in-memory)
const users = [
  {
    id: 'user-123',
    name: 'Food Donor',
    email: 'donor@example.com',
    password: 'password123',
    userType: 'business'
  },
  {
    id: 'user-456',
    name: 'Food Receiver',
    email: 'receiver@example.com',
    password: 'password456',
    userType: 'foodbank'
  },
    {
    id: 'user0',
    name: 'test1',
    email: 'test1@example.com',
    password: 'test1',
    userType: 'business'
  },
      {
    id: 'user1',
    name: 'test2',
    email: 'test2@example.com',
    password: 'test2',
    userType: 'foodbank'
  },
];

// Import auth service
const { verifyToken, JWT_SECRET, createToken } = require('./authService');

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    
    // Debug logging to track auth header
    if (!authHeader) {
      log('Missing authorization header');
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      log('Malformed authorization header:', authHeader);
      return res.status(401).json({ error: 'Invalid authentication format' });
    }
    
    const token = tokenParts[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token
    const user = verifyToken(token);
    if (!user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Set user info in request
    req.user = user;
    next();
  } catch (error) {
    log('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Sign in route
router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  console.log('Sign in request:', req.body, users);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
      // Create token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        userType: user.userType 
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    log('Sign in error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Sign up route
router.post('/signup', (req, res) => {
  const { name, email, password, userType = 'business' } = req.body;
  console.log('Sign up request:', req.body, users);
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password required' });
  }
  
  try {
    // Check if user exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    console.log('Sign up request:', req.body, users);
    // Create new user
    const newUser = {
      id: `user-${crypto.randomBytes(4).toString('hex')}`,
      name,
      email,
      password, // In production, hash this password!
      userType
    };
    
    // Add to users array
    users.push(newUser);
      // Create token (do not include password)
    const { password: _, ...userWithoutPassword } = newUser;
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email,
        name: newUser.name,
        userType: newUser.userType 
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    log('Sign up error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user details
router.get('/me', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword
    });
  } catch (error) {
    log('Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});

module.exports = {
  router,
  authenticateToken,
  users // Export for other modules
};