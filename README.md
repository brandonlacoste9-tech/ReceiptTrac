# ReceiptAI - The Anti-Gaslighting Money App 🧾

**"Stop wondering where your money went. Your receipts tell the truth."**

ReceiptAI is a viral financial tracking app designed for 2026 that reveals inflation, detects price gouging, tracks subscriptions, and shows you exactly where every dollar goes. Built with AI-powered OCR receipt scanning and intelligent financial insights.

## 🎯 Core Features

### 📸 Snap → Scan → Story
- **AI-Powered OCR**: Photo any receipt (restaurant, grocery, gas) — AI extracts every line item instantly using Tesseract.js
- **Instant Analysis**: Automatic categorization and data extraction
- **Beautiful UI**: Satisfying, intuitive receipt scanning experience

### 📈 Inflation Tracker
- **Historical Comparison**: "This grocery run cost you $23 more than it would have in 2022"
- **Real-Time Insights**: Compare current prices to 2022 baseline
- **Shareable Stats**: Generate viral-ready inflation impact statements

### ⚠️ Price Gouging Alerts
- **Regional Price Comparison**: Flags items priced above regional averages
- **Smart Detection**: Identifies overpriced items automatically
- **Severity Levels**: High/medium alerts based on price deviation

### 💀 Subscription Grave Digger
- **Recurring Charge Detection**: Automatically identifies forgotten subscriptions
- **Email Integration**: Connects to surface hidden recurring charges
- **Monthly Spending Tracker**: See total subscription costs at a glance

### 🎭 Your Money Personality
- **Weekly Report Cards**: Personalized spending personality analysis
- **Shareable Social Cards**: Create viral content from your financial data
- **Categories**: Coffee Connoisseur, Health Conscious, Frequent Shopper, Budget Planner, and more

### 🔥 Viral Content Features
- Shareable rage content: "I'm paying 47% more for eggs than 2021"
- Social media ready graphics and stats
- Quebec localization support for targeted market penetration

## 💰 Monetization Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | • 5 receipt scans per month<br>• Basic inflation insights<br>• Price alerts<br>• Money personality report |
| **Pro** | $4.99/mo | • Unlimited receipt scans<br>• Advanced analytics & trends<br>• Subscription tracking<br>• Export data & reports<br>• Priority support<br>• Quebec localization |

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn package manager
- (Optional) MongoDB for persistent data storage

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/brandonlacoste9-tech/ReceiptTrac.git
   cd ReceiptTrac
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   - Database connection (MongoDB URI)
   - JWT secret for authentication
   - Stripe keys for payments
   - Email configuration for subscription detection
   - API keys for price comparison services

5. **Start the development servers**

   **Option A: Run both servers concurrently**
   ```bash
   # Terminal 1 - Backend server
   npm run server
   
   # Terminal 2 - Frontend client
   npm run client
   ```
   
   **Option B: Production build**
   ```bash
   npm run build
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
ReceiptTrac/
├── api/
│   ├── routes/          # API endpoint definitions
│   │   ├── receipts.js  # Receipt scanning and management
│   │   ├── users.js     # User authentication
│   │   ├── subscriptions.js  # Subscription management
│   │   └── insights.js  # Financial insights and analytics
│   ├── services/        # Business logic layer
│   │   ├── receiptService.js   # OCR and receipt processing
│   │   └── insightsService.js  # Inflation, alerts, personality
│   ├── models/          # Database models (MongoDB schemas)
│   └── middleware/      # Authentication and validation
├── client/              # React frontend application
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Reusable React components
│       │   └── Header.js
│       ├── pages/       # Page components
│       │   ├── HomePage.js      # Landing page
│       │   ├── ScanPage.js      # Receipt scanning
│       │   ├── DashboardPage.js # User dashboard
│       │   └── InsightsPage.js  # Financial insights
│       ├── services/    # API client
│       │   └── api.js
│       └── styles/      # CSS styling
├── server.js            # Express server entry point
├── package.json         # Backend dependencies
└── README.md            # This file
```

## 🛠️ Technology Stack

### Backend
- **Node.js + Express**: RESTful API server
- **Tesseract.js**: AI-powered OCR for receipt scanning
- **MongoDB + Mongoose**: Database and ORM
- **Multer**: File upload handling
- **JWT**: Authentication tokens
- **Stripe**: Payment processing
- **Nodemailer**: Email integration for subscription detection

### Frontend
- **React 18**: UI framework
- **React Router**: Navigation and routing
- **Axios**: HTTP client for API calls
- **React Dropzone**: Drag-and-drop file uploads
- **Recharts**: Data visualization (optional)
- **CSS3**: Modern styling with gradients and animations

