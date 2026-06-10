import { Request, Response } from 'express';
import { Otp } from '../models/Otp';

// SMS API configuration
const SMS_API_URL = 'https://mahindralogistics.com/sms-sending/sms-api.php';
const SMS_AUTH_TOKEN = 'Ffuzbm870sqrwEVC7Ewvmjro';
const SMS_SENDER_ID = 'ALYTEP';

/**
 * Generate a random 4-digit OTP
 */
const generateOtp = (): string => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

/**
 * Send OTP via the Mahindra Logistics SMS API
 */
const sendSmsOtp = async (mobile: string, otp: string): Promise<boolean> => {
  try {
    const message = `Use OTP ${otp} to log in to the Alyte App. Please do not share this OTP with anyone for security reasons.`;
    
    const response = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'X-AUTH': SMS_AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobile,
        message,
        senderId: SMS_SENDER_ID,
      }),
    });

    console.log(`[SMS OTP] Sent to ${mobile}. Status: ${response.status}`);
    const responseText = await response.text();
    console.log(`[SMS OTP] Response: ${responseText}`);
    return response.ok;
  } catch (err) {
    console.error('[SMS OTP] Failed to send SMS:', err);
    return false;
  }
};

/**
 * POST /api/otp/send-otp
 * Generate OTP, store in DB, and send via SMS to the provided mobile number.
 */
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ message: 'Mobile number is required.' });
    }

    // Sanitize mobile: strip non-digits
    const cleanMobile = mobile.replace(/\D/g, '');

    // Validate Indian mobile number (10 digits, or 12 digits starting with 91)
    const isValid =
      cleanMobile.length === 10 ||
      (cleanMobile.length === 12 && cleanMobile.startsWith('91'));

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid mobile number. Please enter a valid 10-digit Indian mobile number.' });
    }

    // Normalize to 10-digit format (strip country code if present)
    const normalizedMobile = cleanMobile.length === 12 && cleanMobile.startsWith('91')
      ? cleanMobile.slice(2)
      : cleanMobile;

    // Invalidate any previous unverified OTPs for this mobile
    await Otp.deleteMany({ mobile: normalizedMobile, verified: false });

    // Generate new OTP
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Store in DB
    await Otp.create({
      mobile: normalizedMobile,
      otp: otpCode,
      verified: false,
      expiresAt,
    });

    // Send SMS
    const smsSent = await sendSmsOtp(normalizedMobile, otpCode);

    if (!smsSent) {
      return res.status(500).json({ message: 'Failed to send OTP via SMS. Please try again.' });
    }

    return res.status(200).json({
      message: 'OTP sent successfully to your mobile number.',
      // In production, remove expiresAt from the response
      expiresIn: '5 minutes',
    });
  } catch (err: any) {
    console.error('[OTP] sendOtp error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/otp/verify-otp
 * Verify the OTP entered by the user against the stored OTP.
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required.' });
    }

    // Sanitize mobile
    const cleanMobile = mobile.replace(/\D/g, '');
    const normalizedMobile = cleanMobile.length === 12 && cleanMobile.startsWith('91')
      ? cleanMobile.slice(2)
      : cleanMobile;

    // Find the latest unverified OTP for this mobile, ordered by most recent
    const otpRecord = await Otp.findOne({
      mobile: normalizedMobile,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ message: 'No OTP found for this mobile number. Please request a new OTP.' });
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (otpRecord.otp !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return res.status(200).json({
      message: 'OTP verified successfully.',
      mobile: normalizedMobile,
    });
  } catch (err: any) {
    console.error('[OTP] verifyOtp error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
