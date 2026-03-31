import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import crypto from 'crypto';
import sendEmail, { getEmailTemplate, getOtpEmailTemplate } from '../utils/sendEmail.js';
import mongoose from 'mongoose';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        if (user && (await user.matchPassword(password))) {
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please verify your email before logging in.' });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        const normalizedEmail = email.toLowerCase();

        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const user = await User.create({ name, email: normalizedEmail, password, isAdmin: false });

        if (user) {
            // Get verification token
            const verificationToken = user.getEmailVerificationToken();
            await user.save({ validateBeforeSave: false });

            // Create verification url
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

            const message = `Welcome to R K Interior Solution!\n\nPlease verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link is valid for 24 hours.`;
            const html = getEmailTemplate(
                'Welcome to RK Interior Solution!',
                '<p>Thank you for joining our community of design enthusiasts. To get started and explore our premium interior services, please verify your email address.</p>',
                'Verify My Account',
                verificationUrl
            );

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Verify Your Account - R K Interior Solution',
                    message,
                    html
                });

                res.status(201).json({
                    success: true,
                    message: 'Registration successful! Please check your email to verify your account.'
                });
            } catch (emailError) {
                console.error('Verification email error:', emailError);
                return res.status(201).json({
                    success: true,
                    message: 'Registration successful, but verification email could not be sent. Please contact support or try "Resend Verification" later.'
                });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Forgot password - sends reset email
// @route   POST /api/users/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }

        // Get reset OTP instead of token
        const resetOtp = user.getResetPasswordOtp();
        await user.save({ validateBeforeSave: false });

        const message = `You are receiving this email because you (or someone else) has requested to reset your password.\n\nYour Verification Code is: ${resetOtp}\n\nThis code is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`;

        const html = getOtpEmailTemplate(
            'Your Verification Code',
            '<p>You are receiving this email because you (or someone else) have requested to reset the password for your account.</p><p>Please use the verification code below to securely complete your password reset:</p>',
            resetOtp
        );

        try {
            await sendEmail({
                email: user.email,
                subject: 'R K Interior Solution - Password Reset Code',
                message,
                html
            });

            res.status(200).json({ success: true, message: 'Password reset code sent. Please check your inbox.' });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent. Please try again later.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify Reset OTP
// @route   POST /api/users/verify-reset-otp
// @access  Public
export const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        const normalizedEmail = email.toLowerCase();
        
        // Hash the OTP to compare
        const hashedOtp = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        const user = await User.findOne({
            email: normalizedEmail,
            resetPasswordOtp: hashedOtp,
            resetPasswordOtpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is valid. Clear it and generate the final reset token for setting new password
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpire = undefined;
        
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ 
            success: true, 
            message: 'OTP verified successfully.', 
            resetToken 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset password using token
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        // Hash the token from the URL
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify email
// @route   GET /api/users/verify/:token
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const verificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            verificationToken
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
        }

        // If already verified, still return success to the frontend
        if (user.isVerified) {
            return res.status(200).json({
                success: true,
                message: 'Email already verified!',
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id)
            });
        }

        // Check if token is expired for non-verified users
        if (user.verificationExpire < Date.now()) {
            return res.status(400).json({ success: false, message: 'Verification link has expired. Please request a new one.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Resend verification email
// @route   POST /api/users/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: 'No user found with this email.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified.' });
        }

        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

        const message = `Please verify your email by clicking the link below:\n\n${verificationUrl}\n\nThis link is valid for 24 hours.`;
        const html = getEmailTemplate(
            'Complete Your Verification',
            '<p>You requested to resend the verification link. Please click the button below to activate your account and access our premium interior services.</p>',
            'Verify My Account',
            verificationUrl
        );

        await sendEmail({
            email: user.email,
            subject: 'Account Verification - R K Interior Solution',
            message,
            html
        });

        res.status(200).json({ success: true, message: 'Verification email resent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
