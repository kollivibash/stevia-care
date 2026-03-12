import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from app.config import settings

# In-memory stores (replace with Redis in production)
otp_store = {}      # phone -> {otp, expires}
reset_store = {}    # email -> {token, expires}

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def generate_reset_token():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

# --- PHONE OTP ---
def send_phone_otp(phone: str) -> str:
    otp = generate_otp()
    otp_store[phone] = {
        "otp": otp,
        "expires": datetime.utcnow() + timedelta(minutes=10)
    }
    # In production: integrate Twilio/MSG91 here
    # For now: print to console (you'll see it in Render logs)
    print(f"[OTP] Phone {phone} → OTP: {otp}")
    return otp

def verify_phone_otp(phone: str, otp: str) -> bool:
    record = otp_store.get(phone)
    if not record:
        return False
    if datetime.utcnow() > record["expires"]:
        del otp_store[phone]
        return False
    if record["otp"] != otp:
        return False
    del otp_store[phone]
    return True

# --- EMAIL RESET ---
def send_reset_email(email: str, name: str) -> str:
    token = generate_reset_token()
    reset_store[email] = {
        "token": token,
        "expires": datetime.utcnow() + timedelta(hours=1)
    }
    
    reset_link = f"healthpilot://reset-password?token={token}&email={email}"
    web_link = f"https://healthpilot-pz8o.onrender.com/reset?token={token}&email={email}"
    
    # Send email via Gmail SMTP
    try:
        sender = getattr(settings, 'EMAIL_USER', None)
        password = getattr(settings, 'EMAIL_PASS', None)
        
        if sender and password:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Reset your HealthPilot password 🔐"
            msg['From'] = f"HealthPilot <{sender}>"
            msg['To'] = email
            
            html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f0f4ff; padding: 20px; border-radius: 16px;">
              <div style="background: linear-gradient(135deg, #0057B8, #00C896); border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">💙 HealthPilot</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Password Reset Request</p>
              </div>
              <div style="background: white; border-radius: 12px; padding: 24px;">
                <p style="color: #0F1729; font-size: 16px;">Hi <strong>{name}</strong>,</p>
                <p style="color: #64748B;">We received a request to reset your password. Click the button below to create a new one:</p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="{web_link}" style="background: linear-gradient(135deg, #0057B8, #00C896); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                    Reset My Password →
                  </a>
                </div>
                <p style="color: #94A3B8; font-size: 13px; text-align: center;">This link expires in <strong>1 hour</strong>. If you didn't request this, safely ignore this email.</p>
                <div style="background: #f0f4ff; border-radius: 8px; padding: 12px; margin-top: 16px;">
                  <p style="color: #64748B; font-size: 12px; margin: 0;">Or copy this link: <span style="color: #0057B8; word-break: break-all;">{web_link}</span></p>
                </div>
              </div>
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; text-align: center; margin-top: 16px;">© 2026 HealthPilot · Your AI Family Health Companion</p>
            </div>
            """
            msg.attach(MIMEText(html, 'html'))
            
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(sender, password)
                server.sendmail(sender, email, msg.as_string())
            print(f"[EMAIL] Reset email sent to {email}")
        else:
            print(f"[EMAIL] No SMTP config. Token for {email}: {token}")
    except Exception as e:
        print(f"[EMAIL ERROR] {e} — Token: {token}")
    
    return token

def verify_reset_token(email: str, token: str) -> bool:
    record = reset_store.get(email)
    if not record:
        return False
    if datetime.utcnow() > record["expires"]:
        del reset_store[email]
        return False
    return record["token"] == token
