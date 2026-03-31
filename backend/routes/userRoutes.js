import express from 'express';
import { authUser, registerUser, forgotPassword, verifyResetOtp, resetPassword, verifyEmail, resendVerification } from '../controllers/userController.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser); 
router.post('/forgotpassword', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;
