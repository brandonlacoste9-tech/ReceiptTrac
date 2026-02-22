/**
 * Demo Data Generator for ReceiptAI
 * Generates sample receipts to demonstrate the app's features
 */

const sampleReceipts = [
  {
    id: 'receipt_demo_1',
    userId: 'demo',
    storeName: 'WALMART SUPERCENTER',
    date: '02/15/2026',
    items: [
      { name: 'MILK ORGANIC 2%', price: 4.99, category: 'dairy' },
      { name: 'EGGS LARGE 12CT', price: 4.39, category: 'dairy' },
      { name: 'BREAD WHOLE WHEAT', price: 3.29, category: 'bakery' },
      { name: 'CHICKEN BREAST', price: 6.99, category: 'meat' },
      { name: 'APPLES GALA 3LB', price: 5.49, category: 'produce' }
    ],
    subtotal: 25.15,
    tax: 2.01,
    total: 27.16,
    itemCount: 5,
    scannedAt: '2026-02-15T10:30:00.000Z'
  },
  {
    id: 'receipt_demo_2',
    userId: 'demo',
    storeName: 'STARBUCKS',
    date: '02/18/2026',
    items: [
      { name: 'CAFFE LATTE GRANDE', price: 6.50, category: 'beverages' },
      { name: 'BAGEL EVERYTHING', price: 3.25, category: 'bakery' }
    ],
    subtotal: 9.75,
    tax: 0.78,
    total: 10.53,
    itemCount: 2,
    scannedAt: '2026-02-18T08:15:00.000Z'
  },
  {
    id: 'receipt_demo_3',
    userId: 'demo',
    storeName: 'SHELL GAS STATION',
    date: '02/19/2026',
    items: [
      { name: 'UNLEADED GAS', price: 65.40, category: 'fuel' }
    ],
    subtotal: 65.40,
    tax: 0,
    total: 65.40,
    itemCount: 1,
    scannedAt: '2026-02-19T18:45:00.000Z'
  },
  {
    id: 'receipt_demo_4',
    userId: 'demo',
    storeName: 'WHOLE FOODS',
    date: '02/20/2026',
    items: [
      { name: 'ORGANIC SPINACH', price: 4.99, category: 'produce' },
      { name: 'QUINOA 1LB', price: 5.99, category: 'general' },
      { name: 'ALMOND MILK', price: 4.49, category: 'dairy' },
      { name: 'AVOCADOS 4CT', price: 6.99, category: 'produce' }
    ],
    subtotal: 22.46,
    tax: 1.80,
    total: 24.26,
    itemCount: 4,
    scannedAt: '2026-02-20T14:20:00.000Z'
  },
  {
    id: 'receipt_demo_5',
    userId: 'demo',
    storeName: 'STARBUCKS',
    date: '02/21/2026',
    items: [
      { name: 'CAFFE LATTE GRANDE', price: 6.50, category: 'beverages' },
      { name: 'CROISSANT', price: 3.95, category: 'bakery' }
    ],
    subtotal: 10.45,
    tax: 0.84,
    total: 11.29,
    itemCount: 2,
    scannedAt: '2026-02-21T07:30:00.000Z'
  }
];

/**
 * Load demo data into receipt service
 */
function loadDemoData(receiptService) {
  console.log('Loading demo receipts...');
  
  // This would populate the in-memory storage
  // For actual implementation, you'd call the service methods
  sampleReceipts.forEach(receipt => {
    console.log(`- ${receipt.storeName} ($${receipt.total})`);
  });
  
  console.log(`✅ Loaded ${sampleReceipts.length} demo receipts`);
  return sampleReceipts;
}

module.exports = {
  sampleReceipts,
  loadDemoData
};
