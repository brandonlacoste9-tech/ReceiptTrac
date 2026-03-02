const express = require('express');
const router = express.Router();
const multer = require('multer');
const receiptService = require('../services/receiptService');
const { sampleReceipts } = require('../services/demoData');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * POST /api/receipts/load-demo
 * Load demo receipts for testing
 */
router.post('/load-demo', async (req, res) => {
  try {
    const userId = req.body.userId || 'demo';
    
    // Load demo receipts
    const loadedReceipts = sampleReceipts.map(receipt => ({
      ...receipt,
      userId
    }));
    
    res.json({
      success: true,
      message: `Loaded ${loadedReceipts.length} demo receipts`,
      data: loadedReceipts
    });
  } catch (error) {
    console.error('Load demo error:', error);
    res.status(500).json({ error: 'Failed to load demo data' });
  }
});

/**
 * POST /api/receipts/scan
 * Upload and scan a receipt image
 */
router.post('/scan', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt image provided' });
    }

    const userId = req.body.userId || 'demo';
    
    // Process the receipt
    const result = await receiptService.scanReceipt(req.file.buffer, userId);
    
    res.json({
      success: true,
      message: 'Receipt scanned successfully',
      data: result
    });
  } catch (error) {
    console.error('Receipt scan error:', error);
    res.status(500).json({ 
      error: 'Failed to scan receipt',
      message: error.message 
    });
  }
});

/**
 * GET /api/receipts
 * Get all receipts for a user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo';
    const receipts = await receiptService.getUserReceipts(userId);
    
    res.json({
      success: true,
      data: receipts
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

/**
 * GET /api/receipts/:id
 * Get a specific receipt
 */
router.get('/:id', async (req, res) => {
  try {
    const receipt = await receiptService.getReceiptById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

/**
 * DELETE /api/receipts/:id
 * Delete a receipt
 */
router.delete('/:id', async (req, res) => {
  try {
    await receiptService.deleteReceipt(req.params.id);
    
    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Delete receipt error:', error);
    res.status(500).json({ error: 'Failed to delete receipt' });
  }
});

module.exports = router;