## 📱 Usage Guide

### Scanning Your First Receipt

1. Navigate to the **Scan Receipt** page
2. Drag and drop a receipt image or click to browse
3. Wait for AI processing (typically 3-5 seconds)
4. Review extracted data and view instant insights
5. Navigate to **Insights** to see your financial analysis

### Understanding Your Money Personality

Your Money Personality is calculated based on:
- **Average receipt amount**: Determines spending habits
- **Purchase frequency**: Shows shopping patterns
- **Category preferences**: Reveals spending priorities
- **Top categories**: Identifies where most money goes

Types include:
- ☕ **Coffee Connoisseur**: Premium beverage enthusiast
- 🥗 **Health Conscious**: Fresh produce prioritizer
- 🛒 **Frequent Shopper**: Regular store visitor
- 💰 **Budget Planner**: Strategic spender

### Viewing Inflation Impact

The Inflation Tracker compares your purchases to 2022 baseline prices:
- Shows total inflation impact in dollars
- Lists most inflated items with percentage increases
- Provides shareable social media messages
- Tracks price changes across categories

### Detecting Price Gouging

Price Gouging Alerts flag items that are:
- Priced above regional averages
- Significantly higher than expected
- Marked with severity levels (high/medium)

### Finding Hidden Subscriptions

The Subscription Grave Digger:
- Analyzes receipt patterns for recurring charges
- Groups similar transactions by merchant
- Calculates total monthly subscription costs
- Identifies forgotten or unused subscriptions

## 🔒 Security & Privacy

- All receipt images are processed locally with Tesseract.js
- Optional cloud storage with encryption
- JWT-based authentication
- HTTPS enforced in production
- No sharing of personal financial data
- GDPR and privacy law compliant

## 🌍 Quebec Localization (Pro Feature)

- French language support
- Quebec-specific price databases
- Regional store recognition
- Local pricing comparisons
- French receipt OCR optimization

## 🚀 Deployment

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create receiptai

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

### Deploy to Vercel/Netlify

The React client can be deployed separately:
```bash
cd client
npm run build
# Deploy the 'build' folder
```

## 📊 API Documentation

### Receipt Endpoints

- `POST /api/receipts/scan` - Upload and scan receipt
- `GET /api/receipts` - Get all user receipts
- `GET /api/receipts/:id` - Get specific receipt
- `DELETE /api/receipts/:id` - Delete receipt

### Insights Endpoints

- `GET /api/insights/inflation` - Get inflation comparison
- `GET /api/insights/money-personality` - Get personality report
- `GET /api/insights/price-alerts` - Get price gouging alerts
- `GET /api/insights/subscriptions` - Get detected subscriptions

### User Endpoints

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile

### Subscription Endpoints

- `POST /api/subscriptions/upgrade` - Upgrade to Pro
- `GET /api/subscriptions/status` - Get subscription status

## 🧪 Testing

```bash
# Run backend tests (when implemented)
npm test

# Run frontend tests
cd client
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Phase 1 - MVP (Current)
- [x] Basic receipt scanning with OCR
- [x] Inflation tracking
- [x] Price gouging alerts
- [x] Money Personality reports
- [x] Freemium tier structure

### Phase 2 - Enhancement
- [ ] Email integration for subscription detection
- [ ] Enhanced AI for better OCR accuracy
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced data visualization
- [ ] Export features (PDF, CSV)

### Phase 3 - Scale
- [ ] API licensing for banks/fintech
- [ ] Brand partnerships with grocery chains
- [ ] Quebec market expansion
- [ ] Multi-language support
- [ ] Machine learning price predictions

### Phase 4 - Monetization
- [ ] Stripe payment integration
- [ ] B2B API access
- [ ] White-label solutions
- [ ] Premium analytics dashboard

## 💡 Why It Goes Viral

1. **Shareable rage content**: Users create posts about inflation that resonate
2. **Satisfying UI**: Receipt scanning is oddly satisfying
3. **Quebec angle**: Targeted localization for specific market
4. **Zero competition**: Different from traditional budgeting apps
5. **Economic journalism**: Tells your wallet's story

## 📧 Contact & Support

- **Issues**: Open an issue on GitHub
- **Email**: support@receiptai.com (placeholder)
- **Twitter**: @ReceiptAI (placeholder)

---

Built with 💙 for people who want to know where their money really goes.

**Stop wondering. Start knowing. ReceiptAI.**
