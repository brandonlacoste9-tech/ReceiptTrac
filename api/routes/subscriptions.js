const express = require('express');
const router = express.Router();

/**
 * POST /api/subscriptions/upgrade
 * Upgrade to Pro tier
 */
router.post('/upgrade', async (req, res) => {
  try {
    const { userId, paymentMethod } = req.body;
    
    // In a real app, you would process payment with Stripe
    res.json({
      success: true,
      message: 'Successfully upgraded to Pro',
      subscription: {
        userId,
        tier: 'pro',
        price: 4.99,
        startDate: new Date().toISOString(),
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

/**
 * GET /api/subscriptions/status
 * Get subscription status
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo';
    
    res.json({
      success: true,
      subscription: {
        tier: 'free',
        scansUsed: 3,
        scansRemaining: 2,
        scanLimit: 5,
        nextReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

module.exports = router;
