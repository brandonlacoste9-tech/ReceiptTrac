'use client'

import { useState } from 'react'
import { analyzeReceipt } from '@/lib/services/receiptService'

interface ReceiptScannerProps {
  onScanComplete: (receipt: any) => void
  canScan: boolean
}

export default function ReceiptScanner({ onScanComplete, canScan }: ReceiptScannerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = async (file: File) => {
    if (!canScan) {
      alert('You have reached your free scan limit. Please upgrade to Pro for unlimited scans.')
      return
    }

    setIsUploading(true)
    try {
      // Simulate API call with timeout
      const receipt = await analyzeReceipt(file)
      onScanComplete(receipt)
    } catch (error) {
      alert('Error processing receipt. Please try again.')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  if (isUploading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Analyzing Receipt...
          </h3>
          <p className="text-gray-600">
            AI is extracting line items and calculating insights
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Scan Your Receipt 📸
        </h1>
        <p className="text-xl text-gray-600">
          Upload or drop a photo of any receipt to reveal the truth about your spending
        </p>
      </div>

      <div
        className={`bg-white rounded-2xl shadow-xl p-12 border-4 border-dashed transition-colors ${
          isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
        } ${!canScan ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="receipt-upload"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInput}
          disabled={!canScan}
        />
        
        <label
          htmlFor="receipt-upload"
          className={`block text-center ${canScan ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        >
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Drop receipt image here
          </h3>
          <p className="text-gray-600 mb-6">
            or click to browse from your device
          </p>
          <div className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            Choose File
          </div>
        </label>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">What you'll get:</h4>
          <ul className="space-y-2 text-left">
            <li className="flex items-center text-gray-700">
              <span className="text-green-500 mr-2">✓</span>
              Instant line-by-line extraction
            </li>
            <li className="flex items-center text-gray-700">
              <span className="text-green-500 mr-2">✓</span>
              Inflation impact calculation
            </li>
            <li className="flex items-center text-gray-700">
              <span className="text-green-500 mr-2">✓</span>
              Price gouging alerts
            </li>
            <li className="flex items-center text-gray-700">
              <span className="text-green-500 mr-2">✓</span>
              Shareable insights
            </li>
          </ul>
        </div>
      </div>

      {!canScan && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-orange-800 font-semibold">
            You&apos;ve reached your free scan limit
          </p>
          <button className="mt-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Upgrade to Pro for Unlimited Scans
          </button>
        </div>
      )}
    </div>
  )
}
