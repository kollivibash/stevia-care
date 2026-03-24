// ─── Stevia Care — AI Service (Groq llama-3.3-70b) ───────────────────────
import { GROQ_API_KEY } from '../constants/config';

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ── Core caller (single turn) ─────────────────────────────────────────────
async function callGroq(systemPrompt, userContent, maxTokens = 2000) {
  const key = GROQ_API_KEY;
  if (!key || key === 'YOUR_GROQ_API_KEY_HERE' || key === '') {
    throw new Error('Groq API key not set. Add GROQ_API_KEY in src/constants/config.js');
  }
  const res = await fetch(GROQ_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model:      GROQ_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userContent  },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

// ── Core caller (multi-turn chat) ─────────────────────────────────────────
async function callGroqChat(systemPrompt, messages, maxTokens = 1500) {
  const key = GROQ_API_KEY;
  if (!key || key === 'YOUR_GROQ_API_KEY_HERE' || key === '') {
    throw new Error('Groq API key not set.');
  }
  const res = await fetch(GROQ_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model:      GROQ_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

function parseJSON(text) {
  try {
    if (typeof text === 'object') return text;
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return { raw: text };
  }
}

// ── 1. LAB REPORT ANALYZER ───────────────────────────────────────────────
export async function analyzeLabReport({ reportText, age, gender, conditions, medications }) {
  const system = `You are MedLens, expert clinical pathologist AI for Indian patients.
Analyze every single parameter with Indian standard reference ranges.
GREEN = normal, YELLOW = borderline (within 20% of limit), RED = significantly abnormal.
Respond ONLY in valid JSON, no markdown.`;

  const user = `Patient: ${age || 30}yo ${gender || 'unknown'}. Conditions: ${conditions || 'none'}. Meds: ${medications || 'none'}.

LAB REPORT:
${reportText}

Respond ONLY with this JSON:
{"overall_status":"Normal|Borderline|Abnormal","summary":"2-3 sentence summary","critical_alerts":[],"parameters":[{"name":"","value":"","reference_range":"","status":"GREEN|YELLOW|RED","deviation":"","explanation":"","action":""}],"abnormal_count":0,"borderline_count":0,"normal_count":0,"key_findings":[],"diet_advice":[],"lifestyle_suggestions":[],"follow_up_tests":[],"consult_doctor_if":[],"disclaimer":"AI analysis only. Consult your doctor."}`;

  const text = await callGroq(system, user, 4000);
  return parseJSON(text);
}

// ── 2. HEALTH CHAT ────────────────────────────────────────────────────────
export async function sendHealthChatMessage({ messages, userProfile, language }) {
  const { age, gender, conditions, medications } = userProfile || {};
  const lang = language && language !== 'English'
    ? `IMPORTANT: Respond ONLY in ${language} language.` : '';

  const system = `You are Stevia AI, warm health assistant for Indian families. ${lang}
Patient: Age ${age || 'unknown'}, ${gender || 'unknown'}. Conditions: ${conditions || 'none'}. Meds: ${medications || 'none'}.
Be warm, practical, empathetic. For emergencies say CALL 108 immediately.
Never suggest stopping prescribed medicines. Add brief disclaimer for medical advice.`;

  return await callGroqChat(system, messages, 1500);
}

// ── 3. SYMPTOM CHECKER ────────────────────────────────────────────────────
export async function analyzeSymptoms({ symptoms, age, gender, existingConditions }) {
  const system = `You are a medical AI for Indian patients. Analyze symptoms carefully.
Never diagnose definitively. Always recommend professional consultation. Respond ONLY in valid JSON.`;

  const user = `Symptoms: ${symptoms.join(', ')}. Age: ${age || 'unknown'}, Gender: ${gender || 'unknown'}. Conditions: ${existingConditions || 'none'}.

Respond ONLY with JSON:
{"possibleConditions":[{"name":"","probability":"High|Medium|Low","description":""}],"urgency":"emergency|doctor|monitor|home","urgencyReason":"","redFlags":[],"homeRemedies":[],"whenToSeeDoctor":"","disclaimer":"AI info only. Always consult a doctor."}`;

  const text = await callGroq(system, user, 1500);
  return parseJSON(text);
}

// ── 4. PRESCRIPTION PARSER ────────────────────────────────────────────────
export async function parsePrescription({ prescriptionText, breakfastTime, lunchTime, dinnerTime }) {
  const system = `You are a precise prescription parser for Indian medicines. Respond ONLY in valid JSON.`;

  const user = `Parse this prescription. Meals: Breakfast ${breakfastTime || '08:00'}, Lunch ${lunchTime || '13:00'}, Dinner ${dinnerTime || '20:00'}.

PRESCRIPTION:
${prescriptionText}

Respond ONLY with JSON:
{"medicines":[{"name":"","dosage":"","frequency":"OD|BD|TDS|QID","times":["08:00"],"with_food":true,"duration_days":7,"notes":""}],"general_advice":[],"follow_up_note":""}`;

  const text = await callGroq(system, user, 2000);
  return parseJSON(text);
}

// ── 5. DRUG INTERACTIONS ──────────────────────────────────────────────────
export async function checkDrugInteractions(medicines) {
  const system = `You are a clinical pharmacist. Check drug interactions including Ayurvedic herbs. Respond ONLY in valid JSON.`;

  const user = `Check interactions between: ${medicines.join(', ')}

Respond ONLY with JSON:
{"overall_risk":"Safe|Caution|Dangerous","summary":"","interactions":[{"drug1":"","drug2":"","severity":"Safe|Mild|Moderate|Severe","effect":"","recommendation":""}],"general_advice":[],"disclaimer":"Always consult your doctor."}`;

  const text = await callGroq(system, user, 2000);
  return parseJSON(text);
}

// ── 6. FAMILY HEALTH ──────────────────────────────────────────────────────
export async function analyzeFamilyHealth(familyData) {
  const system = `You are a family health analyst for Indian families. Respond ONLY in valid JSON.`;
  const user   = `Analyze: ${JSON.stringify(familyData)}\n\nRespond ONLY with JSON:\n{"family_health_score":75,"overall_summary":"","members":[{"name":"","score":80,"status":"Good|Fair|Needs Attention","key_risks":[],"immediate_actions":[]}],"family_insights":[],"improvement_plan":[]}`;

  const text = await callGroq(system, user, 2000);
  return parseJSON(text);
}

// ── 7. CYCLE HEALTH ───────────────────────────────────────────────────────
export async function analyzeCycleHealth({ cycles, age, symptoms, bmi, lifestyle }) {
  const system = `You are a women's health AI specialising in menstrual health and PCOD for Indian women. Respond ONLY in valid JSON.`;
  const user   = `Age: ${age}, BMI: ${bmi || 'unknown'}. Cycles: ${JSON.stringify(cycles)}. Symptoms: ${symptoms?.join(', ') || 'none'}.

Respond ONLY with JSON:
{"next_period":{"estimated_date":"YYYY-MM-DD","confidence_window_days":3},"ovulation_window":{"start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD"},"cycle_analysis":{"regularity":"Regular|Irregular","avg_cycle_length":28,"summary":""},"pcod_risk":{"level":"Low|Moderate|High","explanation":""},"lifestyle_suggestions":{"diet":[],"exercise":[],"stress":[]},"when_to_see_doctor":[],"disclaimer":"Consult a gynecologist for medical advice."}`;

  const text = await callGroq(system, user, 2000);
  return parseJSON(text);
}
