"""
Stevia Care — Groq AI Routes
All AI calls go through here — key stays safe on server
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.routes.auth import get_current_user
import httpx, os, json

router = APIRouter(prefix="/ai", tags=["AI"])

GROQ_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


async def call_groq(system: str, user: str, max_tokens: int = 2000) -> str:
    if not GROQ_KEY:
        raise HTTPException(500, "GROQ_API_KEY not set on server")
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={
                "model": GROQ_MODEL,
                "max_tokens": max_tokens,
                "temperature": 0.7,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user",   "content": user},
                ],
            },
        )
        if not res.is_success:
            raise HTTPException(502, f"Groq error: {res.status_code} {res.text}")
        data = res.json()
        return data["choices"][0]["message"]["content"]


async def call_groq_chat(system: str, messages: list, max_tokens: int = 1500) -> str:
    if not GROQ_KEY:
        raise HTTPException(500, "GROQ_API_KEY not set on server")
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={
                "model": GROQ_MODEL,
                "max_tokens": max_tokens,
                "messages": [{"role": "system", "content": system}] + messages,
            },
        )
        if not res.is_success:
            raise HTTPException(502, f"Groq error: {res.status_code}")
        return res.json()["choices"][0]["message"]["content"]


def parse_json(text: str) -> dict:
    try:
        clean = text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except:
        return {"raw": text}


# ── Models ────────────────────────────────────────────────────────────────
class LabReportRequest(BaseModel):
    reportText:  str
    age:         Optional[int]  = 30
    gender:      Optional[str]  = "unknown"
    conditions:  Optional[str]  = ""
    medications: Optional[str]  = ""

class ChatMessage(BaseModel):
    role:    str
    content: str

class ChatRequest(BaseModel):
    messages:    List[ChatMessage]
    age:         Optional[int]  = 30
    gender:      Optional[str]  = "unknown"
    conditions:  Optional[str]  = ""
    medications: Optional[str]  = ""
    language:    Optional[str]  = "English"

class SymptomRequest(BaseModel):
    symptoms:           List[str]
    age:                Optional[int] = 30
    gender:             Optional[str] = "unknown"
    existingConditions: Optional[str] = ""

class PrescriptionRequest(BaseModel):
    prescriptionText: str
    breakfastTime:    Optional[str] = "08:00"
    lunchTime:        Optional[str] = "13:00"
    dinnerTime:       Optional[str] = "20:00"

class DrugInteractionRequest(BaseModel):
    medicines: List[str]

class FamilyHealthRequest(BaseModel):
    familyData: dict


# ── Routes ────────────────────────────────────────────────────────────────
@router.get("/ping")
async def ping():
    return {"status": "ok", "groq_configured": bool(GROQ_KEY), "model": GROQ_MODEL}


@router.post("/lab-report")
async def analyze_lab_report(req: LabReportRequest, current_user=Depends(get_current_user)):
    system = """You are MedLens, an expert clinical pathologist AI for Indian patients.
Analyze lab reports with extreme precision using standard Indian laboratory reference ranges.
You MUST identify EVERY abnormal value. Respond ONLY in valid JSON, no markdown."""

    user = f"""Patient: {req.age} years old, {req.gender}.
Conditions: {req.conditions or 'none'}. Medications: {req.medications or 'none'}.

LAB REPORT:
{req.reportText}

