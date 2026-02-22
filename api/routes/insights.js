const express = require('express');
const router = express.Router();
const insightsService = require('../services/insightsService');

/**
 * GET /api/insights/inflation
 * Get inflation comparison data
 */
router.get('/inflation', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo';
    const insights = await insightsService.getInflationInsights(userId);
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Inflation insights error:', error);
    res.status(500).json({ error: 'Failed to fetch inflation insights' });
  }
});

/**
 * GET /api/insights/money-personality
 * Get weekly Money Personality report
 */
router.get('/money-personality', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo';
    const report = await insightsService.generateMoneyPersonality(userId);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Money personality error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * GET /api/insights/price-alerts
 * Get price gouging alerts
 */
router.get('/price-alerts', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo';
    const alerts = await insightsService.getPriceAlerts(userId);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Price alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch price alerts' });
  }
});

/**
 * GET /api/insights/subscriptions
 * Detect hidden subscriptions
 */
router.get('/subscriptions', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo';
    const subscriptions = await insightsService.detectSubscriptions(userId);
    
    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Subscription detection error:', error);
    res.status(500).json({ error: 'Failed to detect subscriptions' });
  }
});

module.exports = router;
