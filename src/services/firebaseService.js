// ─── Stevia Care — OTP Service ────────────────────────────────────────────────
const BASE    = 'https://healthpilot-pz8o.onrender.com/api/v1/auth';
const TIMEOUT = 20000; // 20 seconds max

async function fetchWithTimeout(url, options, ms = TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Server is waking up. Please try again in 10 seconds.');
    throw e;
  }
}

export async function sendPhoneOTP(phoneNumber) {
  try {
    const phone = phoneNumber.replace(/\D/g, '').replace(/^91/, '').slice(-10);
    const res = await fetchWithTimeout(`${BASE}/send-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.detail || 'Failed to send OTP' };
    return { success: true, sessionInfo: phone, devOtp: data.dev_otp || null };
  } catch (e) {
    return { success: false, error: e.message || 'Network error. Check your connection.' };
  }
}

export async function verifyPhoneOTP(phone, otp) {
  try {
    const cleanPhone = phone.replace(/\D/g, '').replace(/^91/, '').slice(-10);
    const res = await fetchWithTimeout(`${BASE}/verify-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ phone: cleanPhone, otp }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.detail || 'Invalid OTP' };
    return { success: true, token: data.token || data.access_token, user: data.user };
  } catch (e) {
    return { success: false, error: e.message || 'Network error. Check your connection.' };
  }
}
