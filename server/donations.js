const express = require('express');
const router = express.Router();
const { log } = require('./utils');

// Create a local donations array that will be exported
// (server.js will import this instead of the other way around)
const donations = [];

// Store user message history for personalized impacts
const userMessageHistory = {};

// Utility: kg to lbs
function kgToLbs(kg) {
    return +(kg * 2.20462).toFixed(2);
}

// Enhanced Gemini API call with user context
async function getImpactMessage(lbs, userId = null) {
    try {
        // Track user's total contributions if userId provided
        if (userId) {
            // Initialize history if not exists
            if (!userMessageHistory[userId]) {
                userMessageHistory[userId] = {
                    totalSaved: 0,
                    donationCount: 0
                };
            }

            // Update user stats
            userMessageHistory[userId].totalSaved += lbs;
            userMessageHistory[userId].donationCount += 1;

            // Generate more personalized message based on history
            if (userMessageHistory[userId].donationCount > 3) {
                const totalSaved = userMessageHistory[userId].totalSaved.toFixed(1);
                return `Amazing work! You've now saved ${lbs} more pounds of food, bringing your total to ${totalSaved} pounds rescued from landfill. You're making a significant environmental impact! 🌍⭐`;
            } else if (userMessageHistory[userId].donationCount > 1) {
                return `Thank you for donating again! You just saved ${lbs} pounds of food from going to landfill. Keep up the great work! 🌍👏`;
            }
        }

        // Default message for first-time or anonymous users
        return `You just saved ${lbs} pounds of food from going to landfill. Well done! 🌍👏`;
    } catch (error) {
        log('Error in getImpactMessage:', error);
        // Fallback message in case of error
        return `You saved ${lbs} pounds of food! Thank you for reducing waste.`;
    }
}

// GET /api/donations - Get all available donations
router.get('/', (req, res) => {
    try {
        // Sort by posted time, newest first
        const availableDonations = donations
            .filter(d => !d.claimed)
            .sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
        
        res.json(availableDonations);
    } catch (error) {
        log('Error fetching donations:', error);
        res.status(500).json({ error: 'Failed to fetch donations.' });
    }
});

// POST /api/donations - Create a new donation
router.post('/', async (req, res) => {
    const { item, quantity, weight, pickupTime, address, donorId } = req.body;
    const userId = req.userId || donorId; // Use middleware-extracted userId if available
    
    // Validation
    if (!item || typeof item !== 'string') {
        return res.status(400).json({ error: 'Item name required.' });
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be > 0.' });
    }
    if (!Number.isFinite(weight) || weight <= 0) {
        return res.status(400).json({ error: 'Weight must be a positive number.' });
    }    if (!pickupTime) {
        return res.status(400).json({ error: 'Pickup time required.' });
    }
    if (!address) {
        return res.status(400).json({ error: 'Pickup address required.' });
    }
    if (!userId) {
        return res.status(400).json({ error: 'User ID required.' });
    }
    
    try {
        const lbs = weight * quantity;
        // Pass userId to get personalized message based on donation history
        const impactMessage = await getImpactMessage(lbs, userId);
          // Create new donation
        const donation = {
            id: Date.now().toString(),
            item,
            quantity: Number(quantity),
            weight: Number(weight),
            lbs,
            pickupTime,
            address,
            donorId: userId,
            claimed: false,
            postedAt: new Date().toISOString(),
            impactMessage
        };
        
        // Add to in-memory store
        donations.push(donation);
        
        res.status(201).json({
            donationId: donation.id,
            poundsSaved: lbs,
            aiMessage: impactMessage
        });
    } catch (error) {
        log('Error creating donation:', error);
        res.status(500).json({ error: 'Failed to create donation.' });
    }
});

// POST /api/donations/claim - Claim a donation
router.post('/claim', (req, res) => {
    const { donationId, receiverId } = req.body;
    
    if (!donationId) {
        return res.status(400).json({ error: 'Donation ID required.' });
    }
    if (!receiverId) {
        return res.status(400).json({ error: 'Receiver ID required.' });
    }
    
    try {
        // Find the donation
        const donationIndex = donations.findIndex(d => d.id === donationId);
        
        if (donationIndex === -1) {
            return res.status(404).json({ error: 'Donation not found.' });
        }
        
        // Check if already claimed
        if (donations[donationIndex].claimed) {
            return res.status(400).json({ error: 'This donation has already been claimed.' });
        }
          // Prevent users from claiming their own donations
        if (donations[donationIndex].donorId === receiverId) {
            return res.status(400).json({ error: 'You cannot claim your own donation.' });
        }
        
        // Double check using the JWT token 
        if (req.user && donations[donationIndex].donorId === req.user.id) {
            return res.status(400).json({ error: 'You cannot claim your own donation.' });
        }
        
        // Update donation
        donations[donationIndex] = {
            ...donations[donationIndex],
            claimed: true,
            receiverId,
            claimedAt: new Date().toISOString()
        };
        
        res.json({
            success: true,
            donation: donations[donationIndex]
        });
    } catch (error) {
        log('Error claiming donation:', error);
        res.status(500).json({ error: 'Failed to claim donation.' });
    }
});

// Export the router and donations array
module.exports = {
    router,
    donations,
    getImpactMessage
};
