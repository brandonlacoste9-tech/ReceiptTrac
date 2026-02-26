"""
Barcode & QR Code Scanner Service
Supports product barcodes, QR codes on receipts
"""
import os
import base64
import json
from typing import Dict, Optional, List
from openai import OpenAI

try:
    from pyzbar.pyzbar import decode
    from PIL import Image
    PYZBAR_AVAILABLE = True
except ImportError:
    PYZBAR_AVAILABLE = False

class BarcodeService:
    """Scan barcodes and QR codes from receipt images"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def scan_barcode(self, image_path: str) -> Dict:
        """
        Scan barcode/QR from image
        Tries pyzbar first, falls back to OpenAI Vision
        """
        if PYZBAR_AVAILABLE:
            try:
                return self._scan_with_pyzbar(image_path)
            except Exception as e:
                print(f"pyzbar failed: {e}, trying OpenAI...")
        
        return self._scan_with_openai(image_path)
    
    def _scan_with_pyzbar(self, image_path: str) -> Dict:
        """Fast barcode scanning with pyzbar"""
        image = Image.open(image_path)
        decoded_objects = decode(image)
        
        barcodes = []
        for obj in decoded_objects:
            barcodes.append({
                "type": obj.type,  # QRCODE, EAN13, CODE128, etc.
                "data": obj.data.decode("utf-8"),
                "rect": {
                    "left": obj.rect.left,
                    "top": obj.rect.top,
                    "width": obj.rect.width,
                    "height": obj.rect.height
                }
            })
        
        return {
            "found": len(barcodes) > 0,
            "count": len(barcodes),
            "barcodes": barcodes,
            "engine": "pyzbar"
        }
    
    def _scan_with_openai(self, image_path: str) -> Dict:
        """AI-powered barcode detection fallback"""
        with open(image_path, "rb") as f:
            base64_image = base64.b64encode(f.read()).decode()
        
        prompt = """Look for any barcodes or QR codes in this receipt image.
        Return JSON format:
        {
            "found": boolean,
            "barcodes": [
                {
                    "type": "QR_CODE|BARCODE|DATA_MATRIX",
                    "location": "top|bottom|center|left|right",
                    "description": "what it likely contains"
                }
            ]
        }
        If no barcodes found, return {"found": false, "barcodes": []}"""
        
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }],
            max_tokens=500
        )
        
        content = response.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        
        data = json.loads(content.strip())
        data["engine"] = "openai"
        return data
    
    def lookup_product(self, barcode: str) -> Dict:
        """
        Lookup product info from barcode
        Uses OpenAI to guess product from barcode pattern
        """
        # Check if it's a known format
        if barcode.startswith("978") or barcode.startswith("979"):
            return {"type": "ISBN", "category": "books", "deductible": True}
        elif len(barcode) == 12 or len(barcode) == 13:
            return {"type": "UPC/EAN", "category": "retail", "deductible": False}
        elif barcode.startswith("http"):
            return {"type": "QR_URL", "category": "digital", "deductible": False}
        
        return {"type": "UNKNOWN", "category": "other", "deductible": False}
