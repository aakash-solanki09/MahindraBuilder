import { Request, Response } from 'express';
import { Otp } from '../models/Otp';
import https from 'https';
import dns from 'dns';
import net from 'net';

// Prefer IPv4 first to avoid IPv6 connection timeout issues
dns.setDefaultResultOrder('ipv4first');

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
  return new Promise((resolve) => {
    try {
      const message = `Use OTP ${otp} to log in to the Alyte App. Please do not share this OTP with anyone for security reasons.`;
      
      const postData = JSON.stringify({
        mobile,
        message,
        senderId: SMS_SENDER_ID,
      });

      const options = {
        hostname: 'mahindralogistics.com',
        port: 443,
        path: '/sms-sending/sms-api.php',
        method: 'POST',
        headers: {
          'X-AUTH': SMS_AUTH_TOKEN,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'Connection': 'close',
          'User-Agent': 'curl/8.6.0'
        },
        rejectUnauthorized: false, // Bypass SSL validation issues on Node
        timeout: 45000, // 45s timeout to handle slow SMS gateway responses
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          console.log(`[SMS OTP] Sent to ${mobile}. Status: ${res.statusCode}`);
          console.log(`[SMS OTP] Response: ${data}`);
          
          try {
            const json = JSON.parse(data);
            // Verify that success is true AND the provider status is OK
            if (res.statusCode === 200 && json.success === true && json.providerResponse?.status === 'OK') {
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (e) {
            // Fallback to basic status code check if response is not JSON
            resolve(res.statusCode === 200);
          }
        });
      });

      req.on('error', (err) => {
        console.error('[SMS OTP] Request error:', err);
        resolve(false);
      });

      req.on('timeout', () => {
        console.error('[SMS OTP] Request timeout');
        req.destroy();
        resolve(false);
      });

      req.write(postData);
      req.end();
    } catch (err) {
      console.error('[SMS OTP] Failed to send SMS:', err);
      resolve(false);
    }
  });
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

/**
 * GET /api/otp/diagnose
 * Diagnose connection issues to the SMS API endpoint
 */
export const diagnoseSms = async (req: Request, res: Response) => {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    dns: {},
    connection: {},
    httpRequest: {}
  };

  // 1. DNS Resolution
  try {
    diagnostics.dns.ipv4 = await new Promise((resolve) => {
      dns.resolve4('mahindralogistics.com', (err, addresses) => {
        if (err) resolve({ error: err.message, code: (err as any).code });
        else resolve(addresses);
      });
    });
    diagnostics.dns.ipv6 = await new Promise((resolve) => {
      dns.resolve6('mahindralogistics.com', (err, addresses) => {
        if (err) resolve({ error: err.message, code: (err as any).code });
        else resolve(addresses);
      });
    });
    diagnostics.dns.defaultOrder = dns.getDefaultResultOrder ? dns.getDefaultResultOrder() : 'unknown';
  } catch (dnsErr: any) {
    diagnostics.dns.error = dnsErr.message;
  }

  // 2. Direct TCP Connection Test to port 443
  try {
    const start = Date.now();
    diagnostics.connection = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(5000); // 5s timeout

      socket.connect(443, 'mahindralogistics.com', () => {
        const duration = Date.now() - start;
        socket.destroy();
        resolve({ success: true, durationMs: duration });
      });

      socket.on('error', (err) => {
        resolve({ success: false, error: err.message, code: (err as any).code });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ success: false, error: 'Connection timed out (5s limit reached)' });
      });
    });
  } catch (connErr: any) {
    diagnostics.connection.error = connErr.message;
  }

  // 3. HTTPS Request Test (Dummy payload)
  try {
    const start = Date.now();
    diagnostics.httpRequest = await new Promise((resolve) => {
      const dummyData = JSON.stringify({
        mobile: '9999999999',
        message: 'Diagnostics test',
        senderId: 'ALYTEP'
      });

      const options = {
        hostname: 'mahindralogistics.com',
        port: 443,
        path: '/sms-sending/sms-api.php',
        method: 'POST',
        headers: {
          'X-AUTH': 'dummy_token',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dummyData),
          'Connection': 'close'
        },
        rejectUnauthorized: false,
        timeout: 10000 // 10s timeout
      };

      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            data: data.slice(0, 500),
            durationMs: Date.now() - start
          });
        });
      });

      request.on('error', (err: any) => {
        resolve({ error: err.message, code: err.code, durationMs: Date.now() - start });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({ error: 'Request timed out (10s limit reached)', durationMs: Date.now() - start });
      });

      request.write(dummyData);
      request.end();
    });
  } catch (httpErr: any) {
    diagnostics.httpRequest.error = httpErr.message;
  }

  // 4. Direct HTTPS Request to Public IP (Bypassing /etc/hosts via IP + SNI)
  try {
    const start = Date.now();
    diagnostics.directPublicIpRequest = await new Promise((resolve) => {
      const dummyData = JSON.stringify({
        mobile: '9999999999',
        message: 'Diagnostics test',
        senderId: 'ALYTEP'
      });

      const options = {
        hostname: '20.207.69.20',
        servername: 'mahindralogistics.com', // SNI
        port: 443,
        path: '/sms-sending/sms-api.php',
        method: 'POST',
        headers: {
          'Host': 'mahindralogistics.com',
          'X-AUTH': 'dummy_token',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dummyData),
          'Connection': 'close'
        },
        rejectUnauthorized: false,
        timeout: 10000 // 10s timeout
      };

      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            data: data.slice(0, 500),
            durationMs: Date.now() - start
          });
        });
      });

      request.on('error', (err: any) => {
        resolve({ error: err.message, code: err.code, durationMs: Date.now() - start });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({ error: 'Request timed out (10s limit reached)', durationMs: Date.now() - start });
      });

      request.write(dummyData);
      request.end();
    });
  } catch (httpErr: any) {
    diagnostics.directPublicIpRequest = { error: httpErr.message };
  }

  return res.status(200).json(diagnostics);
};

