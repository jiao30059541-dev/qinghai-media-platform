#!/usr/bin/env python3
"""OCR + PDF text extraction service for AI media parsing.
Called by the Node.js API route via child_process.

Usage:
  python3 /opt/qinghai-media-platform/scripts/ocr-service.py <input_file> [--type=image|pdf]

Output: JSON to stdout with extracted text content.
"""
import sys
import json
import base64
import os
import tempfile

# OCR engines
try:
    import pytesseract
    from PIL import Image
    import io
    HAS_TESSERACT = True
except ImportError:
    HAS_TESSERACT = False

try:
    import fitz  # PyMuPDF
    HAS_PDF = True
except ImportError:
    HAS_PDF = False


def extract_text_from_image(image_path: str) -> str:
    """Use Tesseract OCR to extract Chinese/English text from image."""
    if not HAS_TESSERACT:
        return ""
    try:
        img = Image.open(image_path)
        # Preprocess: convert to RGB if RGBA
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        text = pytesseract.image_to_string(img, lang='chi_sim+eng')
        return text.strip()
    except Exception as e:
        return f"[OCR Error: {e}]"


def extract_text_from_pdf(pdf_path: str) -> str:
    """Use PyMuPDF to extract text from PDF pages."""
    if not HAS_PDF:
        return ""
    texts = []
    try:
        doc = fitz.open(pdf_path)
        for i, page in enumerate(doc):
            text = page.get_text()
            if text.strip():
                texts.append(f"[第{i+1}页]\n{text.strip()}")
        doc.close()
        return "\n\n".join(texts)
    except Exception as e:
        return f"[PDF Error: {e}]"


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No input file specified"}))
        sys.exit(1)
    
    input_path = sys.argv[1]
    file_type = "image"
    for arg in sys.argv[2:]:
        if arg.startswith("--type="):
            file_type = arg.split("=")[1]
    
    if not os.path.exists(input_path):
        print(json.dumps({"success": False, "error": f"File not found: {input_path}"}))
        sys.exit(1)
    
    text = ""
    if file_type == "pdf":
        text = extract_text_from_pdf(input_path)
        # Also try OCR on first page image for scanned PDFs
        if not text.strip() and HAS_PDF:
            try:
                doc = fitz.open(input_path)
                # Render first page as image and OCR it
                page = doc[0]
                pix = page.get_pixmap(dpi=200)
                img_data = pix.tobytes("png")
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
                    f.write(img_data)
                    temp_img = f.name
                text = extract_text_from_image(temp_img)
                os.unlink(temp_img)
                doc.close()
            except:
                pass
    else:
        text = extract_text_from_image(input_path)
    
    print(json.dumps({
        "success": True,
        "text": text,
        "char_count": len(text),
        "engine": "pytesseract" if file_type == "image" else "PyMuPDF",
    }))


if __name__ == "__main__":
    main()
