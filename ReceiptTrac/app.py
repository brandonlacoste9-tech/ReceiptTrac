"""
ReceiptTrac - Quebec Tax Receipt Tracker
Enhanced with Budget, Barcode Scanning, and Tax Reports
"""
import os
import uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file, flash, redirect, url_for, make_response, session
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import pandas as pd
import io
import csv
import json
import sqlite3
import hashlib

# Load environment variables
load_dotenv()

# Import services
from services import ReceiptOCR, QuebecTaxEngine, ReceiptStorage
from services.barcode_service import BarcodeService
from services.budget_service import BudgetService
from services.report_service import ReportService
from services.bank_import_service import BankImportService

# Configuration and Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IS_VERCEL = os.environ.get("VERCEL") == "1"

app = Flask(__name__, 
            template_folder=os.path.join(BASE_DIR, "templates"),
            static_folder=os.path.join(BASE_DIR, "static"))
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key")

# Detect Vercel environment
IS_VERCEL = os.environ.get("VERCEL") == "1"

# Config
if IS_VERCEL:
    # Vercel is read-only, we must use /tmp for database and uploads if we want to avoid crashes
    DB_PATH = "/tmp/receipttrac.db"
    UPLOAD_FOLDER = "/tmp/static/uploads"
    # Copy existing DB to /tmp if it exists in the repo
    if not os.path.exists(DB_PATH) and os.path.exists("ReceiptTrac/receipttrac.db"):
        import shutil
        shutil.copy("ReceiptTrac/receipttrac.db", DB_PATH)
else:
    DB_PATH = "receipttrac.db"
    UPLOAD_FOLDER = "static/uploads"

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max

# Ensure upload folder exists
try:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
except Exception:
    pass

# Initialize services
ocr_service = ReceiptOCR()
tax_engine = QuebecTaxEngine()
storage = ReceiptStorage(db_path=DB_PATH)
barcode_service = BarcodeService()
budget_service = BudgetService()
report_service = ReportService(storage, tax_engine)
bank_import_service = BankImportService()

# Global Constants
FREE_LIMIT = 15

# Language helper
def get_text(lang, key):
    """Bilingual text helper"""
    texts = {
        "fr": {
            "app_name": "ReceiptTrac",
            "tagline": "Vos reçus, vos taxes, votre argent",
            "scan_receipt": "Numériser un reçu",
            "import_statement": "Importer un relevé",
            "dashboard": "Tableau de bord",
            "budget": "Budget",
            "reports": "Rapports",
            "analytics": "Analytique",
            "region": "Région",
            "category": "Catégorie",
            "total": "Total",
            "gst": "TPS (5%)",
            "qst": "TVQ (9.975%)",
            "date": "Date",
            "merchant": "Marchand",
            "save": "Sauvegarder",
            "cancel": "Annuler",
            "delete": "Supprimer",
            "export": "Exporter",
            "export_csv": "Exporter CSV",
            "export_pdf": "Exporter PDF",
            "view_report": "Voir Rapport",
            "set_budget": "Définir Budget",
            "recurring": "Dépenses Récurrentes",
            "savings_goals": "Objectifs d'Épargne",
            "insights": "Conseils",
            "all_regions": "Toutes les régions",
            "all_categories": "Toutes les catégories",
            "scan_barcode": "Scanner Code-barres",
            "categories": {
                "restaurant": "Restaurant",
                "grocery": "Épicerie",
                "transport": "Transport",
                "medical": "Médical",
                "office": "Bureau",
                "entertainment": "Divertissement",
                "utilities": "Services publics",
                "education": "Éducation",
                "other": "Autre"
            },
            "regions": {
                "montreal": "Montréal",
                "quebec": "Québec",
                "laval": "Laval",
                "gatineau": "Gatineau",
                "sherbrooke": "Sherbrooke",
                "trois-rivieres": "Trois-Rivières",
                "autre": "Autre"
            }
        },
        "en": {
            "app_name": "ReceiptTrac",
            "tagline": "Your receipts, your taxes, your money",
            "scan_receipt": "Scan Receipt",
            "import_statement": "Import Statement",
            "dashboard": "Dashboard",
            "budget": "Budget",
            "reports": "Reports",
            "analytics": "Analytics",
            "region": "Region",
            "category": "Category",
            "total": "Total",
            "gst": "GST (5%)",
            "qst": "QST (9.975%)",
            "date": "Date",
            "merchant": "Merchant",
            "save": "Save",
            "cancel": "Cancel",
            "delete": "Delete",
            "export": "Export",
            "export_csv": "Export CSV",
            "export_pdf": "Export PDF",
            "view_report": "View Report",
            "set_budget": "Set Budget",
            "recurring": "Recurring Expenses",
            "savings_goals": "Savings Goals",
            "insights": "Insights",
            "all_regions": "All Regions",
            "all_categories": "All Categories",
            "scan_barcode": "Scan Barcode",
            "categories": {
                "restaurant": "Restaurant",
                "grocery": "Grocery",
                "transport": "Transport",
                "medical": "Medical",
                "office": "Office",
                "entertainment": "Entertainment",
                "utilities": "Utilities",
                "education": "Education",
                "other": "Other"
            },
            "regions": {
                "montreal": "Montreal",
                "quebec": "Quebec City",
                "laval": "Laval",
                "gatineau": "Gatineau",
                "sherbrooke": "Sherbrooke",
                "trois-rivieres": "Trois-Rivières",
                "autre": "Other"
            }
        }
    }
    return texts.get(lang, texts["fr"]).get(key, key)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/health")
