"""
Quebec Tax Calculation Engine
Handles GST (TPS) 5% and QST (TVQ) 9.975%
"""
from typing import Dict, Optional
from datetime import datetime

class QuebecTaxEngine:
    """
    Quebec Sales Tax Calculator
    - GST (TPS): 5%
    - QST (TVQ): 9.975% (applied after GST)
    """

    GST_RATE = 0.05
    QST_RATE = 0.09975
    COMBINED_RATE = 0.14975  # Effective rate

    # Categories eligible for tax credits/deductions
    DEDUCTIBLE_CATEGORIES = [
        "medical", "office", "transport", "professional", "education"
    ]

    def __init__(self):
        self.regions = {
            "montreal": {"name_fr": "Montréal", "name_en": "Montreal", "tax_rate": self.COMBINED_RATE},
            "quebec": {"name_fr": "Québec", "name_en": "Quebec City", "tax_rate": self.COMBINED_RATE},
            "laval": {"name_fr": "Laval", "name_en": "Laval", "tax_rate": self.COMBINED_RATE},
            "gatineau": {"name_fr": "Gatineau", "name_en": "Gatineau", "tax_rate": self.COMBINED_RATE},
            "sherbrooke": {"name_fr": "Sherbrooke", "name_en": "Sherbrooke", "tax_rate": self.COMBINED_RATE},
            "trois-rivieres": {"name_fr": "Trois-Rivières", "name_en": "Trois-Rivières", "tax_rate": self.COMBINED_RATE},
            "autre": {"name_fr": "Autre/Ailleurs", "name_en": "Other/Elsewhere", "tax_rate": self.COMBINED_RATE}
        }

    def calculate_taxes(self, subtotal: float, 
                       gst_included: Optional[float] = None,
                       qst_included: Optional[float] = None) -> Dict:
        """
        Calculate Quebec taxes from subtotal
        If taxes provided, validate them, otherwise calculate
        """
        if subtotal <= 0:
            return {"gst": 0, "qst": 0, "total": 0}

        # Calculate expected taxes
        expected_gst = round(subtotal * self.GST_RATE, 2)
        qst_base = subtotal + expected_gst  # QST applied after GST
        expected_qst = round(qst_base * self.QST_RATE, 2)

        # If taxes provided, use those but flag discrepancies
        gst = gst_included if gst_included is not None else expected_gst
        qst = qst_included if qst_included is not None else expected_qst

        total = subtotal + gst + qst

        return {
            "subtotal": round(subtotal, 2),
            "gst": round(gst, 2),
            "qst": round(qst, 2),
            "tax_total": round(gst + qst, 2),
            "total": round(total, 2),
            "gst_valid": abs(gst - expected_gst) < 0.02,
            "qst_valid": abs(qst - expected_qst) < 0.02,
            "gst_rate": self.GST_RATE,
            "qst_rate": self.QST_RATE
        }

    def extract_from_total(self, total: float) -> Dict:
        """
        Reverse-calculate subtotal and taxes from total amount
        Useful when only total is visible on receipt
        """
        if total <= 0:
            return {"subtotal": 0, "gst": 0, "qst": 0, "total": 0}

        # Reverse calculation: total = subtotal * (1 + GST) * (1 + QST)
        # Actually: total = subtotal + GST + QST
        # Where GST = subtotal * 0.05, QST = (subtotal + GST) * 0.09975
        # So: total = subtotal * (1 + 0.05 + (1.05 * 0.09975))
        # total = subtotal * 1.14975

        subtotal = round(total / self.COMBINED_RATE, 2)
        return self.calculate_taxes(subtotal)

    def get_tax_summary(self, receipts: list) -> Dict:
        """Generate tax summary for multiple receipts"""
        summary = {
            "total_spent": 0,
            "total_gst": 0,
            "total_qst": 0,
            "deductible_amount": 0,
            "by_category": {},
            "by_region": {}
        }

        for receipt in receipts:
            cat = receipt.get("category", "other")
            region = receipt.get("region", "autre")
            total = receipt.get("total", 0)
            gst = receipt.get("tax_gst", 0)
            qst = receipt.get("tax_qst", 0)

            summary["total_spent"] += total
            summary["total_gst"] += gst
            summary["total_qst"] += qst

            if cat in self.DEDUCTIBLE_CATEGORIES:
                summary["deductible_amount"] += total

            # By category
            if cat not in summary["by_category"]:
                summary["by_category"][cat] = {"count": 0, "total": 0}
            summary["by_category"][cat]["count"] += 1
            summary["by_category"][cat]["total"] += total

            # By region
            if region not in summary["by_region"]:
                summary["by_region"][region] = {"count": 0, "total": 0}
            summary["by_region"][region]["count"] += 1
            summary["by_region"][region]["total"] += total

        return summary

    def export_simpletax_format(self, receipts: list) -> str:
        """Export receipts in SimpleTax CSV format"""
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)

        # SimpleTax headers
        writer.writerow(["Date", "Description", "Category", "Amount", "GST", "QST", "Region"])

        for r in receipts:
            writer.writerow([
                r.get("date", ""),
                r.get("merchant", ""),
                r.get("category", ""),
                r.get("total", 0),
                r.get("tax_gst", 0),
                r.get("tax_qst", 0),
                r.get("region", "")
            ])

        return output.getvalue()
