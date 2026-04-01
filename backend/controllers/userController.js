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
            // Get verification OTP
            const verificationOtp = user.getEmailVerificationOtp();
            await user.save({ validateBeforeSave: false });

            const message = `Welcome to R K Interior Solution!\n\nYour Email Verification Code is: ${verificationOtp}\n\nThis code is valid for 15 minutes.`;
            const html = getOtpEmailTemplate(
                'Welcome to RK Interior Solution!',
                '<p>Thank you for joining our community of design enthusiasts. To get started and explore our premium interior services, please verify your email address using the code below:</p>',
                verificationOtp
            );

            // Fire-and-forget verification email to avoid hanging the UI
            sendEmail({
                email: user.email,
                subject: 'Verify Your Account - R K Interior Solution',
                message,
                html
            }).catch(emailError => {
                console.error('Verification email error (async):', emailError);
            });

            res.status(201).json({
                success: true,
                message: 'Verification code sent! Please check your inbox.'
            });
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

        // Fire-and-forget email sending
        sendEmail({
            email: user.email,
            subject: 'R K Interior Solution - Password Reset Code',
            message,
            html
        }).catch(async (emailError) => {
            console.error('Password reset email error (async):', emailError);
            user.resetPasswordOtp = undefined;
            user.resetPasswordOtpExpire = undefined;
            await user.save({ validateBeforeSave: false });
        });

        res.status(200).json({ success: true, message: 'Password reset code sent. Please check your inbox.' });
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
// @route   POST /api/users/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Please provide email and verification code.' });
        }

        const normalizedEmail = email.toLowerCase();

        const verificationToken = crypto
            .createHash('sha256')
            .update(otp)
            .digest('hex');

        const user = await User.findOne({
            email: normalizedEmail,
            verificationToken
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
        }

        // Check if token is expired
        if (user.verificationExpire < Date.now()) {
            return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
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

        const verificationOtp = user.getEmailVerificationOtp();
        await user.save({ validateBeforeSave: false });

        const message = `Your Email Verification Code is: ${verificationOtp}\n\nThis code is valid for 15 minutes.`;
        const html = getOtpEmailTemplate(
            'Complete Your Verification',
            '<p>You requested to resend the verification code. Please use the code below to securely activate your account:</p>',
            verificationOtp
        );

        // Fire-and-forget verification resend email
        sendEmail({
            email: user.email,
            subject: 'Account Verification - R K Interior Solution',
            message,
            html
        }).catch(emailError => {
             console.error('Verification resend email error (async):', emailError);
        });

        res.status(200).json({ success: true, message: 'Verification code resent! Please check your inbox.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
