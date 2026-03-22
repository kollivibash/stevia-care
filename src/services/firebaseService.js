// ─── Stevia Care — Firebase Service (Pure REST — zero native modules) ────
// Works 100% in Expo Go — no native build required

import { API_BASE_URL } from '../constants/config';

const FIREBASE_API_KEY = 'AIzaSyALp0aZr4aaueA4HLNyuC7uiBSLfVaciVo';

// ── PHONE AUTH via Firebase REST API ─────────────────────────────────────

export async function sendPhoneOTP(phoneNumber) {
  try {
    const formatted = phoneNumber.startsWith('+')
      ? phoneNumber
      : `+91${phoneNumber.replace(/\D/g, '')}`;

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${FIREBASE_API_KEY}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          phoneNumber:    formatted,
          recaptchaToken: 'test-token',
        }),
      }
    );
    const data = await res.json();
    if (data.error) {
      const errorMap = {
        'INVALID_PHONE_NUMBER':        'Invalid phone number. Use format: 9876543210',
        'TOO_MANY_ATTEMPTS_TRY_LATER': 'Too many attempts. Wait a few minutes.',
        'QUOTA_EXCEEDED':              'Daily SMS limit reached. Try tomorrow.',
      };
      const msg = data.error.message || 'Failed to send OTP';
      return { success: false, error: errorMap[msg] || msg };
    }
    return { success: true, sessionInfo: data.sessionInfo };
  } catch (e) {
    return { success: false, error: 'Network error. Check your connection.' };
  }
}

export async function verifyPhoneOTP(sessionInfo, otp) {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${FIREBASE_API_KEY}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionInfo, code: otp }),
      }
    );
    const data = await res.json();
    if (data.error) {
      const errorMap = {
        'INVALID_CODE':           'Wrong OTP. Please check and try again.',
        'SESSION_EXPIRED':        'OTP expired. Please request a new one.',
        'INVALID_SESSION_INFO':   'Session expired. Please start over.',
      };
      const msg = data.error.message || 'OTP verification failed';
      return { success: false, error: errorMap[msg] || msg };
    }
    return {
      success:   true,
      idToken:   data.idToken,
      phone:     data.phoneNumber,
      uid:       data.localId,
      isNewUser: data.isNewUser || false,
    };
  } catch (e) {
    return { success: false, error: 'Network error. Check your connection.' };
  }
}

// ── NOTIFICATIONS — stub for Expo Go ─────────────────────────────────────
// Real push notifications require a dev build (EAS Build)
// These stubs prevent crashes in Expo Go during development

export async function registerForPushNotifications(authToken) {
  console.log('[Notif] Push notifications require EAS dev build — skipped in Expo Go');
  return null;
}

export async function scheduleAllMedicineReminders(reminders) {
  console.log('[Notif] Local notifications require EAS dev build — skipped in Expo Go');
  console.log(`[Notif] Would schedule reminders for ${reminders.length} members`);
  return 0;
}

export async function scheduleMedicineReminder(opts) {
  return null;
}

export async function cancelAllReminders() {
  return;
}

export async function cancelReminder(id) {
  return;
}
