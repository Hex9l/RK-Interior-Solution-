import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    isVerified: { type: Boolean, required: true, default: false },
    verificationToken: String,
    verificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetPasswordOtp: String,
    resetPasswordOtpExpire: Date
}, { timestamps: true });

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash email verification OTP
userSchema.methods.getEmailVerificationOtp = function () {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash token and set to verificationToken field
    this.verificationToken = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    // Set expire (15 minutes)
    this.verificationExpire = Date.now() + 15 * 60 * 1000;

    return otp;
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Generate and hash OTP token
userSchema.methods.getResetPasswordOtp = function () {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash token and set to resetPasswordOtp field
    this.resetPasswordOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    // Set expire
    this.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return otp;
};

// Encrypt password before save
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
