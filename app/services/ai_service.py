import httpx, os, json

GROQ_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

async def call_gpt(system: str, user: str, max_tokens: int = 2000) -> str:
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={"model": GROQ_MODEL, "max_tokens": max_tokens,
                  "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]},
        )
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

async def call_gpt_chat(system: str, messages: list, max_tokens: int = 1500) -> str:
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={"model": GROQ_MODEL, "max_tokens": max_tokens,
                  "messages": [{"role": "system", "content": system}] + messages},
        )
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

def parse_json(text: str) -> dict:
    try:
        clean = text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except:
        return {"raw": text}

async def analyze_lab_report(report_text, age, gender, conditions, medications):
    text = await call_gpt("You are a medical lab analyst. Respond in valid JSON only.",
        f"Analyze lab report for {age}yo {gender}.\n\nREPORT:\n{report_text}\n\nRespond with JSON: {{\"summary\":\"\",\"overall_status\":\"Normal|Borderline|Abnormal\",\"parameters\":[{{\"name\":\"\",\"value\":\"\",\"reference_range\":\"\",\"status\":\"GREEN|YELLOW|RED\",\"explanation\":\"\"}}],\"key_findings\":[],\"lifestyle_suggestions\":[],\"consult_doctor_if\":[],\"disclaimer\":\"\"}}", 2500)
    return parse_json(text)

async def chat_with_aria(messages, age, gender, conditions, medications):
    return await call_gpt_chat(f"You are Stevia AI, a health assistant for Indian families. Age {age}, Gender: {gender}, Conditions: {conditions or 'none'}. Be warm and practical.", messages, 1500)

async def parse_prescription(prescription_text, breakfast, lunch, dinner):
    text = await call_gpt("You are a prescription parser. Respond in valid JSON only.",
        f"Parse prescription. Meals: Breakfast {breakfast}, Lunch {lunch}, Dinner {dinner}.\n\n{prescription_text}\n\nRespond with JSON: {{\"medications\":[{{\"name\":\"\",\"dosage\":\"\",\"frequency\":\"OD|BD|TDS\",\"times\":[\"08:00\"],\"with_food\":true,\"duration_days\":7}}],\"general_advice\":[],\"follow_up_note\":\"\"}}", 2000)
    return parse_json(text)

async def analyze_family_health(family_data):
    text = await call_gpt("You are a family health analyst. Respond in valid JSON only.",
        f"Analyze: {json.dumps(family_data)}\n\nRespond with JSON: {{\"family_health_score\":75,\"overall_summary\":\"\",\"members\":[{{\"name\":\"\",\"score\":80,\"status\":\"Good|Fair|Needs Attention\",\"key_risks\":[],\"immediate_actions\":[]}}],\"family_insights\":[],\"improvement_plan\":[]}}", 2000)
    return parse_json(text)

async def analyze_cycle_health(cycles, age, symptoms, bmi):
    text = await call_gpt("You are a women health AI. Respond in valid JSON only.",
        f"Analyze cycle. Age {age}, BMI {bmi}. Cycles: {json.dumps(cycles)}. Symptoms: {symptoms}.\n\nRespond with JSON: {{\"next_period\":{{\"estimated_date\":\"YYYY-MM-DD\",\"confidence_window_days\":3}},\"cycle_analysis\":{{\"regularity\":\"Regular|Irregular\",\"avg_cycle_length\":28,\"summary\":\"\"}},\"pcod_risk\":{{\"level\":\"Low|Moderate|High\",\"explanation\":\"\"}},\"lifestyle_suggestions\":{{\"diet\":[],\"exercise\":[]}},\"disclaimer\":\"\"}}", 2000)
    return parse_json(text)
