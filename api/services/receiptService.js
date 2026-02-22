const Tesseract = require('tesseract.js');

// In-memory storage for demo purposes
let receipts = [];

/**
 * Scan and extract data from receipt image
 */
async function scanReceipt(imageBuffer, userId) {
  try {
    // Perform OCR on the receipt image
    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: m => console.log('OCR Progress:', m)
      }
    );
    
    // Parse the receipt text
    const parsedData = parseReceiptText(text);
    
    // Create receipt record
    const receipt = {
      id: 'receipt_' + Date.now(),
      userId,
      rawText: text,
      ...parsedData,
      scannedAt: new Date().toISOString(),
      imageData: imageBuffer.toString('base64')
    };
    
    // Store receipt
    receipts.push(receipt);
    
    return receipt;
  } catch (error) {
    console.error('Receipt scanning error:', error);
    throw new Error('Failed to scan receipt: ' + error.message);
  }
}

/**
 * Parse receipt text to extract structured data
 */
function parseReceiptText(text) {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Extract store name (usually first line)
  const storeName = lines[0] || 'Unknown Store';
  
  // Extract date
  const dateMatch = text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
  const date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];
  
  // Extract items and prices
  const items = [];
  const priceRegex = /\$?\d+\.\d{2}/g;
  
  for (const line of lines) {
    const prices = line.match(priceRegex);
    if (prices && prices.length > 0) {
      const price = parseFloat(prices[prices.length - 1].replace('$', ''));
      const itemName = line.replace(priceRegex, '').trim();
      
      if (itemName && price > 0) {
        items.push({
          name: itemName,
          price: price,
          category: categorizeItem(itemName)
        });
      }
    }
  }
  
  // Calculate total
  const total = items.reduce((sum, item) => sum + item.price, 0);
  
  // Extract tax if present
  const taxMatch = text.match(/tax[:\s]+\$?(\d+\.\d{2})/i);
  const tax = taxMatch ? parseFloat(taxMatch[1]) : 0;
  
  return {
    storeName,
    date,
    items,
    subtotal: total - tax,
    tax,
    total,
    itemCount: items.length
  };
}

/**
 * Categorize items based on keywords
 */
function categorizeItem(itemName) {
  const name = itemName.toLowerCase();
  
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt')) {
    return 'dairy';
  } else if (name.includes('bread') || name.includes('bagel') || name.includes('cereal')) {
    return 'bakery';
  } else if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || name.includes('fish')) {
    return 'meat';
  } else if (name.includes('apple') || name.includes('banana') || name.includes('orange') || name.includes('fruit')) {
    return 'produce';
  } else if (name.includes('gas') || name.includes('fuel')) {
    return 'fuel';
  } else if (name.includes('coffee') || name.includes('latte') || name.includes('tea')) {
    return 'beverages';
  }
  
  return 'general';
}

/**
 * Get all receipts for a user
 */
async function getUserReceipts(userId) {
  return receipts.filter(r => r.userId === userId);
}

/**
 * Get a specific receipt by ID
 */
async function getReceiptById(receiptId) {
  return receipts.find(r => r.id === receiptId);
}

/**
 * Delete a receipt
 */
async function deleteReceipt(receiptId) {
  receipts = receipts.filter(r => r.id !== receiptId);
}

module.exports = {
  scanReceipt,
  getUserReceipts,
  getReceiptById,
  deleteReceipt
};
