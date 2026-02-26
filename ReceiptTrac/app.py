"""
ReceiptTrac - Quebec Tax Receipt Tracker
Enhanced with Budget, Barcode Scanning, and Tax Reports
"""
import os
import uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file, flash, redirect, url_for, make_response
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import pandas as pd
import io

# Load environment variables
load_dotenv()

# Import services
from services import ReceiptOCR, QuebecTaxEngine, ReceiptStorage
from services.barcode_service import BarcodeService
from services.budget_service import BudgetService
from services.report_service import ReportService

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key")

# Config
UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize services
ocr_service = ReceiptOCR()
tax_engine = QuebecTaxEngine()
storage = ReceiptStorage()
barcode_service = BarcodeService()
budget_service = BudgetService()
report_service = ReportService(storage, tax_engine)

# Language helper
def get_text(lang, key):
    """Bilingual text helper"""
    texts = {
        "fr": {
            "app_name": "ReceiptTrac",
            "tagline": "Vos reçus, vos taxes, votre argent",
            "scan_receipt": "Numériser un reçu",
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

# ============ MAIN ROUTES ============

@app.route("/")
def index():
    """Dashboard / Home"""
    lang = request.args.get("lang", "fr")
    region = request.args.get("region")
    category = request.args.get("category")
    
    # Get receipts with filters
    receipts = storage.get_receipts(region=region, category=category)
    
    # Calculate summary
    summary = tax_engine.get_tax_summary(receipts)
    categories = storage.get_spending_by_category(region=region)
    
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

@app.route("/save_receipt", methods=["POST"])
def save_receipt():
    """Save verified receipt to database"""
    data = {
        "merchant": request.form.get("merchant"),
        "date": request.form.get("date"),
        "total": float(request.form.get("total", 0)),
        "subtotal": float(request.form.get("subtotal", 0)) if request.form.get("subtotal") else None,
        "tax_gst": float(request.form.get("tax_gst", 0)),
        "tax_qst": float(request.form.get("tax_qst", 0)),
        "tax_total": float(request.form.get("tax_total", 0)),
        "category": request.form.get("category", "other"),
        "region": request.form.get("region", "autre"),
        "payment_method": request.form.get("payment_method"),
        "address": request.form.get("address"),
        "image_path": request.form.get("image_path"),
        "ocr_engine": request.form.get("ocr_engine", "manual"),
        "confidence": float(request.form.get("confidence", 1.0))
    }
    
    receipt_id = storage.save_receipt(data)
    flash("Receipt saved successfully!", "success")
    return redirect(url_for("index"))

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
    lang = request.args.get("lang", "fr")
    year = request.args.get("year", datetime.now().year, type=int)
    
    # Get receipts for the year
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"
    receipts = storage.get_receipts(start_date=start_date, end_date=end_date)
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
    region = request.args.get("region")
    category = request.args.get("category")
    receipts = storage.get_receipts(region=region, category=category)
    return jsonify(receipts)

@app.route("/api/stats")
def api_stats():
    """API endpoint for statistics"""
    receipts = storage.get_receipts()
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
    months = request.args.get("months", 3, type=int)
    insights = budget_service.get_spending_insights(months)
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
