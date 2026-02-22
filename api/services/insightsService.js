const receiptService = require('./receiptService');

// Historical price data for inflation tracking (2022 baseline)
const priceBaseline2022 = {
  'eggs': 2.99,
  'milk': 3.49,
  'bread': 2.29,
  'gas': 3.89,
  'chicken': 4.99,
  'coffee': 4.50
};

// Current average prices (2026)
const currentAveragePrices = {
  'eggs': 4.39,
  'milk': 4.99,
  'bread': 3.29,
  'gas': 5.49,
  'chicken': 6.99,
  'coffee': 6.50
};

// Regional price thresholds for gouging detection
const regionalPriceThresholds = {
  'eggs': 5.00,
  'milk': 5.50,
  'bread': 4.00,
  'gas': 6.00,
  'chicken': 8.00,
  'coffee': 7.50
};

/**
 * Get inflation insights comparing current spending to 2022
 */
async function getInflationInsights(userId) {
  const receipts = await receiptService.getUserReceipts(userId);
  
  if (receipts.length === 0) {
    return {
      message: 'No receipts to analyze yet',
      totalInflationImpact: 0,
      items: []
    };
  }
  
  // Calculate inflation impact
  let totalCurrent = 0;
  let totalIfIn2022 = 0;
  const inflatedItems = [];
  
  receipts.forEach(receipt => {
    receipt.items.forEach(item => {
      const itemKey = findPriceKey(item.name);
      if (itemKey) {
        totalCurrent += item.price;
        const baseline = priceBaseline2022[itemKey] || item.price;
        totalIfIn2022 += baseline;
        
        const increase = ((item.price - baseline) / baseline * 100).toFixed(1);
        if (increase > 10) {
          inflatedItems.push({
            name: item.name,
            currentPrice: item.price,
            price2022: baseline,
            increasePercent: increase,
            extraCost: (item.price - baseline).toFixed(2)
          });
        }
      }
    });
  });
  
  const totalInflationImpact = (totalCurrent - totalIfIn2022).toFixed(2);
  const inflationPercent = totalIfIn2022 > 0 
    ? ((totalCurrent - totalIfIn2022) / totalIfIn2022 * 100).toFixed(1)
    : 0;
  
  return {
    totalInflationImpact,
    inflationPercent,
    message: `You're paying $${totalInflationImpact} more than you would have in 2022`,
    shareableMessage: `I'm paying ${inflationPercent}% more for groceries than in 2021 💸 #InflationTruth #ReceiptAI`,
    topInflatedItems: inflatedItems.slice(0, 5)
  };
}

/**
 * Generate Money Personality weekly report
 */
async function generateMoneyPersonality(userId) {
  const receipts = await receiptService.getUserReceipts(userId);
  
  if (receipts.length === 0) {
    return {
      personality: 'Just Getting Started',
      message: 'Upload more receipts to discover your money personality!'
    };
  }
  
  // Analyze spending patterns
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const avgReceiptAmount = totalSpent / receipts.length;
  
  // Category breakdown
  const categorySpending = {};
  receipts.forEach(receipt => {
    receipt.items.forEach(item => {
      categorySpending[item.category] = (categorySpending[item.category] || 0) + item.price;
    });
  });
  
  // Determine personality type
  let personality = '';
  let emoji = '';
  let description = '';
  
  if (avgReceiptAmount > 50 && categorySpending['beverages'] > 20) {
    personality = 'The Coffee Connoisseur';
    emoji = '☕';
    description = 'You fuel your day with premium coffee. Those lattes add up!';
  } else if (categorySpending['produce'] > categorySpending['meat']) {
    personality = 'The Health Conscious';
    emoji = '🥗';
    description = 'You prioritize fresh produce. Your body thanks you!';
  } else if (receipts.length > 10) {
    personality = 'The Frequent Shopper';
    emoji = '🛒';
    description = 'You visit stores often. Consider bulk buying to save!';
  } else {
    personality = 'The Budget Planner';
    emoji = '💰';
    description = 'You shop strategically and track every dollar!';
  }
  
  return {
    personality,
    emoji,
    description,
    weeklyStats: {
      totalSpent: totalSpent.toFixed(2),
      receiptsScanned: receipts.length,
      avgReceiptAmount: avgReceiptAmount.toFixed(2),
      topCategory: Object.keys(categorySpending).reduce((a, b) => 
        categorySpending[a] > categorySpending[b] ? a : b, 'general'
      )
    },
    shareableCard: {
      title: `I'm a ${personality} ${emoji}`,
      stats: [
        `💵 Spent $${totalSpent.toFixed(2)} this week`,
        `📱 Scanned ${receipts.length} receipts`,
        `🎯 Avg purchase: $${avgReceiptAmount.toFixed(2)}`
      ],
      hashtags: '#MoneyPersonality #ReceiptAI #FinancialTruth'
    }
  };
}

