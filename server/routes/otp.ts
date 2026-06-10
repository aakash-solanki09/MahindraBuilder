import express from 'express';
import * as otpController from '../controllers/otpController';

const router = express.Router();

router.post('/send-otp', otpController.sendOtp);
router.post('/verify-otp', otpController.verifyOtp);

export default router;
