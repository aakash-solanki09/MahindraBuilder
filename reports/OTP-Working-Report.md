# OTP (SMS Verification) Working Report

## Overview

The Mahindra Builder now has a complete SMS-based OTP verification flow. When a user submits the lead form on the landing page, they must first verify their phone number via a 6-digit OTP sent through the Mahindra Logistics SMS API.

---

## Architecture

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────────┐
│  Client  │────▶│  Express API │────▶│   MongoDB   │────▶│  Mahindra SMS API │
│ (React)  │◀────│  (Server)    │◀────│  (OTP Store)│     │  (External)       │
└──────────┘     └──────────────┘     └─────────────┘     └──────────────────┘
```

---

## Files Created/Modified

### New Files (Server)

| File | Purpose |
|------|---------|
| `server/models/Otp.ts` | Mongoose model for OTP storage with TTL auto-expiry |
| `server/controllers/otpController.ts` | Business logic: generate OTP, call SMS API, verify OTP |
| `server/routes/otp.ts` | API routes: `POST /api/otp/send-otp`, `POST /api/otp/verify-otp` |

### Modified Files

| File | Change |
|------|--------|
| `server/index.ts` | Registered `/api/otp` routes |
| `src/components/sections/prebuilt/Hero.tsx` | Changed from email-based OTP to SMS-based OTP |

---

## API Endpoints

### 1. Send OTP
```
POST /api/otp/send-otp
Content-Type: application/json

{
  "mobile": "9819651663"
}
```

**Response (200):**
```json
{
  "message": "OTP sent successfully to your mobile number.",
  "expiresIn": "5 minutes"
}
```

**What happens:**
1. Validates the mobile number (must be 10-digit Indian number)
2. Deletes any previous unverified OTPs for this number
3. Generates a random 6-digit OTP
4. Stores OTP in MongoDB with a 5-minute TTL
5. Calls the Mahindra Logistics SMS API:
   ```
   POST https://mahindralogistics.com/sms-sending/sms-api.php
   Headers: X-AUTH: Ffuzbm870sqrwEVC7Ewvmjro
   Body: { "mobile": "98...", "message": "Use OTP 7464...", "senderId": "ALYTEP" }
   ```
6. Returns success to the client

### 2. Verify OTP
```
POST /api/otp/verify-otp
Content-Type: application/json

{
  "mobile": "9819651663",
  "otp": "7464"
}
```

**Response (200):**
```json
{
  "message": "OTP verified successfully.",
  "mobile": "9819651663"
}
```

**What happens:**
1. Finds the latest unverified OTP for the given mobile
2. Checks if OTP has expired (> 5 minutes)
3. Compares the entered OTP with stored OTP
4. If valid, marks the OTP as verified
5. Returns success

---

## User Flow (Frontend)

```
User visits landing page
         │
         ▼
┌─────────────────────┐
│  Fill form fields    │
│  (name, email,      │
│   phone, city, etc) │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Click "Send OTP"   │──▶ POST /api/otp/send-otp { mobile }
│  button              │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  SMS received on    │
│  user's phone       │
│  "Use OTP 7464..."  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Enter 6-digit OTP  │
│  + Click "Verify"   │──▶ POST /api/otp/verify-otp { mobile, otp }
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  OTP Verified ✓     │
│  Submit button      │
│  now enabled        │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Submit Form        │──▶ POST /api/leads { ...formData }
│                     │──▶ MongoDB + Salesforce
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Redirect to        │
│  Thank You Page     │
└─────────────────────┘
```

---

## MongoDB OTP Model Schema

```typescript
{
  mobile: String,      // 10-digit Indian mobile (e.g., "9819651663")
  otp: String,         // 6-digit OTP (e.g., "7464")
  verified: Boolean,   // false → true after verification
  expiresAt: Date,     // createdAt + 5 minutes (auto-deleted by TTL index)
  createdAt: Date,     // auto (timestamps)
  updatedAt: Date      // auto (timestamps)
}
```

The TTL index on `expiresAt` ensures MongoDB automatically cleans up expired OTPs.

---

## SMS API Details

| Property | Value |
|----------|-------|
| **URL** | `https://mahindralogistics.com/sms-sending/sms-api.php` |
| **Auth Header** | `X-AUTH: Ffuzbm870sqrwEVC7Ewvmjro` |
| **Sender ID** | `ALYTEP` |
| **Method** | POST |
| **Content-Type** | application/json |
| **Body** | `{ "mobile": "98...", "message": "Use OTP XXXX...", "senderId": "ALYTEP" }` |

---

## Security Considerations

1. **OTP Expiry**: OTPs expire after 5 minutes and are auto-deleted by MongoDB
2. **Single Active OTP**: Previous unverified OTPs are deleted when a new one is requested
3. **Phone Normalization**: Country code (+91) is stripped for consistent storage
4. **One-time Use**: Once verified, the OTP cannot be reused

---

## Error Handling

| Scenario | HTTP Status | Message |
|----------|-------------|---------|
| Missing mobile | 400 | "Mobile number is required." |
| Invalid mobile | 400 | "Invalid mobile number..." |
| SMS API fails | 500 | "Failed to send OTP via SMS..." |
| No OTP found | 400 | "No OTP found for this mobile number..." |
| OTP expired | 400 | "OTP has expired. Please request a new one." |
| Invalid OTP | 400 | "Invalid OTP. Please check and try again." |
| Missing OTP input | 400 | "Mobile number and OTP are required." |
