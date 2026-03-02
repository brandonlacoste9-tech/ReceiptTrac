'use client'

import { Receipt } from '@/lib/services/receiptService'

interface ReceiptDetailsProps {
  receipt: Receipt
  onNewScan: () => void
}

export default function ReceiptDetails({ receipt, onNewScan }: ReceiptDetailsProps) {
  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Receipt Analysis',
        text: `I'm paying ${receipt.inflationImpact}% more than in 2022! Check out ReceiptAI`,
        url: window.location.origin
      }).catch(() => {
        // Silently handle share cancellation or errors
      })
    } else {
      // Fallback for browsers without Web Share API
      const shareText = `I'm paying ${receipt.inflationImpact}% more than in 2022! Check out ReceiptAI at ${window.location.origin}`
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Share text copied to clipboard!')
      }).catch(() => {
        alert('Please share manually: ' + shareText)
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {receipt.merchantName}
            </h2>
            <p className="text-gray-600">{receipt.date}</p>
          </div>
          <button
            onClick={onNewScan}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Scan Another
          </button>
        </div>

        {/* Key Insights */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
            <div className="text-3xl mb-2">🔥</div>
            <h3 className="font-bold text-lg mb-1">Inflation Impact</h3>
            <p className="text-3xl font-bold text-red-600">
              +{receipt.inflationImpact}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ${receipt.inflationCost.toFixed(2)} more than 2022
            </p>
          </div>

          <div className={`p-6 rounded-xl border ${
            receipt.priceGougingItems.length > 0 
              ? 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200'
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
          }`}>
            <div className="text-3xl mb-2">
              {receipt.priceGougingItems.length > 0 ? '⚠️' : '✓'}
            </div>
            <h3 className="font-bold text-lg mb-1">Price Analysis</h3>
            <p className="text-3xl font-bold text-orange-600">
              {receipt.priceGougingItems.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {receipt.priceGougingItems.length > 0 
                ? 'items above market rate'
                : 'prices look fair'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold text-lg mb-1">Total Spent</h3>
            <p className="text-3xl font-bold text-indigo-600">
              ${receipt.total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {receipt.items.length} items purchased
            </p>
          </div>
        </div>

        {/* Price Gouging Alerts */}
        {receipt.priceGougingItems.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-xl mb-4 flex items-center">
              <span className="mr-2">🚨</span>
              Price Gouging Alerts
            </h3>
            <div className="space-y-3">
              {receipt.priceGougingItems.map((item: any, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Regional avg: ${item.avgPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">
                        ${item.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-orange-600">
                        +{item.percentAboveAverage}% above avg
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Line Items */}
        <div className="mb-8">
          <h3 className="font-bold text-xl mb-4">Receipt Items</h3>
          <div className="space-y-2">
            {receipt.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-semibold">${item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-3 font-bold text-lg">
              <span>Total</span>
              <span className="text-indigo-600">${receipt.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <div className="text-center">
          <button
            onClick={share}
            className="bg-gradient-to-r from-pink-500 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-pink-600 hover:to-indigo-700 transition-all transform hover:scale-105"
          >
            📱 Share Your Money Truth
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Let people know what you&apos;re really paying
          </p>
        </div>
      </div>
    </div>
  )
}