def health_check():
    """Health check endpoint for Vercel deployment"""
    return jsonify({
        "status": "online",
        "vercel": IS_VERCEL,
        "database": os.path.exists(DB_PATH),
        "db_path": DB_PATH,
        "env": os.environ.get("VERCEL_ENV", "unknown")
    })

# ============ AUTH ROUTES ============

@app.route("/login", methods=["GET", "POST"])
def login():
    lang = request.args.get("lang", session.get("lang", "fr"))
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        user = storage.verify_user(username, password)
        if user:
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            flash(f"Welcome back, {username}!" if lang == "en" else f"Bienvenue, {username}!", "success")
            return redirect(url_for("index", lang=lang))
        else:
            flash("Invalid username or password" if lang == "en" else "Nom d'utilisateur ou mot de passe invalide", "error")
    
    return render_template("login.html", lang=lang, text=get_text)

@app.route("/signup", methods=["GET", "POST"])
def signup():
    lang = request.args.get("lang", session.get("lang", "fr"))
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        email = request.form.get("email")
        
        result = storage.create_user(username, password, email)
        if isinstance(result, int):
            session["user_id"] = result
            session["username"] = username
            flash("Account created successfully!" if lang == "en" else "Compte créé avec succès!", "success")
            return redirect(url_for("index", lang=lang))
        else:
            flash(result, "error")
            
    return render_template("signup.html", lang=lang, text=get_text)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

# ============ MAIN ROUTES ============

@app.route("/")
def index():
    """Dashboard / Home"""
    lang = request.args.get("lang", session.get("lang", "fr"))
    session["lang"] = lang
    
    user_id = session.get("user_id", 0) # 0 = Guest
    
    # Check if guest has reached limit
    guest_count = 0
    if user_id == 0:
        guest_count = storage.get_receipt_count(0)
        if guest_count >= FREE_LIMIT:
            flash("Limit reached! Please sign up to continue tracking receipts." if lang == "en" 
                  else "Limite atteinte ! Veuillez vous inscrire pour continuer à suivre vos reçus.", "warning")
            return redirect(url_for("signup", lang=lang))

    region = request.args.get("region")
    category = request.args.get("category")
    
    receipts = storage.get_receipts(user_id=user_id, region=region, category=category)
    summary = tax_engine.get_tax_summary(receipts)
    categories = storage.get_spending_by_category(user_id=user_id, region=region)
    
    # Get budget status
    budget_status = budget_service.get_budget_status()
    
    # Get insights
    try:
        insights = budget_service.get_spending_insights(months=3)
    except:
        insights = None
    
    return render_template("index.html", 
                         receipts=receipts,
                         summary=summary,
                         categories=categories,
                         budget_status=budget_status,
                         insights=insights,
                         regions=tax_engine.regions,
                         lang=lang,
                         text=get_text)

