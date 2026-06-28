# Email Verification System - Debugging & Testing Guide

## Overview

This guide explains how to test, debug, and verify that the email verification system is working correctly in the Purrfect Match AI application.

## Current Status

✅ **FIXED** - The following improvements have been implemented:

1. **Environment Configuration** - Created `.env` file with SMTP configuration
2. **Database Schema** - Added `email_verified`, `verification_token`, and `verification_token_expires` fields to User model
3. **Email Service** - Enhanced with comprehensive error handling, logging, and fallback to file logging
4. **Registration Flow** - Integrated verification token generation and email sending
5. **New Endpoints** - Added email verification, resend, and test endpoints
6. **Logging** - Enabled DEBUG logging throughout the entire flow

---

## Email Verification Flow

### 1. Registration Flow

```
User submits registration
        ↓
Validation (email not exists)
        ↓
Password hashing
        ↓
Verification token generation
        ↓
User saved to database with token & expiration
        ↓
Background task scheduled: send_welcome_email
        ↓
Email sent (or logged to file if SMTP not configured)
        ↓
Return user data to frontend
```

### 2. Email Verification Link Click

```
User clicks verification link in email
        ↓
Frontend calls /auth/verify-email?token={token}
        ↓
Backend validates token exists and not expired
        ↓
Set email_verified=true, clear token
        ↓
User can now use full features
```

---

## Testing the Email System

### Option 1: Quick Test (Development Mode)

This uses file logging fallback when SMTP is not configured:

#### Step 1: Verify .env Configuration

Check that `.env` file exists in `/backend/` directory:

```bash
cat backend/.env
```

Expected output:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=purrfectmatchai.app@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx
...
```

#### Step 2: Start the Backend Server

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Step 3: Check Logs on Startup

You should see:
```
[DEBUG] purrfect_match_ai: EmailService initialized - SMTP_HOST: smtp.gmail.com
[DEBUG] purrfect_match_ai: EmailService - SMTP_USER: purrfectmatchai.app@gmail.com
[DEBUG] purrfect_match_ai: EmailService - DEBUG_MODE: true
```

#### Step 4: Send Test Email

Open API docs at `http://localhost:8000/docs` and use the test endpoint:

**Endpoint:** `POST /auth/send-test-email`

**Parameters:**
```json
{
  "to_email": "test@example.com"
}
```

**Expected Response:**
```json
{
  "message": "Test email has been scheduled for sending.",
  "recipient": "test@example.com",
  "note": "Check email_logs.txt or your email inbox depending on SMTP configuration."
}
```

#### Step 5: Check Email Logs

```bash
cat backend/email_logs.txt
```

Expected content:
```
========================================
TIMESTAMP: 2024-06-28 12:34:56.789123
TO: test@example.com
FROM: purrfectmatchai.app@gmail.com
SUBJECT: Test Email from Purrfect Match AI 🐾
----------------------------------------
TEXT VERSION:
Test Email

This is a test email from Purrfect Match AI.
----------------------------------------
HTML VERSION:
<html><body><h1>Test Email</h1><p>This is a test email from Purrfect Match AI.</p></body></html>
========================================
```

**If this works, file logging is functional!**

---

### Option 2: Real Gmail SMTP (Production Testing)

To send real emails through Gmail:

#### Step 1: Create Google App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or appropriate device)
3. Google will generate a 16-character password like: `xxxx-xxxx-xxxx-xxxx`
4. Copy this password

#### Step 2: Update .env File

```bash
nano backend/.env
```

Update these values:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=purrfectmatchai.app@gmail.com
SMTP_PASSWORD=xxxx-xxxx-xxxx-xxxx  # <-- Your Google App Password
SENDER_EMAIL=purrfectmatchai.app@gmail.com
```

#### Step 3: Restart Backend Server

```bash
# Stop the running server (Ctrl+C)
# Restart it
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Step 4: Register a Test User

Use the API docs to register:

**Endpoint:** `POST /auth/signup`

**Body:**
```json
{
  "name": "Test User",
  "email": "your-email@gmail.com",
  "password": "TestPassword123!",
  "role": "adopter"
}
```

#### Step 5: Check Real Email Inbox

You should receive a welcome email with:
- Subject: "Welcome to Kizuna Paws - Purrfect Match AI! 🐾"
- Email verification link
- Instructions for next steps

