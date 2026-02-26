@echo off
echo 🚀 ReceiptTrac Setup Script
echo ============================

echo 📦 Creating virtual environment...
python -m venv venv

echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

echo ⬇️  Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

if not exist .env (
    echo ⚙️  Creating .env file...
    copy .env.example .env
    echo 📝 Please edit .env and add your OpenAI API key!
)

if not exist static\uploads mkdir static\uploads

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env and add your OPENAI_API_KEY
echo 2. Run: python app.py
echo 3. Open: http://localhost:5000
echo.
pause
