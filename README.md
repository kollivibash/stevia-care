# Stevia Care — Backend API

FastAPI backend for Stevia Care health app.

## Tech Stack
- **FastAPI** — Python web framework
- **MongoDB Atlas** — Database
- **Groq AI** — LLM for health analysis
- **Render** — Hosting

## Setup

### 1. Clone and install
```bash
git clone https://github.com/kollivibash/healthcopilot-backend.git
cd healthcopilot-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment variables
Create `.env` file:
```
MONGODB_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
GROQ_API_KEY=gsk_...
```

### 3. Run locally
```bash
uvicorn main:app --reload
```

## API Endpoints
- `POST /api/v1/auth/register` — Register user
- `POST /api/v1/auth/login` — Login
- `POST /api/v1/ai/chat` — AI health chat
- `POST /api/v1/ai/lab-report` — Lab report analysis
- `POST /api/v1/ai/symptom-checker` — Symptom checker
- `POST /api/v1/ai/drug-interactions` — Drug interaction check
- `POST /api/v1/data/sync` — Sync health data
- `GET /api/v1/data/all` — Get health data
- `POST /api/v1/pdf/extract` — Extract PDF text

## Deploy
Hosted on Render: https://healthpilot-pz8o.onrender.com
