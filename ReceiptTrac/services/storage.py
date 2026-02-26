"""
Database Operations for ReceiptTrac
SQLite with regional and categorization support
"""
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path

class ReceiptStorage:
    def __init__(self, db_path: str = "receipttrac.db"):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS receipts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    merchant TEXT NOT NULL,
                    date TEXT,
                    total REAL,
                    subtotal REAL,
                    tax_gst REAL,
                    tax_qst REAL,
                    tax_total REAL,
                    category TEXT DEFAULT 'other',
                    region TEXT DEFAULT 'autre',
                    payment_method TEXT,
                    address TEXT,
                    image_path TEXT,
                    ocr_engine TEXT,
                    ocr_confidence REAL,
                    raw_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS receipt_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    receipt_id INTEGER,
                    name TEXT,
                    price REAL,
                    FOREIGN KEY (receipt_id) REFERENCES receipts(id)
                )
            """)

            # Create indexes for performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_receipts_category ON receipts(category)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_receipts_region ON receipts(region)")

            conn.commit()

    def save_receipt(self, data: Dict) -> int:
        """Save receipt and return ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO receipts 
                (merchant, date, total, subtotal, tax_gst, tax_qst, tax_total, 
                 category, region, payment_method, address, image_path, 
                 ocr_engine, ocr_confidence, raw_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data.get("merchant", "Unknown"),
                data.get("date"),
                data.get("total", 0),
                data.get("subtotal"),
                data.get("tax_gst"),
                data.get("tax_qst"),
                data.get("tax_total"),
                data.get("category", "other"),
                data.get("region", "autre"),
                data.get("payment_method"),
                data.get("address"),
                data.get("image_path"),
                data.get("ocr_engine"),
                data.get("confidence"),
                json.dumps(data) if isinstance(data, dict) else None
            ))

            receipt_id = cursor.lastrowid

            # Save items if present
            items = data.get("items", [])
            if items:
                for item in items:
                    cursor.execute("""
                        INSERT INTO receipt_items (receipt_id, name, price)
                        VALUES (?, ?, ?)
                    """, (receipt_id, item.get("name"), item.get("price")))

            conn.commit()
            return receipt_id

    def get_receipts(self, region: Optional[str] = None, 
                     category: Optional[str] = None,
                     start_date: Optional[str] = None,
                     end_date: Optional[str] = None) -> List[Dict]:
        """Get receipts with optional filters"""
        query = "SELECT * FROM receipts WHERE 1=1"
        params = []

        if region:
            query += " AND region = ?"
            params.append(region)
        if category:
            query += " AND category = ?"
            params.append(category)
        if start_date:
            query += " AND date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND date <= ?"
            params.append(end_date)

        query += " ORDER BY date DESC"

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)

            receipts = [dict(row) for row in cursor.fetchall()]
            return receipts

    def get_receipt_by_id(self, receipt_id: int) -> Optional[Dict]:
        """Get single receipt with items"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            cursor.execute("SELECT * FROM receipts WHERE id = ?", (receipt_id,))
            receipt = cursor.fetchone()

            if not receipt:
                return None

            receipt_dict = dict(receipt)

            # Get items
            cursor.execute("SELECT * FROM receipt_items WHERE receipt_id = ?", (receipt_id,))
            items = [dict(row) for row in cursor.fetchall()]
            receipt_dict["items"] = items

            return receipt_dict

    def delete_receipt(self, receipt_id: int) -> bool:
        """Delete receipt and its items"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM receipt_items WHERE receipt_id = ?", (receipt_id,))
            cursor.execute("DELETE FROM receipts WHERE id = ?", (receipt_id,))
            conn.commit()
            return cursor.rowcount > 0

    def get_spending_by_category(self, region: Optional[str] = None) -> List[Dict]:
        """Get aggregated spending by category"""
        query = """
            SELECT category, COUNT(*) as count, SUM(total) as total, 
                   SUM(tax_gst) as gst, SUM(tax_qst) as qst
            FROM receipts 
            WHERE 1=1
        """
        params = []

        if region:
            query += " AND region = ?"
            params.append(region)

        query += " GROUP BY category"

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
