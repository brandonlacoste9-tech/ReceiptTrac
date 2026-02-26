"""
ReceiptTrac - Quebec Tax Receipt Tracker
Main Flask Application
"""
import os
import uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file, flash, redirect, url_for
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import pandas as pd
import io

# Load environment variables
load_dotenv()

# Import services
from services import ReceiptOCR, QuebecTaxEngine, ReceiptStorage

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

# Language helper
def get_text(lang, key):
    """Bilingual text helper"""
    texts = {
        "fr": {
            "app_name": "ReceiptTrac",
            "tagline": "Vos reçus, vos taxes, votre argent",
            "scan_receipt": "Numériser un reçu",
            "dashboard": "Tableau de bord",
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
            "export": "Exporter CSV",
            "all_regions": "Toutes les régions",
            "all_categories": "Toutes les catégories",
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
            "export": "Export CSV",
            "all_regions": "All Regions",
            "all_categories": "All Categories",
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

# Routes
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

    return render_template("index.html", 
                         receipts=receipts,
                         summary=summary,
                         categories=categories,
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
                # OCR Processing
                result = ocr_service.scan_receipt(filepath)
                result["image_path"] = filepath
                result["region"] = request.form.get("region", "autre")

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

@app.route("/export")
def export_csv():
    """Export receipts to CSV (SimpleTax format)"""
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

@app.route("/api/receipts")
def api_receipts():
    """API endpoint for receipts"""
    region = request.args.get("region")
    receipts = storage.get_receipts(region=region)
    return jsonify(receipts)

@app.route("/api/stats")
def api_stats():
    """API endpoint for statistics"""
    receipts = storage.get_receipts()
    summary = tax_engine.get_tax_summary(receipts)
    return jsonify(summary)

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
