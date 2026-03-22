# Stevia Care — Mobile App

React Native health app built with Expo.

## Features
- 🤖 AI Health Chat (Groq LLaMA)
- 🧪 Lab Report Analyzer
- 💊 Medicine Reminders
- 👨‍👩‍👦 Family Health Dashboard
- 🌸 Period & PCOD Tracker
- ⚠️ Drug Interaction Checker
- 📄 Prescription Reader
- 🔴 Emergency SOS
- 🌿 11 Indian Languages

## Tech Stack
- **Expo SDK 54** — React Native framework
- **Groq AI** — LLaMA 3.3 70B for health AI
- **MongoDB Atlas** — Data storage
- **Render** — Backend hosting
- **EAS Build** — APK/IPA builds

## Setup

### 1. Clone and install
```bash
git clone https://github.com/kollivibhash/stevia-care.git
cd stevia-care
npm install --legacy-peer-deps
```

### 2. Add your API key
Create `src/constants/config.js`:
```js
export const GROQ_API_KEY = 'gsk_your_key_here';
export const API_BASE_URL = 'https://healthpilot-pz8o.onrender.com/api/v1';
export const MAPBOX_TOKEN = 'your_mapbox_token';
```

### 3. Run
```bash
npx expo start --tunnel
```

## Build APK
```bash
eas build --platform android --profile preview
```

## OTA Updates
```bash
eas update --branch preview --message "Your update"
```