Respond ONLY with this JSON:
{{"overall_status":"Normal|Borderline|Abnormal","summary":"2-3 sentence summary","critical_alerts":["urgent issues"],"parameters":[{{"name":"name","value":"value with unit","reference_range":"normal range","status":"GREEN|YELLOW|RED","deviation":"how far from normal","explanation":"plain English","action":"what to do"}}],"abnormal_count":0,"borderline_count":0,"normal_count":0,"key_findings":["finding with value"],"diet_advice":["Indian food advice"],"lifestyle_suggestions":["suggestion"],"follow_up_tests":["test with reason"],"consult_doctor_if":["condition"],"disclaimer":"AI analysis only. Consult your doctor."}}"""

    text = await call_groq(system, user, 4000)
    return parse_json(text)


@router.post("/chat")
async def health_chat(req: ChatRequest, current_user=Depends(get_current_user)):
    lang_inst = f"IMPORTANT: Respond ONLY in {req.language} language." if req.language != "English" else ""
    system = f"""You are Stevia AI, a warm and knowledgeable personal health assistant for Indian families.
{lang_inst}
User profile: Age {req.age}, Gender: {req.gender}, Conditions: {req.conditions or 'none'}, Medications: {req.medications or 'none'}.
Rules: Be warm and practical. For emergencies say CALL 108. Never stop prescribed medication. Add disclaimer for medical advice."""

    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    text = await call_groq_chat(system, messages, 1500)
    return {"response": text}


@router.post("/symptom-checker")
async def check_symptoms(req: SymptomRequest, current_user=Depends(get_current_user)):
    system = "You are a medical AI for Indian patients. Help understand symptoms. Never diagnose definitively. Respond ONLY in valid JSON."
    user = f"""Patient symptoms: {", ".join(req.symptoms)}
Age: {req.age}, Gender: {req.gender}, Conditions: {req.existingConditions or "none"}

Respond ONLY with:
{{"possibleConditions":[{{"name":"condition","probability":"High|Medium|Low","description":"brief"}}],"urgency":"emergency|doctor|monitor|home","urgencyReason":"reason","redFlags":["flag"],"homeRemedies":["remedy"],"whenToSeeDoctor":"guidance","disclaimer":"AI info only. Consult a doctor."}}"""

    text = await call_groq(system, user, 1500)
    return parse_json(text)


@router.post("/parse-prescription")
async def parse_prescription(req: PrescriptionRequest, current_user=Depends(get_current_user)):
    system = "You are a precise prescription parser for Indian medicines. Respond ONLY in valid JSON."
    user = f"""Parse this prescription. Meal times: Breakfast {req.breakfastTime}, Lunch {req.lunchTime}, Dinner {req.dinnerTime}.

PRESCRIPTION:
{req.prescriptionText}

Respond ONLY with:
{{"medicines":[{{"name":"name","dosage":"dose","frequency":"OD|BD|TDS|QID","times":["08:00"],"with_food":true,"duration_days":7,"notes":"instructions"}}],"general_advice":["advice"],"follow_up_note":"timing"}}"""

    text = await call_groq(system, user, 2000)
    return parse_json(text)


@router.post("/drug-interactions")
async def check_drug_interactions(req: DrugInteractionRequest, current_user=Depends(get_current_user)):
    system = "You are a clinical pharmacist. Check drug interactions including Ayurvedic herbs. Respond ONLY in valid JSON."
    user = f"""Check interactions between: {", ".join(req.medicines)}

Respond ONLY with:
{{"overall_risk":"Safe|Caution|Dangerous","summary":"plain English summary","interactions":[{{"drug1":"name","drug2":"name","severity":"Safe|Mild|Moderate|Severe","effect":"what happens","recommendation":"what to do"}}],"general_advice":["advice"],"disclaimer":"Always consult your doctor."}}"""

    text = await call_groq(system, user, 2000)
    return parse_json(text)


@router.post("/family-health")
async def analyze_family_health(req: FamilyHealthRequest, current_user=Depends(get_current_user)):
    system = "You are a family health analyst for Indian families. Respond ONLY in valid JSON."
    user = f"""Analyze: {json.dumps(req.familyData)}
Respond ONLY with:
{{"family_health_score":75,"overall_summary":"overview","members":[{{"name":"name","score":80,"status":"Good|Fair|Needs Attention","key_risks":["risk"],"immediate_actions":["action"]}}],"family_insights":["insight"],"improvement_plan":["plan"]}}"""

    text = await call_groq(system, user, 2000)
    return parse_json(text)