**If you receive this email, SMTP is working!** ✅

---

## Complete Registration Flow Test

### Test Case 1: Full Registration with Email Verification

1. **Register user:**
   ```bash
   curl -X POST "http://localhost:8000/auth/signup" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Jane Doe",
       "email": "jane@example.com",
       "password": "SecurePass123!",
       "role": "adopter"
     }'
   ```

2. **Extract verification token from logs:**
   - Check `email_logs.txt` or email inbox
   - Find the verification link URL or token

3. **Call verify-email endpoint:**
   ```bash
   curl -X POST "http://localhost:8000/auth/verify-email?token=YOUR_TOKEN_HERE"
   ```

4. **Verify response:**
   ```json
   {
     "message": "Email verified successfully! You can now log in.",
     "email": "jane@example.com"
   }
   ```

### Test Case 2: Resend Verification Email

1. **Resend verification email:**
   ```bash
   curl -X POST "http://localhost:8000/auth/resend-verification-email?email=jane@example.com"
   ```

2. **Expected response:**
   ```json
   {
     "message": "Verification email has been sent."
   }
   ```

3. **Check email/logs for new verification link**

### Test Case 3: Password Reset

1. **Request password reset:**
   ```bash
   curl -X POST "http://localhost:8000/auth/forgot-password" \
     -H "Content-Type: application/json" \
     -d '{"email": "jane@example.com"}'
   ```

2. **Extract reset code from email/logs**

3. **Reset password:**
   ```bash
   curl -X POST "http://localhost:8000/auth/reset-password" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "jane@example.com",
       "code": "123456",
       "new_password": "NewPassword123!"
     }'
   ```

---

## Debugging: Checking Logs

### Application Logs

Main application log with ALL debug information:
```bash
tail -f backend/application.log
```

Key things to look for:
```
[AUTH] Signup attempt for email: test@example.com
[AUTH] Generated verification token for test@example.com, expires at ...
[EMAIL] Starting email send process to: test@example.com
[EMAIL] SMTP not configured. Using file logging fallback.
[EMAIL] Successfully logged email to email_logs.txt
```

### Email Logs

Raw email content (when SMTP not configured):
```bash
cat backend/email_logs.txt
```

### SMTP Debug (When Using Real Gmail)

You'll see detailed SMTP conversation:
```
[EMAIL] Attempting to send via SMTP to test@example.com using smtp.gmail.com:587
[EMAIL] SMTP connection established to smtp.gmail.com:587
[EMAIL] STARTTLS successful
[EMAIL] Authentication successful for user purrfectmatchai.app@gmail.com
[EMAIL] Successfully sent email to test@example.com
```

---

## Common Issues & Fixes

### Issue 1: "SMTP not configured. Using file logging fallback."

**Cause:** SMTP variables are empty or .env file not loaded

**Fix:**
1. Verify .env file exists: `ls -la backend/.env`
2. Check SMTP_HOST is set: `grep SMTP_HOST backend/.env`
3. Make sure file is not empty: `cat backend/.env`
4. Restart Python server to reload .env

### Issue 2: "Failed to send email - SMTPAuthenticationError"

**Cause:** Gmail credentials are incorrect

**Fix:**
1. Verify using correct App Password (not regular password)
2. Get new password from: https://myaccount.google.com/apppasswords
3. Make sure no spaces or hyphens issue in password
4. Update .env and restart server

### Issue 3: "Email sent but never arrived"

**Cause:** Email might be in spam or suppressed by Gmail

**Fix:**
1. Check Gmail spam folder
2. Gmail might suppress test emails - use real domain in production
3. Check if recipient email is correct in database

### Issue 4: "Verification token invalid"

**Cause:** Token in URL doesn't match database token

**Fix:**
1. Make sure you're using the exact token from the email
2. Check token hasn't expired (24-hour expiration)
3. Verify token stored correctly in database

### Issue 5: Email content is not rendering (blank email)

**Cause:** HTML/text content generation failed

**Fix:**
1. Check logs for any template errors
2. Verify user name is not None
3. Check verification URL is properly formatted

---

## Database Schema Changes

### User Table - New Columns

```sql
email_verified BOOLEAN DEFAULT false          -- Whether email has been verified
verification_token VARCHAR(255) UNIQUE NULL   -- Token for email verification
verification_token_expires DATETIME NULL       -- When token expires
```

