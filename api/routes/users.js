const express = require('express');
const router = express.Router();

/**
 * POST /api/users/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // In a real app, you would hash the password and save to database
    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: 'user_' + Date.now(),
        email,
        name,
        tier: 'free',
        scansRemaining: 5
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * POST /api/users/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In a real app, you would verify credentials
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'demo_user',
        email,
        name: 'Demo User',
        tier: 'free',
        scansRemaining: 5
      },
      token: 'demo_token_' + Date.now()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', async (req, res) => {
  try {
    // In a real app, you would get user from database
    res.json({
      success: true,
      user: {
        id: 'demo_user',
        email: 'demo@receiptai.com',
        name: 'Demo User',
        tier: 'free',
        scansRemaining: 5,
        totalScans: 15,
        memberSince: '2026-01-01'
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
