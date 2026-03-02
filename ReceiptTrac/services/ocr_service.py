"""
Receipt OCR Service
Primary: OpenAI GPT-4 Vision
Backup: Google Cloud Vision
"""
import os
import base64
import json
from typing import Dict, Optional
from openai import OpenAI

try:
    from google.cloud import vision
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

class ReceiptOCR:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.google_client = None
        if GOOGLE_AVAILABLE and os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            self.google_client = vision.ImageAnnotatorClient()

    def scan_receipt(self, image_path: str) -> Dict:
        """
        Scan receipt - tries OpenAI first, falls back to Google Vision
        Returns structured receipt data
        """
        try:
            return self._scan_openai(image_path)
        except Exception as e:
            print(f"OpenAI failed: {e}, trying Google...")
            if self.google_client:
                return self._scan_google(image_path)
            raise Exception("Both OCR services failed")

    def _scan_openai(self, image_path: str) -> Dict:
        """OpenAI GPT-4 Vision extraction"""
        with open(image_path, "rb") as f:
            base64_image = base64.b64encode(f.read()).decode()

        prompt = """Analyze this receipt/invoice image and extract the following information in JSON format:
        {
            "merchant": "store name",
            "date": "YYYY-MM-DD",
            "total": float,
            "subtotal": float,
            "tax_gst": float (GST/TPS 5%),
            "tax_qst": float (QST/TVQ 9.975% for Quebec),
            "tax_total": float,
            "category": "one of: restaurant, grocery, transport, medical, office, entertainment, other",
            "items": [{"name": str, "price": float}],
            "payment_method": "credit/debit/cash/other",
            "address": "store address if visible",
            "document_type": "one of: receipt, invoice, bill",
            "confidence": float (0-1)
        }
        For Quebec receipts, ensure GST is 5% and QST is 9.975%. 
        If taxes not itemized, calculate them from total."""

        response = self.openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }],
            max_tokens=1000
        )

        # Parse JSON from response
        content = response.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]

        data = json.loads(content.strip())
        data["ocr_engine"] = "openai"
        return data

    def _scan_google(self, image_path: str) -> Dict:
        """Google Cloud Vision fallback"""
        with open(image_path, "rb") as f:
            content = f.read()

        image = vision.Image(content=content)
        response = self.google_client.document_text_detection(image=image)
        text = response.full_text_annotation.text

        # Basic parsing (simpler than OpenAI)
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        return {
            "merchant": lines[0] if lines else "Unknown",
            "date": None,
            "total": self._extract_amount(lines),
            "subtotal": None,
            "tax_gst": None,
            "tax_qst": None,
            "tax_total": None,
            "category": "other",
            "items": [],
            "payment_method": None,
            "address": None,
            "confidence": 0.6,
            "ocr_engine": "google",
            "raw_text": text
        }

    def _extract_amount(self, lines):
        """Extract total amount from text lines"""
        import re
        for line in reversed(lines):
            matches = re.findall(r"[\$]?([0-9]+\.[0-9]{2})", line)
            if matches:
                return float(matches[-1])
        return 0.0
