"""
Bank Statement Import Service
Handles CSV parsing and AI cleanup of transactions
"""
import csv
import io
import os
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime
from openai import OpenAI

class BankImportService:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def parse_csv(self, file_content: str, filename: str) -> List[Dict]:
        """Parse raw CSV content into standardized transactions."""
        # Determine dialect
        try:
            head = file_content[0:1024]
            dialect = csv.Sniffer().sniff(head)
        except Exception:
            dialect = csv.excel
        
        reader = csv.reader(io.StringIO(file_content), dialect)
        rows = list(reader)
        
        if not rows:
            return []
            
        # Basic heuristic mapping: 
        # Most bank CSVs have structured shapes.
        # Desjardins: Date, Description, Retrait (Out), Dépôt (In), Solde
        # RBC: Account, Date, Trans Details, Details, CAD
        # We'll rely heavily on AI to clean and extract the fields from the row
        
        # Batching rows to OpenAI to save time/cost. Group max 20 at a time.
        MAX_BATCH = 20
        all_cleaned_transactions = []
        
        current_batch = []
        for i, row in enumerate(rows):
            # Skip empty rows
            if not any(row): continue
            
            # Simple check if row looks like it has a date and numbers (heuristically skipping headers)
            row_str = " | ".join(row).strip()
            if len(row_str) > 5:
                current_batch.append({"id": i, "raw": row_str})
                
            if len(current_batch) >= MAX_BATCH:
                cleaned = self._enrich_transactions(current_batch)
                all_cleaned_transactions.extend(cleaned)
                current_batch = []
                
        # Send remaining
        if current_batch:
            cleaned = self._enrich_transactions(current_batch)
            all_cleaned_transactions.extend(cleaned)
            
        return all_cleaned_transactions
        
    def _enrich_transactions(self, raw_rows: List[Dict]) -> List[Dict]:
        """Use AI to parse dates, clean merchants, and assign categories"""
        if not raw_rows:
            return []
            
        prompt = f"""
        Analyze these raw bank statement rows (CSV format, pip-separated).
        Extract expenses/withdrawals (ignore deposits unless they are refunds).
        For each transaction, clean up the messy merchant name (e.g. "POS TRAN 1234 MCDONALDS" -> "McDonalds").
        Assign one of these exact categories: restaurant, grocery, transport, medical, office, entertainment, utilities, education, other.
        Parse the date into YYYY-MM-DD. Convert the amount to a positive float representing the expense size.
        
        Format your response as pure JSON, an array of objects matching this exact structure:
        [
            {{
                "original_id": int,
                "date": "YYYY-MM-DD",
                "merchant": "Clean Name",
                "amount": float,
                "category": "category_name",
                "is_expense": true/false
            }}
        ]
        
        Raw Data:
        {json.dumps(raw_rows)}
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
                temperature=0.0
            )
            
            content = response.choices[0].message.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
                
            parsed_data = json.loads(content.strip())
            
            # Filter and map
            results = []
            for item in parsed_data:
                if item.get("is_expense") and item.get("amount", 0) > 0:
                    results.append({
                        "date": item.get("date"),
                        "merchant": item.get("merchant", "Unknown"),
                        "total": item.get("amount", 0),
                        "category": item.get("category", "other"),
                        # We won't know taxes from a bank statement, let the tax engine reverse-calculate it later
                        "subtotal": None,
                        "tax_gst": None,
                        "tax_qst": None,
                        "tax_total": None,
                        "region": "autre",
                        "ocr_engine": "bank_import",
                        "confidence": 1.0,
                        "payment_method": "bank"
                    })
            return results
            
        except Exception as e:
            logging.error(f"Failed to process bank statement batch: {e}")
            return []
