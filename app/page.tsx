import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            🧠 ReceiptAI
          </h1>
          <h2 className="text-3xl font-semibold text-indigo-600 mb-6">
            The Anti-Gaslighting Money App
          </h2>
          <p className="text-2xl text-gray-700 mb-8">
            &ldquo;Stop wondering where your money went. Your receipts tell the truth.&rdquo;
          </p>
          <Link
            href="/scan"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Start Scanning Receipts 📸
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📸</div>
            <h3 className="text-xl font-bold mb-3">Snap → Scan → Story</h3>
            <p className="text-gray-600">
              Photo any receipt - AI extracts every line item instantly. Restaurant, grocery, gas, anything.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Inflation Tracker</h3>
            <p className="text-gray-600">
              &ldquo;This grocery run cost you $23 more than it would have in 2022&rdquo; - See the real impact.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🚨</div>
            <h3 className="text-xl font-bold mb-3">Price Gouging Alerts</h3>
            <p className="text-gray-600">
              Flags items priced above regional averages. Know when you&apos;re getting ripped off.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">💀</div>
            <h3 className="text-xl font-bold mb-3">Subscription Grave Digger</h3>
            <p className="text-gray-600">
              Connects to email, surfaces forgotten recurring charges you didn&apos;t even know existed.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3">Your Money Personality</h3>
            <p className="text-gray-600">
              Weekly shareable report card. Make your financial truth go viral.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">💥</div>
            <h3 className="text-xl font-bold mb-3">Shareable Rage Content</h3>
            <p className="text-gray-600">
              &ldquo;I&apos;m paying 47% more for eggs than 2021&rdquo; - Posts that people actually want to share.
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <p className="text-4xl font-bold text-indigo-600 mb-6">$0</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  5 scans per month
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Basic inflation tracking
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Price comparisons
                </li>
              </ul>
              <Link
                href="/scan"
                className="block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-xl shadow-xl text-white border-2 border-indigo-700">
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <p className="text-4xl font-bold mb-6">$4.99<span className="text-xl">/month</span></p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Unlimited scans
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Advanced insights & analytics
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Subscription detector
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Weekly report cards
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Historical price data
                </li>
              </ul>
              <button className="block w-full bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>

        {/* Why It Goes Viral */}
        <div className="bg-gradient-to-r from-pink-50 to-indigo-50 p-12 rounded-2xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Why ReceiptAI Goes Viral 💥
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start">
              <span className="text-2xl mr-4">📱</span>
              <div>
                <h4 className="font-bold text-lg mb-2">Shareable Rage Content</h4>
                <p className="text-gray-700">Posts about price increases spread like wildfire on social media</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-4">✨</span>
              <div>
                <h4 className="font-bold text-lg mb-2">Satisfying UI</h4>
                <p className="text-gray-700">Receipt scanning is oddly satisfying - people love the instant gratification</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-4">🎯</span>
              <div>
                <h4 className="font-bold text-lg mb-2">Zero Competition</h4>
                <p className="text-gray-700">Mint/YNAB are budgeting. This is economic journalism for your wallet</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-4">🌍</span>
              <div>
                <h4 className="font-bold text-lg mb-2">Built for Everyone</h4>
                <p className="text-gray-700">Starting with Quebec, expanding nationally - everyone is economically anxious</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
