'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardStats {
  totalScans: number
  totalSpent: number
  avgInflation: number
  subscriptionsFound: number
  priceGougingAlerts: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 12,
    totalSpent: 487.32,
    avgInflation: 23.5,
    subscriptionsFound: 7,
    priceGougingAlerts: 18,
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            ← Back to Home
          </Link>
          <Link href="/scan" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700">
            Scan Receipt
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Money Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            The truth about your spending
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-2">📸</div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Scans</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalScans}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Tracked</h3>
            <p className="text-3xl font-bold text-indigo-600">${stats.totalSpent}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-2">🔥</div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Avg Inflation</h3>
            <p className="text-3xl font-bold text-red-600">+{stats.avgInflation}%</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-2">💀</div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Subscriptions</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.subscriptionsFound}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Price Alerts</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.priceGougingAlerts}</p>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Weekly Report Card */}
          <div className="bg-gradient-to-br from-pink-500 to-indigo-600 p-8 rounded-2xl shadow-xl text-white">
            <h2 className="text-2xl font-bold mb-6">📊 Your Money Personality</h2>
            <div className="space-y-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold mb-2">The Aware Spender</h4>
                <p className="text-sm opacity-90">
                  You&apos;re tracking your receipts and catching price increases. You&apos;re paying attention!
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <h4 className="font-semibold mb-2">This Week&apos;s Insight</h4>
                <p className="text-sm opacity-90">
                  You&apos;re paying 23.5% more for groceries than you did in 2022. That&apos;s $114 extra per month.
                </p>
              </div>
              <button className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                📱 Share Your Report Card
              </button>
            </div>
          </div>

          {/* Subscription Grave Digger */}
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2">💀</span>
              Subscription Grave Digger
            </h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Netflix Premium</p>
                  <p className="text-sm text-gray-600">Last used: 3 weeks ago</p>
                </div>
                <p className="font-bold text-red-600">$19.99/mo</p>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Gym Membership</p>
                  <p className="text-sm text-gray-600">Last used: 2 months ago</p>
                </div>
                <p className="font-bold text-red-600">$45.00/mo</p>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Adobe Creative Cloud</p>
                  <p className="text-sm text-gray-600">Last used: Never</p>
                </div>
                <p className="font-bold text-red-600">$54.99/mo</p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <p className="font-bold text-orange-800 mb-1">
                Potential Savings: $119.98/month
              </p>
              <p className="text-sm text-gray-600">
                Connect email to find hidden subscriptions
              </p>
              <button className="mt-3 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                Connect Email (Pro Feature)
              </button>
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">Recent Receipt Scans</h2>
          <div className="space-y-4">
            {[
              { store: 'Metro Grocery', date: 'Feb 20, 2026', amount: 87.32, inflation: 28 },
              { store: 'Tim Hortons', date: 'Feb 19, 2026', amount: 12.45, inflation: 15 },
              { store: 'Costco', date: 'Feb 18, 2026', amount: 156.89, inflation: 22 },
              { store: 'IGA', date: 'Feb 15, 2026', amount: 45.23, inflation: 31 },
            ].map((scan, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900">{scan.store}</p>
                  <p className="text-sm text-gray-600">{scan.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">${scan.amount}</p>
                  <p className="text-sm text-red-600">+{scan.inflation}% inflation</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
