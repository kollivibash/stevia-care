from fastapi import APIRouter, Depends, HTTPException
from app.routes.auth import get_current_user
from app.models.health import LabReportRequest, ChatRequest, PrescriptionRequest, FamilyAnalysisRequest, CycleAnalysisRequest
from app.services import ai_service
from app.database import get_db
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/analyze-lab")
async def analyze_lab(data: LabReportRequest, current_user = Depends(get_current_user)):
    try:
        result = await ai_service.analyze_lab_report(
            report_text=data.report_text,
            age=current_user.get("age", 30),
            gender=current_user.get("gender", "unknown"),
            conditions=current_user.get("conditions", ""),
            medications=current_user.get("medications", "")
        )
        db = get_db()
        report = {
            "user_id": str(current_user["_id"]),
            "member_name": data.member_name or current_user["name"],
            "raw_text": data.report_text,
            "result": result,
            "created_at": datetime.utcnow()
        }
        inserted = await db.lab_reports.insert_one(report)
        return {"id": str(inserted.inserted_id), "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/lab-reports")
async def get_lab_reports(current_user = Depends(get_current_user)):
    db = get_db()
    reports = await db.lab_reports.find({"user_id": str(current_user["_id"])}).sort("created_at", -1).to_list(50)
    for r in reports:
        r["id"] = str(r["_id"])
        del r["_id"]
    return {"reports": reports}

@router.post("/chat")
async def chat(data: ChatRequest, current_user = Depends(get_current_user)):
    try:
        messages = [{"role": m.role, "content": m.content} for m in data.messages]
        reply = await ai_service.chat_with_aria(
            messages=messages,
            age=current_user.get("age", 30),
            gender=current_user.get("gender", "unknown"),
            conditions=current_user.get("conditions", ""),
            medications=current_user.get("medications", "")
        )
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse-prescription")
async def parse_prescription(data: PrescriptionRequest, current_user = Depends(get_current_user)):
    try:
        result = await ai_service.parse_prescription(
            prescription_text=data.prescription_text,
            breakfast=data.breakfast_time,
            lunch=data.lunch_time,
            dinner=data.dinner_time
        )
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-family")
async def analyze_family(data: FamilyAnalysisRequest, current_user = Depends(get_current_user)):
    try:
        result = await ai_service.analyze_family_health(data.members)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-cycle")
async def analyze_cycle(data: CycleAnalysisRequest, current_user = Depends(get_current_user)):
    try:
        result = await ai_service.analyze_cycle_health(
            cycles=data.cycles,
            age=data.age,
            symptoms=data.symptoms or [],
            bmi=data.bmi
        )
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