/**
 * Detect price gouging by comparing to regional averages
 */
async function getPriceAlerts(userId) {
  const receipts = await receiptService.getUserReceipts(userId);
  const alerts = [];
  
  receipts.forEach(receipt => {
    receipt.items.forEach(item => {
      const itemKey = findPriceKey(item.name);
      if (itemKey) {
        const threshold = regionalPriceThresholds[itemKey];
        const average = currentAveragePrices[itemKey];
        
        if (item.price > threshold) {
          alerts.push({
            item: item.name,
            paidPrice: item.price,
            regionalAverage: average,
            overchargeAmount: (item.price - average).toFixed(2),
            overchargePercent: ((item.price - average) / average * 100).toFixed(1),
            store: receipt.storeName,
            date: receipt.date,
            severity: item.price > threshold * 1.2 ? 'high' : 'medium'
          });
        }
      }
    });
  });
  
  return {
    alertCount: alerts.length,
    alerts: alerts.sort((a, b) => b.overchargeAmount - a.overchargeAmount).slice(0, 10),
    message: alerts.length > 0 
      ? `⚠️ Found ${alerts.length} items priced above regional average`
      : '✅ All items fairly priced'
  };
}

/**
 * Detect recurring subscriptions from receipts
 */
async function detectSubscriptions(userId) {
  const receipts = await receiptService.getUserReceipts(userId);
  
  // Group receipts by store name
  const storeFrequency = {};
  receipts.forEach(receipt => {
    const store = receipt.storeName.toLowerCase();
    if (!storeFrequency[store]) {
      storeFrequency[store] = [];
    }
    storeFrequency[store].push({
      date: receipt.date,
      amount: receipt.total
    });
  });
  
  // Detect potential subscriptions (recurring charges)
  const subscriptions = [];
  Object.keys(storeFrequency).forEach(store => {
    const charges = storeFrequency[store];
    if (charges.length >= 2) {
      // Check if amounts are similar (within 10%)
      const amounts = charges.map(c => c.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const isRecurring = amounts.every(amt => Math.abs(amt - avgAmount) / avgAmount < 0.1);
      
      if (isRecurring) {
        subscriptions.push({
          merchant: store,
          frequency: charges.length,
          averageAmount: avgAmount.toFixed(2),
          totalSpent: (avgAmount * charges.length).toFixed(2),
          lastCharged: charges[charges.length - 1].date,
          status: 'active'
        });
      }
    }
  });
  
  return {
    subscriptionCount: subscriptions.length,
    subscriptions,
    totalMonthlySpend: subscriptions.reduce((sum, s) => sum + parseFloat(s.averageAmount), 0).toFixed(2),
    message: subscriptions.length > 0
      ? `Found ${subscriptions.length} potential recurring charges`
      : 'No recurring subscriptions detected yet'
  };
}

/**
 * Helper function to find matching price key from item name
 */
function findPriceKey(itemName) {
  const name = itemName.toLowerCase();
  const keys = Object.keys(priceBaseline2022);
  
  for (const key of keys) {
    if (name.includes(key)) {
      return key;
    }
  }
  
  return null;
}

module.exports = {
  getInflationInsights,
  generateMoneyPersonality,
  getPriceAlerts,
  detectSubscriptions
};
