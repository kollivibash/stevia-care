from openai import AsyncOpenAI
from app.config import settings
import json

client = AsyncOpenAI(api_key=settings.openai_api_key)
MODEL = "gpt-4o-mini"

async def call_gpt(system: str, user: str, max_tokens: int = 2000) -> str:
    response = await client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ]
    )
    return response.choices[0].message.content

async def call_gpt_chat(system: str, messages: list, max_tokens: int = 1500) -> str:
    response = await client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[{"role": "system", "content": system}] + messages
    )
    return response.choices[0].message.content

def parse_json(text: str) -> dict:
    try:
        clean = text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except:
        return {"raw": text}

async def analyze_lab_report(report_text: str, age: int, gender: str, conditions: str, medications: str) -> dict:
    system = "You are MedLens, a medical lab report analysis assistant. Always respond in valid JSON only."
    user = f"""Analyze this lab report for a {age}-year-old {gender} with conditions: {conditions or 'none'}, medications: {medications or 'none'}.

LAB REPORT:
{report_text}

Respond ONLY with this JSON:
{{
  "summary": "2-3 sentence plain English summary",
  "overall_status": "Normal|Borderline|Abnormal",
  "parameters": [{{"name":"","value":"","reference_range":"","status":"GREEN|YELLOW|RED","explanation":""}}],
  "key_findings": [""],
  "lifestyle_suggestions": [""],
  "consult_doctor_if": [""],
  "follow_up_tests": [""],
  "disclaimer": ""
}}"""
    text = await call_gpt(system, user, 2500)
    return parse_json(text)

async def chat_with_aria(messages: list, age: int, gender: str, conditions: str, medications: str) -> str:
    system = f"""You are Aria, an empathetic AI Health Copilot.
User: Age {age}, Gender: {gender}, Conditions: {conditions or 'none'}, Medications: {medications or 'none'}.
Be warm and practical. For emergencies advise calling emergency services immediately.
Never suggest stopping prescribed medication. Add disclaimer to health-specific answers."""
    return await call_gpt_chat(system, messages, 1500)

async def parse_prescription(prescription_text: str, breakfast: str, lunch: str, dinner: str) -> dict:
    system = "You are a precise prescription parser. Respond ONLY in valid JSON."
    user = f"""Parse this prescription. Meal times: Breakfast {breakfast}, Lunch {lunch}, Dinner {dinner}.

PRESCRIPTION:
{prescription_text}

Respond ONLY with this JSON:
{{
  "medications": [{{"name":"","generic_name":"","dosage":"","frequency":"OD|BD|TDS","times":["08:00"],"with_food":true,"duration_days":7,"special_instructions":""}}],
  "general_advice": [""],
  "food_restrictions": [""],
  "follow_up_note": ""
}}"""
    text = await call_gpt(system, user, 2000)
    return parse_json(text)

async def analyze_family_health(family_data: list) -> dict:
    system = "You are a family health analyst. Respond ONLY in valid JSON."
    user = f"""Analyze this family health data:
{json.dumps(family_data, indent=2)}

Respond ONLY with this JSON:
{{
  "family_health_score": 75,
  "overall_summary": "",
  "members": [{{"name":"","score":80,"status":"Good|Fair|Needs Attention","key_risks":[""],"immediate_actions":[""]}}],
  "family_insights": [""],
  "improvement_plan": [""]
}}"""
    text = await call_gpt(system, user, 2000)
    return parse_json(text)

async def analyze_cycle_health(cycles: list, age: int, symptoms: list, bmi: float) -> dict:
    system = "You are a compassionate women's health AI specialising in menstrual health and PCOD. Respond ONLY in valid JSON."
    user = f"""Analyze this menstrual health data:
Patient: Age {age}, BMI: {bmi or 'unknown'}
Cycle history: {json.dumps(cycles)}
Symptoms: {', '.join(symptoms) if symptoms else 'none'}

Respond ONLY with this JSON:
{{
  "next_period": {{"estimated_date": "YYYY-MM-DD", "confidence_window_days": 3}},
  "ovulation_window": {{"start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}},
  "cycle_analysis": {{"regularity": "Regular|Irregular|Highly Irregular", "avg_cycle_length": 28, "variation_days": 2, "summary": ""}},
  "pcod_risk": {{"level": "Low|Moderate|High", "indicators": [""], "explanation": ""}},
  "lifestyle_suggestions": {{"diet": [""], "exercise": [""], "stress": [""]}},
  "when_to_see_doctor": [""],
  "disclaimer": ""
}}"""
    text = await call_gpt(system, user, 2000)
    return parse_json(text)
