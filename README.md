# 🧠 ReceiptAI - The Anti-Gaslighting Money App

**"Stop wondering where your money went. Your receipts tell the truth."**

## 🎯 The Vision

ReceiptAI is the financial truth machine for 2026. In a world of economic anxiety, inflation, hidden fees, and subscription creep, people FEEL broke but can't prove why. ReceiptAI reveals exactly where your money goes and why you're paying more.

## ✨ Core Features

### 📸 Snap → Scan → Story
- Photo any receipt (restaurant, grocery, gas)
- AI extracts every line item instantly
- Clean, satisfying UI that makes scanning addictive

### 🔥 Inflation Tracker
- Real-time comparison to historical prices
- "This grocery run cost you $23 more than it would have in 2022"
- See the actual dollar impact of inflation on YOUR purchases

### ⚠️ Price Gouging Alerts
- Flags items priced above regional averages
- Know exactly when you're getting ripped off
- Data-backed proof of unfair pricing

### 💀 Subscription Grave Digger
- Connects to email to surface forgotten recurring charges
- Find subscriptions you didn't even know existed
- Track potential savings from unused services

### 🎯 Your Money Personality
- Weekly shareable report card
- The viral hook that makes people share
- Turn your financial truth into social content

## 💥 Why It Goes Viral

- **Shareable rage content** - "I'm paying 47% more for eggs than 2021" posts everywhere
- **Satisfying UI** - Receipt scanning is oddly satisfying, like ASOS try-on
- **Zero competition** - Mint/YNAB are budgeting. This is economic journalism for your wallet
- **Quebec-first strategy** - Localize for QC market first, then expand nationally

## 💰 Monetization Stack

| Layer | Revenue |
|-------|---------|
| Freemium (5 scans/mo) | User acquisition |
| Pro ($4.99/mo) | Unlimited scans + advanced insights |
| Brand partnerships | Grocery chains want this data |
| API licensing | Banks, fintech companies |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/brandonlacoste9-tech/ReceiptTrac.git
cd ReceiptTrac

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **OCR/AI**: (Placeholder - integrate with Google Vision, AWS Textract, or Azure CV)
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
ReceiptTrac/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── scan/              # Receipt scanning interface
│   ├── dashboard/         # User dashboard
│   └── api/               # API routes
├── components/
│   └── ui/                # Reusable UI components
├── lib/
│   └── services/          # Business logic and API integrations
├── public/                # Static assets
└── README.md
```

## 🎨 Key Pages

- **`/`** - Landing page with value proposition and pricing
- **`/scan`** - Receipt upload and scanning interface
- **`/dashboard`** - User dashboard with insights and analytics

## 🔧 Development

### Build for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Landing page with value proposition
- [x] Receipt scanning interface
- [x] Mock AI analysis with inflation tracking
- [x] Price gouging detection
- [x] Dashboard with insights
- [x] Freemium tier tracking

### Phase 2: Enhanced Features
- [ ] Real OCR/AI integration (Google Vision API)
- [ ] User authentication and data persistence
- [ ] Email integration for subscription detection
- [ ] Historical price database
- [ ] Regional price comparison data
- [ ] Payment processing for Pro tier

### Phase 3: Viral Features
- [ ] Social sharing optimizations
- [ ] Weekly report card generation
- [ ] Quebec localization (French)
- [ ] Mobile app (React Native)
- [ ] Push notifications for price alerts

### Phase 4: Data & Partnerships
- [ ] Analytics dashboard for brands
- [ ] API for third-party integrations
- [ ] Partnership with grocery chains
- [ ] Bank/fintech API licensing

## 🌍 Localization

Starting with Quebec market:
- French language support
- Quebec-specific regional pricing
- Local merchant database
- Cultural adaptation

## 📊 Analytics & Insights

The app tracks:
- Receipt scans per user
- Total spending tracked
- Average inflation impact
- Most price-gouged items
- Regional price variations
- User engagement metrics

## 🔒 Privacy & Security

- User data is encrypted at rest
- Receipts processed securely
- No sharing of personal data with third parties
- GDPR/CCPA compliant (planned)

## 🤝 Contributing

This is a proprietary project. For collaboration opportunities, please contact the repository owner.

## 📄 License

See [LICENSE](LICENSE) file for details.

## 📞 Contact

For inquiries about ReceiptAI, please open an issue or contact through GitHub.

---

**ReceiptAI** - Making financial truth visible, one receipt at a time. 🔥
