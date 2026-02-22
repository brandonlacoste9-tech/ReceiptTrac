# ReceiptAI Architecture

## System Overview

ReceiptAI is a full-stack web application built with a modern MERN-like stack (Node.js, Express, React) that uses AI-powered OCR to scan receipts and provide financial insights.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   HomePage   │  │   ScanPage   │  │DashboardPage │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                           │
│  │ InsightsPage │  Components + Services                    │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express API Server                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Receipts   │  │    Users     │  │Subscriptions │      │
│  │    Routes    │  │    Routes    │  │    Routes    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                           │
│  │   Insights   │                                           │
│  │    Routes    │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         receiptService.js                            │   │
│  │  - OCR Processing (Tesseract.js)                     │   │
│  │  - Receipt Parsing & Item Extraction                 │   │
│  │  - Category Classification                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         insightsService.js                           │   │
│  │  - Inflation Tracking (2022 baseline)                │   │
│  │  - Price Gouging Detection                           │   │
│  │  - Money Personality Generation                      │   │
│  │  - Subscription Detection                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Storage Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  In-Memory   │  │   MongoDB    │  │  PostgreSQL  │      │
│  │   (Demo)     │  │  (Optional)  │  │  (Optional)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18**: Modern UI framework with hooks
- **React Router 6**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Dropzone**: File upload with drag-and-drop
- **CSS3**: Custom styling with gradients, animations, and responsive design

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **Tesseract.js**: OCR engine for receipt scanning
- **Multer**: File upload middleware
- **JWT**: Authentication tokens (infrastructure ready)
- **Stripe**: Payment processing (infrastructure ready)

### Optional Integrations
- **MongoDB**: NoSQL database for production
- **PostgreSQL**: Relational database alternative
- **Redis**: Caching layer for performance
- **AWS S3**: Image storage
- **Nodemailer**: Email integration for subscription detection

## Core Components

### 1. Receipt Scanning Pipeline

```
User Upload → Multer → Tesseract OCR → Text Parser → Data Extractor → Storage
```

**Process:**
1. User uploads receipt image via drag-and-drop
2. Multer middleware processes multipart form data
3. Tesseract.js performs OCR on the image
4. Text parser extracts structured data:
   - Store name (first line)
   - Date (regex pattern matching)
   - Items and prices (line-by-line parsing)
   - Totals (subtotal, tax, total)
5. Items are categorized (dairy, produce, meat, etc.)
6. Receipt object is stored in memory/database

### 2. Insights Engine

#### Inflation Tracker
```javascript
Current Price - 2022 Baseline Price = Inflation Impact
(Difference / Baseline) × 100 = Inflation %
```

**Data:**
- 2022 baseline prices for common items
- Current average prices (2026)
- User's actual purchase prices

#### Price Gouging Detection
```javascript
if (Item Price > Regional Threshold) {
  Alert Level = (Price > Threshold × 1.2) ? 'high' : 'medium'
}
```

**Algorithm:**
1. Compare item price to regional average
2. Flag if price exceeds threshold
3. Calculate overcharge amount and percentage
4. Assign severity level

#### Money Personality
```javascript
Personality = f(avgSpending, categoryBreakdown, frequency)
```

**Personality Types:**
- Coffee Connoisseur: High beverage spending
- Health Conscious: High produce/low meat ratio
- Frequent Shopper: High transaction count
- Budget Planner: Moderate, consistent spending

#### Subscription Detection
```javascript
if (SameStore && SimilarAmount && RecurringDates) {
  Flag as Potential Subscription
}
```

**Algorithm:**
1. Group receipts by store name
2. Check for consistent amounts (±10%)
3. Identify recurring patterns
4. Calculate monthly subscription costs

## API Endpoints

### Receipt Management
- `POST /api/receipts/scan` - Upload and scan receipt
- `POST /api/receipts/load-demo` - Load demo data
- `GET /api/receipts` - Get all user receipts
- `GET /api/receipts/:id` - Get specific receipt
- `DELETE /api/receipts/:id` - Delete receipt

### Financial Insights
- `GET /api/insights/inflation` - Get inflation analysis
- `GET /api/insights/money-personality` - Get personality report
- `GET /api/insights/price-alerts` - Get price gouging alerts
- `GET /api/insights/subscriptions` - Get detected subscriptions

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile

### Subscriptions
- `POST /api/subscriptions/upgrade` - Upgrade to Pro
- `GET /api/subscriptions/status` - Get subscription status