@app.route("/scan", methods=["GET", "POST"])
def scan():
    """Scan receipt page"""
    lang = request.args.get("lang", "fr")
    
    if request.method == "POST":
        # Check if file uploaded
        if "receipt" not in request.files:
            flash("No file uploaded", "error")
            return redirect(request.url)
        
        file = request.files["receipt"]
        if file.filename == "":
            flash("No file selected", "error")
            return redirect(request.url)
        
        if file and allowed_file(file.filename):
            # Save file
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(filepath)
            
            try:
                # Check for barcode first
                barcode_data = barcode_service.scan_barcode(filepath)
                
                # OCR Processing
                result = ocr_service.scan_receipt(filepath)
                result["image_path"] = filepath
                result["region"] = request.form.get("region", "autre")
                result["barcode_data"] = barcode_data

                # AI Categorization Learning: Check if we've learned a better category for this merchant
                merchant = result.get("merchant")
                if merchant:
                    learned_cat = storage.get_learned_category(merchant)
                    if learned_cat:
                        result["category"] = learned_cat
                
                # If taxes missing, calculate them
                if not result.get("tax_gst") and not result.get("tax_qst"):
                    if result.get("subtotal"):
                        taxes = tax_engine.calculate_taxes(result["subtotal"])
                        result.update(taxes)
                    elif result.get("total"):
                        taxes = tax_engine.extract_from_total(result["total"])
                        result.update(taxes)
                
                return render_template("verify.html",
                                     receipt=result,
                                     regions=tax_engine.regions,
                                     lang=lang,
                                     text=get_text)
            
            except Exception as e:
                flash(f"Error processing receipt: {str(e)}", "error")
                return redirect(request.url)
    
    return render_template("scan.html",
                         regions=tax_engine.regions,
                         lang=lang,
                         text=get_text)

@app.route("/import_statement", methods=["GET", "POST"])
def import_statement():
    """Bank Statement CSV Import"""
    lang = request.args.get("lang", session.get("lang", "fr"))
    user_id = session.get("user_id", 0)
    
    if user_id == 0 and storage.get_receipt_count(0) >= FREE_LIMIT:
        flash("Please sign up to use the bulk import feature." if lang == "en" else "Veuillez vous inscrire pour utiliser la fonction d'importation groupée.", "warning")
        return redirect(url_for("signup", lang=lang))

    if request.method == "POST":
        if "statement" not in request.files:
            flash("No file uploaded", "error")
            return redirect(request.url)
            
        file = request.files["statement"]
        if file.filename == "":
            flash("No file selected", "error")
            return redirect(request.url)
            
        if file and file.filename.endswith(".csv"):
            try:
                content = file.read().decode("utf-8")
                transactions = bank_import_service.parse_csv(content, file.filename)
                
                if not transactions:
                    flash("No valid transactions found in CSV", "warning")
                    return redirect(request.url)

                # AI Categorization Learning: Apply past manual adjustments to the AI parser
                for tx in transactions:
                    merchant = tx.get("merchant")
                    if merchant:
                        learned_cat = storage.get_learned_category(merchant)
                        if learned_cat:
                            tx["category"] = learned_cat
                    
                # Store temporarily in session or pass via hidden fields
                # For simplicity here, we'll pass them to the template as a JSON string to be re-posted
                import json
                return render_template("verify_import.html",
                                     transactions=transactions,
                                     transactions_json=json.dumps(transactions),
                                     regions=tax_engine.regions,
                                     lang=lang,
                                     text=get_text)
            except Exception as e:
                flash(f"Error parsing statement: {str(e)}", "error")
                return redirect(request.url)
        else:
            flash("Please upload a .csv file", "error")
            return redirect(request.url)
            
    return render_template("import.html", lang=lang, text=get_text)

@app.route("/save_imported_transactions", methods=["POST"])
def save_imported_transactions():
    """Batch save transactions from bank import"""
    import json
    
    raw_data = request.form.get("transactions_data", "[]")
    region_override = request.form.get("region", "autre")
    
    try:
        transactions = json.loads(raw_data)
        saved_count = 0
        
        for tx in transactions:
            tx["region"] = region_override
            storage.save_receipt(tx)
            saved_count += 1
            
        flash(f"Successfully saved {saved_count} transactions!", "success")
    except Exception as e:
        flash(f"Error saving transactions: {str(e)}", "error")
        
    return redirect(url_for("index"))

