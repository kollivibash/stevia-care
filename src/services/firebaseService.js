// Stevia Care — Firebase Service (REST API only)
const FIREBASE_API_KEY = 'AIzaSyALp0aZr4aaueA4HLNyuC7uiBSLfVaciVo';

export async function sendPhoneOTP(phoneNumber) {
  try {
    const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber.replace(/\D/g, '')}`;
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formatted, recaptchaToken: 'test-token' }),
      }
    );
    const data = await res.json();
    if (data.error) return { success: false, error: data.error.message };
    return { success: true, sessionInfo: data.sessionInfo };
  } catch (e) {
    return { success: false, error: 'Network error.' };
  }
}

export async function verifyPhoneOTP(sessionInfo, otp) {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionInfo, code: otp }),
      }
    );
    const data = await res.json();
    if (data.error) return { success: false, error: data.error.message };
    return { success: true, idToken: data.idToken, phone: data.phoneNumber, uid: data.localId };
  } catch (e) {
    return { success: false, error: 'Network error.' };
  }
}
