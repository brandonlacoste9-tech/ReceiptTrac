// Mock receipt analysis service
// In production, this would call an AI/OCR API like Google Vision, AWS Textract, or Azure Computer Vision

export interface ReceiptItem {
  name: string
  price: number
  category?: string
}

export interface Receipt {
  merchantName: string
  date: string
  items: ReceiptItem[]
  total: number
  inflationImpact: number
  inflationCost: number
  priceGougingItems: Array<{
    name: string
    price: number
    avgPrice: number
    percentAboveAverage: number
  }>
}

// DEMO DATA: Mock items for demonstration purposes
// In production, these would be extracted from actual receipt images via OCR
const MOCK_ITEMS = [
  { name: 'Organic Eggs (12ct)', price: 8.99, avgPrice: 6.49 },
  { name: 'Whole Milk (1L)', price: 4.29, avgPrice: 3.89 },
  { name: 'Bread - Whole Wheat', price: 3.99, avgPrice: 3.49 },
  { name: 'Chicken Breast (1lb)', price: 7.49, avgPrice: 5.99 },
  { name: 'Bananas (1lb)', price: 0.79, avgPrice: 0.69 },
  { name: 'Coffee - Ground', price: 12.99, avgPrice: 11.49 },
]

const MERCHANTS = [
  'Metro Grocery',
  'IGA',
  'Provigo',
  'Super C',
  'Costco',
  'Walmart',
]

export async function analyzeReceipt(file: File): Promise<Receipt> {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 2000))

  // PRODUCTION TODO:
  // 1. Upload the image to a storage service (S3, Cloud Storage, etc.)
  // 2. Call OCR API to extract text (Google Vision, AWS Textract, Azure CV)
  // 3. Parse the extracted text to identify items and prices
  // 4. Look up historical prices and regional averages from database
  // 5. Calculate inflation impact based on historical data
  
  // DEMO: Generate mock receipt data for demonstration
  const numItems = Math.floor(Math.random() * 4) + 3 // 3-6 items
  const selectedItems = MOCK_ITEMS.sort(() => Math.random() - 0.5).slice(0, numItems)
  
  const items = selectedItems.map(item => ({
    name: item.name,
    price: item.price,
  }))

  const total = items.reduce((sum, item) => sum + item.price, 0)
  
  // Calculate inflation impact (mock: 15-35% increase from 2022)
  const inflationImpact = Math.floor(Math.random() * 20) + 15
  const inflationCost = total * (inflationImpact / 100)

  // Identify price gouging (items significantly above average)
  const priceGougingItems = selectedItems
    .filter(item => ((item.price - item.avgPrice) / item.avgPrice) > 0.15) // More than 15% above average
    .map(item => ({
      name: item.name,
      price: item.price,
      avgPrice: item.avgPrice,
      percentAboveAverage: Math.round(((item.price - item.avgPrice) / item.avgPrice) * 100),
    }))

  const receipt: Receipt = {
    merchantName: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    date: new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    items,
    total,
    inflationImpact,
    inflationCost,
    priceGougingItems,
  }

  return receipt
}

// Function to calculate inflation comparison
export function calculateInflationImpact(
  currentPrice: number,
  historicalPrice: number
): number {
  return ((currentPrice - historicalPrice) / historicalPrice) * 100
}

// Function to check if price is above regional average
export function isPriceGouging(
  price: number,
  regionalAverage: number,
  threshold: number = 0.15
): boolean {
  return (price - regionalAverage) / regionalAverage > threshold
}
