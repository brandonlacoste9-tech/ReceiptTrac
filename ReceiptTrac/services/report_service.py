"""
Tax Report Generator Service
Generate PDF and HTML reports for taxes, budgets, and analytics
"""
import os
import io
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

class ReportService:
    """Generate professional tax and spending reports"""
    
    def __init__(self, storage, tax_engine):
        self.storage = storage
        self.tax_engine = tax_engine
    
    def generate_tax_summary_report(self, year: int = None, 
                                    output_format: str = "html") -> str:
        """
        Generate comprehensive tax summary report
        Format: html or pdf
        """
        if year is None:
            year = datetime.now().year
        
        # Get receipts for the year
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"
        receipts = self.storage.get_receipts(start_date=start_date, end_date=end_date)
        
        summary = self.tax_engine.get_tax_summary(receipts)
        
        if output_format == "pdf" and REPORTLAB_AVAILABLE:
            return self._generate_pdf_report(year, receipts, summary)
        else:
            return self._generate_html_report(year, receipts, summary)
    
    def _generate_html_report(self, year: int, receipts: List[Dict], 
                              summary: Dict) -> str:
        """Generate HTML tax report"""
        
        # Calculate tax deductibles
        deductible_categories = ["medical", "office", "transport", "professional", "education"]
        deductible_total = 0
        deductible_breakdown = {}
        
        for r in receipts:
            cat = r.get("category", "other")
            if cat in deductible_categories:
                amount = r.get("total", 0)
                deductible_total += amount
                if cat not in deductible_breakdown:
                    deductible_breakdown[cat] = 0
                deductible_breakdown[cat] += amount
        
        html = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport Fiscal {year} - ReceiptTrac</title>
    <style>
        @page {{ size: letter; margin: 1in; }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            text-align: center;
            border-bottom: 3px solid #1a5490;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            color: #1a5490;
            margin: 0;
            font-size: 32px;
        }}
        .header p {{
            color: #666;
            margin: 10px 0 0;
        }}
        .summary-grid {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }}
        .summary-card {{
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            border-left: 4px solid #1a5490;
        }}
        .summary-card.deductible {{
            border-left-color: #28a745;
            background: #d4edda;
        }}
        .summary-card h3 {{
            margin: 0 0 10px;
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
        }}
        .summary-card .amount {{
            font-size: 28px;
            font-weight: bold;
            color: #1a5490;
        }}
        .summary-card.deductible .amount {{
            color: #28a745;
        }}
        .section {{
            margin-bottom: 30px;
        }}
        .section h2 {{
            color: #1a5490;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }}
        th {{
            background: #1a5490;
            color: white;
            font-weight: 600;
        }}
        tr:hover {{
            background: #f8f9fa;
        }}
        .tax-breakdown {{
            background: #e7f3ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }}
        .tax-row {{
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #ccc;
        }}
        .tax-row.total {{
            font-weight: bold;
            font-size: 18px;
            border-bottom: none;
            border-top: 2px solid #1a5490;
            margin-top: 10px;
            padding-top: 10px;
        }}
        .footer {{
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #666;
            font-size: 12px;
        }}
        .badge {{
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }}
        .badge-deductible {{
            background: #d4edda;
            color: #155724;
        }}
        .badge-personal {{
            background: #fff3cd;
            color: #856404;
        }}
        @media print {{
            body {{ padding: 0; }}
            .no-print {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>⚜️ ReceiptTrac</h1>
        <h2>Rapport Fiscal {year}</h2>
        <p>Résumé des dépenses et crédits d'impôt pour le Québec</p>
        <p><strong>Généré le:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>
    </div>
    
    <div class="summary-grid">
        <div class="summary-card">
            <h3>Dépenses Totales</h3>
            <div class="amount">${summary['total_spent']:,.2f}</div>
        </div>
        <div class="summary-card deductible">
            <h3>Déductions Potentielles</h3>
            <div class="amount">${deductible_total:,.2f}</div>
        </div>
        <div class="summary-card">
            <h3>Reçus Scannés</h3>
            <div class="amount">{len(receipts)}</div>
        </div>
    </div>
    
    <div class="section">
        <h2>📊 Résumé des Taxes (TPS/TVQ)</h2>
        <div class="tax-breakdown">
            <div class="tax-row">
                <span>TPS Payée (5%)</span>
                <span>${summary['total_gst']:,.2f}</span>
            </div>
            <div class="tax-row">
                <span>TVQ Payée (9.975%)</span>
                <span>${summary['total_qst']:,.2f}</span>
            </div>
            <div class="tax-row total">
                <span>Total des Taxes</span>
                <span>${summary['total_gst'] + summary['total_qst']:,.2f}</span>
            </div>
        </div>
    </div>
"""
        
        # Add deductible breakdown if any
        if deductible_breakdown:
            html += """
    <div class="section">
        <h2>✅ Dépenses Déductibles par Catégorie</h2>
        <table>
            <thead>
                <tr>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
"""
            category_notes = {
                "medical": "Frais médicaux (ligne 33099)",
                "office": "Frais de bureau à domicile",
                "transport": "Frais de déplacement",
                "professional": "Frais professionnels",
                "education": "Frais de scolarité"
            }
            
            for cat, amount in sorted(deductible_breakdown.items(), key=lambda x: x[1], reverse=True):
                html += f"""
                <tr>
                    <td>{cat.title()}</td>
                    <td>${amount:,.2f}</td>
                    <td>{category_notes.get(cat, '')}</td>
                </tr>
"""
            
            html += """
            </tbody>
        </table>
    </div>
"""
        
        # Add all receipts table
        html += f"""
    <div class="section">
        <h2>📄 Tous les Reçus ({len(receipts)})</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Marchand</th>
                    <th>Catégorie</th>
                    <th>Total</th>
                    <th>TPS</th>
                    <th>TVQ</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
"""
        
        for r in sorted(receipts, key=lambda x: x.get("date", ""), reverse=True):
            cat = r.get("category", "other")
            is_deductible = cat in deductible_categories
            badge_class = "badge-deductible" if is_deductible else "badge-personal"
            badge_text = "DÉDUCTIBLE" if is_deductible else "PERSONNEL"
            
            html += f"""
                <tr>
                    <td>{r.get('date', 'N/A')}</td>
                    <td>{r.get('merchant', 'Inconnu')}</td>
                    <td>{cat.title()}</td>
                    <td>${r.get('total', 0):,.2f}</td>
                    <td>${r.get('tax_gst', 0):,.2f}</td>
                    <td>${r.get('tax_qst', 0):,.2f}</td>
                    <td><span class="badge {badge_class}">{badge_text}</span></td>
                </tr>
"""
        
        html += """
            </tbody>
        </table>
    </div>
    
    <div class="footer">
        <p><strong>ReceiptTrac</strong> - Gestionnaire de reçus pour le Québec</p>
        <p>Ce rapport est fourni à titre indicatif. Vérifiez vos déductions avec un comptable.</p>
        <p>⚜️ Made in Quebec</p>
    </div>
    
    <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 12px 24px; font-size: 16px; cursor: pointer;">
            🖨️ Imprimer / Sauvegarder PDF
        </button>
    </div>
</body>
</html>
"""
        
        return html
    
    def export_to_csv(self, year: int = None) -> str:
        """Export receipts to CSV for SimpleTax/ TurboTax"""
        import csv
        import io
        
        if year is None:
            year = datetime.now().year
        
        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"
        receipts = self.storage.get_receipts(start_date=start_date, end_date=end_date)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Headers optimized for SimpleTax
        writer.writerow([
            "Date", "Description", "Category", "Total", "TPS", "TVQ", 
            "Sous-total", "Région", "Méthode de paiement"
        ])
        
        for r in receipts:
            writer.writerow([
                r.get("date", ""),
                r.get("merchant", ""),
                r.get("category", ""),
                r.get("total", 0),
                r.get("tax_gst", 0),
                r.get("tax_qst", 0),
                r.get("subtotal", ""),
                r.get("region", ""),
                r.get("payment_method", "")
            ])
        
        return output.getvalue()