## Data Models

### Receipt
```javascript
{
  id: String,              // Unique identifier
  userId: String,          // Owner user ID
  storeName: String,       // Merchant name
  date: String,            // Purchase date
  items: [{                // Line items
    name: String,
    price: Number,
    category: String
  }],
  subtotal: Number,        // Pre-tax total
  tax: Number,             // Tax amount
  total: Number,           // Final total
  itemCount: Number,       // Number of items
  rawText: String,         // Original OCR text
  imageData: String,       // Base64 image
  scannedAt: String        // Timestamp
}
```

### User
```javascript
{
  id: String,
  email: String,
  name: String,
  tier: String,            // 'free' or 'pro'
  scansRemaining: Number,  // For free tier
  totalScans: Number,
  memberSince: String
}
```

## Security Considerations

### Current Implementation
- CORS enabled for development
- File size limits (10MB) on uploads
- Input validation on API endpoints
- Environment variables for sensitive data

### Production Recommendations
1. **Authentication**: Implement JWT tokens
2. **Authorization**: Role-based access control
3. **Rate Limiting**: Prevent API abuse
4. **HTTPS**: SSL/TLS encryption
5. **Input Sanitization**: Prevent injection attacks
6. **Image Validation**: Verify file types
7. **GDPR Compliance**: User data privacy
8. **PCI Compliance**: For payment processing

## Scalability

### Current Architecture (Demo)
- In-memory data storage
- Single server instance
- Synchronous OCR processing

### Production Architecture
```
Load Balancer
     │
     ├─► API Server 1 ──┐
     ├─► API Server 2 ──┼─► Database (MongoDB/PostgreSQL)
     └─► API Server N ──┘
              │
              └─► OCR Worker Queue (Redis + Bull)
                       │
                       ├─► OCR Worker 1
                       ├─► OCR Worker 2
                       └─► OCR Worker N
```

**Optimizations:**
1. **Horizontal Scaling**: Multiple API servers
2. **Database**: MongoDB/PostgreSQL for persistence
3. **Caching**: Redis for frequently accessed data
4. **Queue**: Async OCR processing with Bull
5. **CDN**: Serve static assets
6. **Image Storage**: AWS S3/CloudFlare R2
7. **Serverless Functions**: AWS Lambda for OCR

## Performance Metrics

### Target Performance
- Receipt scan time: < 5 seconds
- API response time: < 200ms
- Page load time: < 2 seconds
- Time to interactive: < 3 seconds

### Monitoring
- API endpoint latency
- OCR processing time
- Error rates
- User engagement metrics
- Conversion rates (Free → Pro)

## Deployment

### Development
```bash
npm run server  # Backend on :5000
npm run client  # Frontend on :3000
```

### Production
```bash
npm run build   # Build React app
npm start       # Serve production build
```

### Environment Variables
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=...
STRIPE_SECRET_KEY=...
```

## Future Enhancements

### Phase 2
- [ ] Email integration for subscription detection
- [ ] Mobile apps (React Native)
- [ ] Offline mode with service workers
- [ ] Export features (PDF, CSV)
- [ ] Multi-currency support

### Phase 3
- [ ] Machine learning price predictions
- [ ] Budget recommendations
- [ ] Spending alerts and notifications
- [ ] Social features (share insights)
- [ ] API for third-party integrations

### Phase 4
- [ ] B2B features for businesses
- [ ] White-label solutions
- [ ] Advanced analytics dashboard
- [ ] Blockchain receipt verification
- [ ] AI-powered financial advice

## Testing Strategy

### Unit Tests
- Receipt parsing logic
- Price calculations
- Category classification
- Insight algorithms

### Integration Tests
- API endpoints
- OCR pipeline
- Database operations
- Authentication flow

### E2E Tests
- User registration/login
- Receipt scanning flow
- Dashboard interaction
- Subscription upgrade

### Performance Tests
- Load testing API endpoints
- OCR processing under load
- Database query optimization
- Frontend rendering performance

## Monitoring & Analytics

### Application Monitoring
- Server health checks
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Uptime monitoring (Pingdom)

### User Analytics
- Google Analytics
- Mixpanel for user behavior
- Conversion funnels
- A/B testing framework

### Business Metrics
- Daily/Monthly Active Users (DAU/MAU)
- Scan count per user
- Free to Pro conversion rate
- Revenue metrics
- Churn rate

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Maintainers:** ReceiptAI Team
