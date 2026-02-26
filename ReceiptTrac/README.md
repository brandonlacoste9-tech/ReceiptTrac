# ReceiptTrac 🏴󠁧󠁢󠁱󠁣󠁿

**AI-Powered Quebec Tax Receipt Tracker**

Your receipts, your taxes, your money. Built specifically for Quebec's unique tax system (GST 5% + QST 9.975%).

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
![OpenAI](https://img.shields.io/badge/OpenAI-Vision-orange.svg)
![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)

## ✨ Features

- 📸 **Smart Receipt Scanning** - OpenAI GPT-4 Vision + Google Cloud Vision fallback
- 🏴󠁧󠁢󠁱󠁣󠁿 **Quebec Tax Engine** - Automatic GST/QST calculation and validation
- 🗺️ **Regional Communities** - Filter by Montreal, Quebec City, Laval, etc.
- 🇫🇷 **Bilingual** - French primary, English toggle
- 💰 **Budget Tracking** - Category-based spending analysis
- 🏦 **Tax Export** - CSV format for SimpleTax/TurboTax
- 🔒 **Privacy First** - Self-hosted, your data stays local

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API key (get at https://platform.openai.com)
- (Optional) Google Cloud Vision credentials for backup OCR

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
- Select your region (Montreal, Quebec City, etc.)
- AI extracts: merchant, amounts, taxes, date

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

### 4. Export
- Download CSV for tax software
- SimpleTax compatible format
- Filter by region or date range

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
│   ├── ocr_service.py     # OpenAI + Google Vision
│   ├── tax_engine.py      # Quebec tax calculations
│   └── storage.py         # SQLite database
├── templates/             # Jinja2 HTML templates
├── static/               # CSS, JS, uploads
├── requirements.txt
└── .env
```

## 🧪 Progressive Rollout (Option A + B)

This codebase supports incremental deployment:

**Phase 1: Basic OCR** (OpenAI working)
- Comment out Google Vision imports if not needed
- Set `ENABLE_TAX_CALC=true`
- Basic receipt scanning works

**Phase 2: Add Backup OCR** (Google Vision)
- Add Google Cloud credentials
- Automatic fallback if OpenAI fails

**Phase 3: Enable Communities**
- Set `ENABLE_COMMUNITY=true`
- Regional filtering active

**Phase 4: Export Features**
- Set `ENABLE_EXPORT=true`
- CSV generation for tax software

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

## 🛣️ Roadmap

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
