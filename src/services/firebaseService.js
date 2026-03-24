// ─── Stevia Care — OTP Service (Backend-based, no reCAPTCHA needed) ───────
const BASE = 'https://healthpilot-pz8o.onrender.com/api/v1/auth';

export async function sendPhoneOTP(phoneNumber) {
  try {
    const phone = phoneNumber.replace(/\D/g, '').replace(/^91/, '').slice(-10);
    const res = await fetch(`${BASE}/send-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.detail || 'Failed to send OTP' };
    // dev_otp is returned when Fast2SMS is not configured (for testing)
    return { success: true, sessionInfo: phone, devOtp: data.dev_otp || null };
  } catch (e) {
    return { success: false, error: 'Network error. Check your connection.' };
  }
}

export async function verifyPhoneOTP(phone, otp) {
  try {
    const cleanPhone = phone.replace(/\D/g, '').replace(/^91/, '').slice(-10);
    const res = await fetch(`${BASE}/verify-otp`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ phone: cleanPhone, otp }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.detail || 'Invalid OTP' };
    return {
      success: true,
      token:   data.token || data.access_token,
      user:    data.user,
    };
  } catch (e) {
    return { success: false, error: 'Network error. Check your connection.' };
  }
}