### Sample Database Query

Check if email is verified:
```sql
SELECT id, email, email_verified, verification_token, verification_token_expires 
FROM users 
WHERE email = 'test@example.com';
```

---

## API Endpoints Reference

### 1. Register (Signup)
- **Endpoint:** `POST /auth/signup`
- **Triggers:** Welcome email with verification link
- **Response:** User data + token

### 2. Verify Email
- **Endpoint:** `POST /auth/verify-email?token={token}`
- **Description:** Verify user's email with token
- **Response:** Success message

### 3. Resend Verification Email
- **Endpoint:** `POST /auth/resend-verification-email?email={email}`
- **Description:** Send verification email again
- **Response:** Success message

### 4. Test Email (Debug)
- **Endpoint:** `POST /auth/send-test-email?to_email={email}`
- **Description:** Send test email to any address
- **Response:** Confirmation

### 5. Forgot Password
- **Endpoint:** `POST /auth/forgot-password`
- **Body:** `{"email": "user@example.com"}`
- **Triggers:** Password reset email with code
- **Response:** Success message

### 6. Reset Password
- **Endpoint:** `POST /auth/reset-password`
- **Body:** `{"email": "user@example.com", "code": "123456", "new_password": "new_pass"}`
- **Response:** Success message

---

## Frontend Integration

### Email Verification Link

The frontend should handle this URL pattern:
```
http://localhost:3000/auth/verify-email?token=<verification_token>
```

### Frontend Component (Example)

```typescript
// pages/auth/verify-email.tsx
import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Call backend verify endpoint
      fetch(`http://localhost:8000/auth/verify-email?token=${token}`, {
        method: 'POST'
      })
      .then(res => res.json())
      .then(data => {
        if (data.message.includes('successfully')) {
          // Redirect to login
          router.push('/auth/login');
        }
      });
    }
  }, [token]);

  return <div>Verifying your email...</div>;
}
```

---

## Email Configuration Summary

### Development (File Logging)
- Emails logged to `email_logs.txt`
- No actual email sent
- Perfect for testing without SMTP
- Set up automatically when SMTP vars are empty

### Staging (Real Gmail)
- Use Google App Password
- Emails sent to real inbox
- Verify everything works before production
- Watch logs for any SMTP errors

### Production
- Use production email service (Gmail, SendGrid, AWS SES, etc.)
- Update SMTP credentials in .env
- Monitor email delivery rates
- Set up email templates for branding

---

## Summary: What Was Fixed

### 1. **Configuration**
- ✅ Created `.env` file with SMTP settings
- ✅ Added file logging fallback for development

### 2. **Database**
- ✅ Added `email_verified`, `verification_token`, `verification_token_expires` columns
- ✅ Automatic token cleanup after verification

### 3. **Email Service**
- ✅ Enhanced error handling for SMTP failures
- ✅ Comprehensive logging at each step
- ✅ Graceful fallback to file logging
- ✅ Support for HTML + text email versions
- ✅ Token generation helper

### 4. **Authentication Flow**
- ✅ Verification token generation on signup
- ✅ Token stored in database with expiration
- ✅ Welcome email includes verification link
- ✅ New endpoint to verify email with token
- ✅ Resend verification email endpoint
- ✅ Test email endpoint for debugging

### 5. **Logging**
- ✅ DEBUG logging enabled in development
- ✅ Logs written to both console and `application.log`
- ✅ Detailed step-by-step logging in auth flow
- ✅ Complete email transaction logs

---

## Next Steps

1. **Update Gmail credentials** if using real Gmail
2. **Test complete registration flow** using steps above
3. **Check email_logs.txt** to verify emails are being generated
4. **Monitor application.log** for any errors
5. **Deploy to production** with updated SMTP credentials
6. **Set up email templates** for branding and customization

---

## Support & Troubleshooting

If emails still aren't being sent:

1. Check all logs: `cat backend/application.log`
2. Check email content: `cat backend/email_logs.txt`
3. Verify SMTP configuration: `cat backend/.env`
4. Check database: `SELECT * FROM users WHERE id = 'your_user_id'`
5. Test endpoint: `POST /auth/send-test-email`

For production issues, enable DEBUG mode in .env:
```
DEBUG=true
LOG_LEVEL=DEBUG
```

---

Generated: 2026-06-28
Last Updated: Email Verification System Complete