@app.route("/save_receipt", methods=["POST"])
def save_receipt():
    """Save verified receipt to database"""
    lang = request.args.get("lang", session.get("lang", "fr"))
    user_id = session.get("user_id", 0)
    
    if request.method == "POST":
        data = {
            "user_id": user_id,
            "merchant": request.form.get("merchant"),
            "date": request.form.get("date"),
            "total": float(request.form.get("total", 0)),
            "subtotal": float(request.form.get("subtotal", 0)) if request.form.get("subtotal") else 0,
            "tax_gst": float(request.form.get("tax_gst", 0)) if request.form.get("tax_gst") else 0,
            "tax_qst": float(request.form.get("tax_qst", 0)) if request.form.get("tax_qst") else 0,
            "tax_total": float(request.form.get("tax_total", 0)) if request.form.get("tax_total") else 0,
            "category": request.form.get("category", "other"),
            "region": request.form.get("region", "autre"),
            "payment_method": request.form.get("payment_method"),
            "address": request.form.get("address"),
            "image_path": request.form.get("image_path"),
            "ocr_engine": request.form.get("ocr_engine", "manual"),
            "confidence": float(request.form.get("confidence", 1.0)),
            "document_type": request.form.get("document_type", "receipt")
        }
        
        storage.save_receipt(data)
        flash("Entry saved!" if lang == "en" else "Entrée enregistrée !", "success")
        return redirect(url_for("index", lang=lang))
    return redirect(url_for("scan", lang=lang))

@app.route("/delete/<int:receipt_id>", methods=["POST"])
def delete_receipt(receipt_id):
    """Delete receipt"""
    storage.delete_receipt(receipt_id)
    flash("Receipt deleted", "success")
    return redirect(url_for("index"))

# ============ BUDGET ROUTES ============

@app.route("/budget")
def budget_dashboard():
    """Budget management page"""
    lang = request.args.get("lang", "fr")
    
    budget_status = budget_service.get_budget_status()
    recurring = budget_service.get_recurring_expenses()
    insights = budget_service.get_spending_insights(months=3)
    
    return render_template("budget.html",
                         budget_status=budget_status,
                         recurring=recurring,
                         insights=insights,
                         categories=get_text(lang, "categories"),
                         lang=lang,
                         text=get_text)

@app.route("/budget/set", methods=["POST"])
def set_budget():
    """Set budget for a category"""
    category = request.form.get("category")
    amount = float(request.form.get("amount", 0))
    period = request.form.get("period", "monthly")
    
    budget_service.set_budget(category, amount, period)
    flash(f"Budget set for {category}", "success")
    return redirect(url_for("budget_dashboard"))

@app.route("/recurring/add", methods=["POST"])
def add_recurring():
    """Add recurring expense"""
    merchant = request.form.get("merchant")
    amount = float(request.form.get("amount", 0))
    category = request.form.get("category")
    frequency = request.form.get("frequency", "monthly")
    
    budget_service.add_recurring_expense(merchant, amount, category, frequency)
    flash(f"Recurring expense added: {merchant}", "success")
    return redirect(url_for("budget_dashboard"))

# ============ REPORTS ROUTES ============

@app.route("/reports")
def reports():
    """Tax reports page"""
    lang = request.args.get("lang", session.get("lang", "fr"))
    year = request.args.get("year", datetime.now().year, type=int)
    user_id = session.get("user_id", 0)
    # Get receipts for the year
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"
    receipts = storage.get_receipts(user_id=user_id, start_date=start_date, end_date=end_date)
    summary = tax_engine.get_tax_summary(receipts)
    
    return render_template("reports.html",
                         year=year,
                         summary=summary,
                         receipt_count=len(receipts),
                         lang=lang,
                         text=get_text)

@app.route("/report/tax/<int:year>")
def tax_report(year):
    """Generate HTML tax report"""
    html = report_service.generate_tax_summary_report(year, output_format="html")
    response = make_response(html)
    response.headers['Content-Type'] = 'text/html'
    return response

@app.route("/export/csv/<int:year>")
def export_csv(year):
    """Export receipts to CSV"""
    csv_data = report_service.export_to_csv(year)
    
    output = io.BytesIO(csv_data.encode())
    return send_file(
        output,
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"receipttrac_{year}.csv"
    )

# ============ API ROUTES ============

@app.route("/api/receipts")
def api_receipts():
    """API endpoint for receipts"""
    user_id = session.get("user_id", 0)
    region = request.args.get("region")
    category = request.args.get("category")
    receipts = storage.get_receipts(user_id=user_id, region=region, category=category)
    return jsonify(receipts)

@app.route("/api/stats")
def api_stats():
    """API endpoint for statistics"""
    user_id = session.get("user_id", 0)
    receipts = storage.get_receipts(user_id=user_id)
    summary = tax_engine.get_tax_summary(receipts)
    return jsonify(summary)

@app.route("/api/budget/status")
def api_budget_status():
    """API endpoint for budget status"""
    status = budget_service.get_budget_status()
    return jsonify(status)

