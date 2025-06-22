const express = require('express');
const cors = require('cors');
const { router: donationsRouter } = require('./donations');
const { router: authRouter, authenticateToken } = require('./auth');
const { log } = require('./utils');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  log(`${req.method} ${req.path}`);
  next();
});

// Apply auth middleware to protected routes
app.use('/api/donations', authenticateToken);
app.use('/api/users', authenticateToken);
app.use('/api/ai/impact', authenticateToken);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/donations', donationsRouter);

// User history endpoint
app.get('/api/users/:id/history', (req, res) => {  const userId = req.params.id;

  console.log('Fetching history for user:', userId);
  const { donations } = require('./donations');
  console.log('Found', donations.length, 'total donations in system');
  try {
    // Verify user is requesting their own data
    if (req.user && req.user.id !== userId) {
      console.log('Authorization failed: User', req.user.id, 'tried to access data for', userId);
      return res.status(403).json({ error: 'Unauthorized to access this user data' });
    }
    
    console.log('User', userId, 'authenticated and authorized for history request');
    
    // Get donations posted by this user
    const postedDonations = donations.filter(d => d.donorId === userId);
    
    // Get donations claimed by this user
    const receivedDonations = donations.filter(d => d.claimed && d.receiverId === userId);
    
    // Calculate totals
    const totalPoundsSaved = postedDonations.reduce((acc, d) => acc + (d.lbs || 0), 0);
    const totalPoundsReceived = receivedDonations.reduce((acc, d) => acc + (d.lbs || 0), 0);
    
    res.json({
      userId,
      history: {
        posted: postedDonations,
        received: receivedDonations
      },
      stats: {
        totalPoundsSaved,
        totalPoundsReceived,
        totalTransactions: postedDonations.length + receivedDonations.length
      }
    });
  } catch (error) {
    log('Error fetching user history:', error);
    res.status(500).json({ error: 'Failed to fetch user history' });
  }
});

// AI impact endpoint
app.post('/api/ai/impact', (req, res) => {
  try {
    const { lbs, userId } = req.body;
    
    // If no lbs provided, return error
    if (!lbs || isNaN(lbs) || lbs <= 0) {
      return res.status(400).json({ error: 'Valid weight in pounds required.' });
    }
    
    // Generate impact message based on weight
    let impactMessage;
    if (lbs > 50) {
      impactMessage = `Incredible! You've saved ${lbs} pounds of food from the landfill. That's about ${Math.round(lbs * 0.75)} meals that will nourish people in need! 🌍🍎`;
    } else if (lbs > 20) {
      impactMessage = `Amazing! By saving ${lbs} pounds of food, you've prevented ${(lbs * 0.9).toFixed(1)} kg of CO2 from entering the atmosphere. That's like planting ${Math.round(lbs/10)} trees! 🌱`;
    } else {
      impactMessage = `You just saved ${lbs} pounds of food from going to waste! That's approximately ${Math.round(lbs * 0.75)} meals that can feed people in need. Thank you! 🍽️`;
    }
    
    res.json({ impactMessage });
  } catch (error) {
    log('Error generating impact message:', error);
    res.status(500).json({ error: 'Failed to generate impact message.' });
  }
});

// Start server
app.listen(PORT, () => {
  log(`Server running on port ${PORT}`);
});

// Export for testing
module.exports = app;