# ReceiptTrac 🏴󠁧󠁢󠁱󠁣󠁿

**AI-Powered Quebec Tax Receipt Tracker**

Your receipts, your taxes, your money. Built specifically for Quebec's unique tax system (GST 5% + QST 9.975%).

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
![OpenAI](https://img.shields.io/badge/OpenAI-Vision-orange.svg)
![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)

## ✨ Features

### 🧾 Smart Receipt Scanning
- **OpenAI GPT-4 Vision** for accurate text extraction
- **Google Cloud Vision** fallback for reliability
- **Barcode & QR Code** scanning for product lookup
- Automatic merchant, date, amount, and tax extraction

### 🏴󠁧󠁢󠁱󠁣󠁿 Quebec Tax Engine
- **Automatic TPS (5%) & TVQ (9.975%)** calculation
- **Tax validation** to catch discrepancies
- **Deductible expense tracking** (medical, education, business)
- **Reverse calculation** from total amount

### 💰 Budget & Analytics
- **Category budgets** with spending alerts
- **Recurring expense tracking** (subscriptions, bills)
- **Spending insights** with AI-powered recommendations
- **Savings goals** with progress tracking

### 📊 Reports & Exports
- **HTML tax reports** for easy review
- **CSV export** for SimpleTax/TurboTax
- **PDF generation** for documentation
- **Year-over-year comparisons**

### 🗺️ Regional Communities
- Filter by Quebec regions: Montréal, Québec, Laval, Gatineau, Sherbrooke, Trois-Rivières

### 🇫🇷 Bilingual
- French primary with English toggle
- All tax terms properly translated

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- OpenAI API key (get at https://platform.openai.com)
- (Optional) Google Cloud Vision credentials

### Installation

1. **Clone the repo**
```bash
git clone https://github.com/brandonlacoste9-tech/ReceiptTrac.git
cd ReceiptTrac
```

2. **Create virtual environment**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

5. **Run the app**
```bash
python app.py
```

6. **Open browser**
```
http://localhost:5000
```

## 🔧 Configuration

Create a `.env` file:

```env
# Required: OpenAI API Key
OPENAI_API_KEY=sk-your-key-here

# Optional: Google Cloud Vision (backup OCR)
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# Flask settings
SECRET_KEY=your-secret-key
FLASK_ENV=development
FLASK_PORT=5000
```

## 📱 Usage

### 1. Scan Receipt
- Click "Numériser un reçu"
- Upload or drag-and-drop receipt image
- Select your region
- AI extracts: merchant, amounts, taxes, date, category
- Barcode scanning for product details

### 2. Verify Data
- Review extracted information
- Edit if needed
- Taxes auto-calculated for Quebec (GST 5% + QST 9.975%)
- Save to database

### 3. Dashboard
- View spending by category
- Filter by region
- Track GST/QST totals
- See deductible amounts

### 4. Budget
- Set monthly budgets by category
- Track recurring expenses (subscriptions, bills)
- Get spending insights and alerts
- Monitor savings goals

### 5. Reports
- Generate tax reports by year
- Export to CSV for tax software
- View detailed HTML reports
- Track deductions

### 6. Export
- Download CSV for SimpleTax/TurboTax
- Filter by region or date range
- PDF reports for documentation

## 🗺️ Regional Support

Pre-configured for Quebec regions:
- Montréal
- Québec (City)
- Laval
- Gatineau
- Sherbrooke
- Trois-Rivières
- Autre/Other

## 🏗️ Architecture

```
ReceiptTrac/
├── app.py                 # Main Flask application
├── services/
│   ├── ocr_service.py     # OpenAI + Google Vision + Barcode
│   ├── tax_engine.py      # Quebec tax calculations
│   ├── storage.py         # SQLite database
│   ├── budget_service.py  # Budgets & analytics
│   └── report_service.py  # PDF/HTML reports
├── templates/             # Jinja2 HTML templates
├── static/               # CSS, JS, uploads
├── requirements.txt
└── .env
```

## 📊 Tax Calculations

Quebec's unique tax system:
- **GST (TPS)**: 5% on subtotal
- **QST (TVQ)**: 9.975% on (subtotal + GST)
- **Combined**: ~14.975% effective rate

Example:
```
Subtotal: $100.00
GST (5%):   $5.00
QST (9.975% on $105): $10.47
Total:     $115.47
```

## 📈 Budget Features

- **Set Budgets**: Define monthly limits per category
- **Track Spending**: Real-time budget vs actual
- **Recurring Expenses**: Track subscriptions and bills
- **Spending Insights**: AI-powered recommendations
- **Savings Goals**: Set and track financial goals

## 🚀 Deploy to Render

1. Push to GitHub
2. Connect to Render
3. Add environment variables in Render dashboard
4. Deploy!

## 🛣️ Roadmap

- [x] Barcode & QR code scanning
- [x] Budget tracking & alerts
- [x] Recurring expense tracking
- [x] Spending insights & analytics
- [x] PDF report generation
- [ ] Mobile app (React Native)
- [ ] Bank statement import
- [ ] Automatic categorization learning
- [ ] Multi-language support (Spanish, etc.)
- [ ] Cloud sync option
- [ ] AI tax optimization suggestions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

Apache 2.0 - See [LICENSE](LICENSE)

## 🙏 Acknowledgments

- Built for Quebec taxpayers
- Uses OpenAI GPT-4 Vision
- Flask + SQLite stack

---

**Made with ❤️ in Quebec** | ReceiptTrac 2025