@app.route("/api/insights")
def api_insights():
    """API endpoint for spending insights"""
    user_id = session.get("user_id", 0)
    months = request.args.get("months", 3, type=int)
    insights = budget_service.get_spending_insights(months) # Note: budget_service needs user isolation eventually
    return jsonify(insights)

@app.route("/api/barcode/scan", methods=["POST"])
def api_scan_barcode():
    """API endpoint for barcode scanning"""
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(f"barcode_{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        
        try:
            result = barcode_service.scan_barcode(filepath)
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Invalid file"}), 400

# ============ MOBILE API ROUTES ============

@app.route("/api/mobile/scan", methods=["POST"])
def api_mobile_scan():
    """Headless API for mobile app to scan a receipt"""
    user_id = request.form.get("user_id", 0, type=int)
    
    if user_id == 0 and storage.get_receipt_count(0) >= FREE_LIMIT:
        return jsonify({"error": "Limit reached", "needs_signup": True}), 403

    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        filename = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        
        try:
            result = ocr_service.scan_receipt(filepath)
            result["image_path"] = f"/static/uploads/{filename}"
            
            # Check for barcode overlay (optional but helpful)
            barcode_data = barcode_service.scan_barcode(filepath)
            result["barcode_data"] = barcode_data
            
            # AI Categorization Learning
            merchant = result.get("merchant")
            if merchant:
                learned_cat = storage.get_learned_category(merchant)
                if learned_cat:
                    result["category"] = learned_cat

            # Guess taxes if empty
            if not result.get("tax_gst") and not result.get("tax_qst"):
                taxes = tax_engine.extract_from_total(result.get("total", 0))
                result.update({
                    "subtotal": taxes["subtotal"],
                    "tax_gst": taxes["gst"],
                    "tax_qst": taxes["qst"],
                    "tax_total": taxes["tax_total"]
                })
                
            return jsonify(result)
        except Exception as e:
            print("OCR Error:", e)
            return jsonify({"error": str(e)}), 500
            
    return jsonify({"error": "Invalid file type"}), 400

@app.route("/api/mobile/save", methods=["POST"])
def api_mobile_save():
    """Headless API for mobile to save receipt details"""
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
        
    try:
        # Reconstruct path if needed, but the client passes `image_path`
        receipt_id = storage.save_receipt(data)
        return jsonify({"success": True, "receipt_id": receipt_id})
    except Exception as e:
        print("Save Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/api/mobile/recent", methods=["GET"])
def api_mobile_recent():
    """Return recent 10 receipts"""
    user_id = request.args.get("user_id", 0, type=int)
    receipts = storage.get_receipts(user_id=user_id)
    return jsonify(receipts[:10])

@app.route("/optimize")
def optimize_taxes():
    """AI Tax Optimization Dashboard"""
    lang = request.args.get("lang", "fr")
    
    # Simple logic: Fetch all "other" category receipts that might be eligible for deduction
    # In Quebec, Medical, Transport, Education, and Office can be claimed under specific scenarios.
    receipts_to_review = storage.get_receipts(category="other")
    
    suggestions = []
    # Very rudimentary rule-based optimization for speed, 
    # instead of doing bulk OpenAI calls here.
    keywords = {
        "medical": ["pharmacie", "dentist", "clinic", "optometrist", "jean coutu", "uniprix", "hôpital"],
        "office": ["bureau en gros", "staples", "best buy", "apple", "ordinateur", "software"],
        "transport": ["stm", "exo", "rtc", "bus", "train", "taxi", "uber", "gas"]
    }
    
    for r in receipts_to_review:
        merchant = r.get("merchant", "").lower()
        for cat, kw_list in keywords.items():
            if any(kw in merchant for kw in kw_list):
                suggestions.append({
                    "receipt": r,
                    "suggested_category": cat,
                    "reason": f"Mots clés détectés / Keyword detected for {cat} deduction"
                })
                break
                
    return render_template("optimize.html",
                         suggestions=suggestions,
                         lang=lang,
                         text=get_text)

# ============ LEGACY EXPORT (kept for compatibility) ============

@app.route("/export")
def export_legacy():
    """Export receipts to CSV (SimpleTax format) - Legacy"""
    region = request.args.get("region")
    receipts = storage.get_receipts(region=region)
    
    csv_data = tax_engine.export_simpletax_format(receipts)
    
    output = io.StringIO(csv_data)
    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"receipttrac_export_{datetime.now().strftime('%Y%m%d')}.csv"
    )

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
