'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReceiptScanner from '@/components/ui/ReceiptScanner'
import ReceiptDetails from '@/components/ui/ReceiptDetails'
import { Receipt } from '@/lib/services/receiptService'

export default function ScanPage() {
  const [scannedReceipt, setScannedReceipt] = useState<Receipt | null>(null)
  const [scanCount, setScanCount] = useState(0)
  const maxFreeScans = 5

  const handleScanComplete = (receipt: Receipt) => {
    setScannedReceipt(receipt)
    setScanCount(prev => prev + 1)
  }

  const handleNewScan = () => {
    setScannedReceipt(null)
  }

  const remainingScans = maxFreeScans - scanCount

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            ← Back to Home
          </Link>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            View Dashboard →
          </Link>
        </div>

        {/* Scan Counter */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white px-6 py-3 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Free Tier</p>
            <p className="text-2xl font-bold text-indigo-600">
              {remainingScans} / {maxFreeScans} scans remaining
            </p>
            {remainingScans <= 2 && remainingScans > 0 && (
              <p className="text-sm text-orange-600 mt-1">
                Almost out! Upgrade to Pro for unlimited scans
              </p>
            )}
            {remainingScans === 0 && (
              <button className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {!scannedReceipt ? (
          <ReceiptScanner 
            onScanComplete={handleScanComplete} 
            canScan={remainingScans > 0}
          />
        ) : (
          <ReceiptDetails 
            receipt={scannedReceipt} 
            onNewScan={handleNewScan}
          />
        )}
      </div>
    </main>
  )
}
