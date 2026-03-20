"""Stevia Care PDF Text Extraction"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.routes.auth import get_current_user
import io

router = APIRouter(prefix="/api/v1/pdf", tags=["PDF"])

@router.post("/extract")
async def extract_pdf_text(file: UploadFile = File(...), current_user=Depends(get_current_user)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files supported")
    try:
        contents = await file.read()
        # Try pdfplumber first (better for lab report tables)
        try:
            import pdfplumber
            text = ""
            with pdfplumber.open(io.BytesIO(contents)) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t: text += t + "\n"
            if text.strip():
                return {"success": True, "text": text.strip()}
        except ImportError:
            pass
        # Fallback to PyPDF2
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(contents))
            text = "\n".join(p.extract_text() or "" for p in reader.pages)
            if text.strip():
                return {"success": True, "text": text.strip()}
        except ImportError:
            pass
        raise HTTPException(500, "Install PDF libs: pip install pdfplumber PyPDF2")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed: {str(e)}")

@router.get("/ping")
async def ping():
    libs = {}
    try: import pdfplumber; libs["pdfplumber"] = "✅"
    except: libs["pdfplumber"] = "❌ missing"
    try: import PyPDF2; libs["PyPDF2"] = "✅"
    except: libs["PyPDF2"] = "❌ missing"
    return {"status": "ok", "libs": libs}
