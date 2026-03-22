import httpx, os, json

GROQ_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

async def call_gpt(system, user, max_tokens=2000):
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={"model": GROQ_MODEL, "max_tokens": max_tokens,
                  "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]})
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

async def call_gpt_chat(system, messages, max_tokens=1500):
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.post(GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
            json={"model": GROQ_MODEL, "max_tokens": max_tokens,
                  "messages": [{"role": "system", "content": system}] + messages})
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

def parse_json(text):
    try:
        return json.loads(text.replace("```json","").replace("```","").strip())
    except:
        return {"raw": text}

async def analyze_lab_report(report_text, age, gender, conditions, medications):
    text = await call_gpt("Medical lab analyst. Respond in valid JSON only.",
        f"Analyze for {age}yo {gender}.\n\nREPORT:\n{report_text}\n\nJSON: {{'summary':'','overall_status':'Normal|Borderline|Abnormal','parameters':[{{'name':'','value':'','reference_range':'','status':'GREEN|YELLOW|RED','explanation':''}}],'key_findings':[],'lifestyle_suggestions':[],'consult_doctor_if':[],'disclaimer':''}}", 2500)
    return parse_json(text)

async def chat_with_aria(messages, age, gender, conditions, medications):
    return await call_gpt_chat(f"You are Stevia AI, health assistant for Indian families. Age {age}, {gender}. Conditions: {conditions or 'none'}.", messages, 1500)

async def parse_prescription(prescription_text, breakfast, lunch, dinner):
    text = await call_gpt("Prescription parser. Respond in valid JSON only.",
        f"Parse prescription.\n\n{prescription_text}\n\nJSON: {{'medications':[{{'name':'','dosage':'','frequency':'OD|BD|TDS','times':['08:00'],'with_food':true,'duration_days':7}}],'general_advice':[],'follow_up_note':''}}", 2000)
    return parse_json(text)

async def analyze_family_health(family_data):
    text = await call_gpt("Family health analyst. Respond in valid JSON only.",
        f"Analyze: {json.dumps(family_data)}\n\nJSON: {{'family_health_score':75,'overall_summary':'','members':[{{'name':'','score':80,'status':'Good|Fair|Needs Attention','key_risks':[],'immediate_actions':[]}}],'family_insights':[],'improvement_plan':[]}}", 2000)
    return parse_json(text)

async def analyze_cycle_health(cycles, age, symptoms, bmi):
    text = await call_gpt("Women health AI. Respond in valid JSON only.",
        f"Analyze cycle. Age {age}, BMI {bmi}. Cycles: {json.dumps(cycles)}.\n\nJSON: {{'next_period':{{'estimated_date':'YYYY-MM-DD','confidence_window_days':3}},'cycle_analysis':{{'regularity':'Regular|Irregular','avg_cycle_length':28,'summary':''}},'pcod_risk':{{'level':'Low|Moderate|High','explanation':''}},'lifestyle_suggestions':{{'diet':[],'exercise':[]}},'disclaimer':''}}", 2000)
    return parse_json(text)
