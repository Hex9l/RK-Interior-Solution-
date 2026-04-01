import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const initialEmail = location.state?.email || '';
    
    // State
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [verified, setVerified] = useState(false);

    // Refs for input focus management
    const inputRefs = useRef([]);

    // Cooldown timer for resend
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    // Focus first input on mount if email is present
    useEffect(() => {
        if (email && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [email]);

    // Handle OTP Input changes
    const handleChange = (index, value) => {
        if (isNaN(value)) return; // Only allow numbers

        const newOtp = [...otp];
        // Allow pasting of multiple characters
        if (value.length > 1) {
            const pastedData = value.slice(0, 6).split('');
            for (let i = 0; i < pastedData.length; i++) {
                if (index + i < 6) {
                    newOtp[index + i] = pastedData[i];
                }
            }
            setOtp(newOtp);
            
            // Focus on the next empty input or the last one
            const nextEmptyIndex = newOtp.findIndex(val => val === '');
            const targetIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
            if (inputRefs.current[targetIndex]) {
                inputRefs.current[targetIndex].focus();
            }
            return;
        }

        // Standard single character input
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value !== '' && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleResend = async () => {
        if (!email) {
            return toast.error("Please enter your email address first.");
        }
        
        setResending(true);
        try {
            await api.post('/users/resend-verification', { email });
            toast.success('Verification code resent! Please check your inbox.');
            setCooldown(60); // 60 seconds cooldown
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend code.');
        } finally {
            setResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const code = otp.join('');
        if (code.length !== 6) {
            return toast.error('Please enter the full 6-digit verification code.');
        }

        if (!email) {
            return toast.error('Email is required.');
        }

        setLoading(true);
        try {
            const { data } = await api.post('/users/verify-email', { email, otp: code });
            setVerified(true);
            toast.success(data.message || 'Email verified successfully!');
            
            // Perform automatic login
            if (data.token) {
                login(data);
            }

            // Redirect to home/dashboard after brief success state
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            // Clear inputs on error for better UX
            setOtp(['', '', '', '', '', '']);
            if (inputRefs.current[0]) inputRefs.current[0].focus();
            toast.error(error.response?.data?.message || 'Verification failed. Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    // If completely verified, show success state briefly before redirect
    if (verified) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden text-white">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center flex flex-col items-center"
                >
                    <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center border border-[#D4AF37]/30 mb-8">
                        <svg className="w-10 h-10 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-serif text-white mb-4 tracking-tight">Verified</h1>
                    <p className="text-gray-400 tracking-widest text-[10px] uppercase mb-8">Authenticating your access...</p>
                    <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] sm:bg-black flex flex-col items-center justify-center sm:px-4 sm:py-20 relative overflow-hidden">
            {/* Subtle gold glow accent */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] bg-[#D4AF37]/10 sm:bg-[#D4AF37]/5 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-[#0a0a0a] sm:bg-[#0d0d0d] sm:border sm:border-[#D4AF37]/15 px-6 py-12 sm:p-10 shadow-none sm:shadow-[0_0_80px_rgba(0,0,0,0.8)] min-h-[100dvh] sm:min-h-0 w-full flex flex-col justify-center">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-flex items-center justify-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-[#D4AF37] flex items-center justify-center">
                                <span className="text-black font-serif font-bold text-base">RK</span>
                            </div>
                        </Link>
                        <h1 className="text-2xl font-serif text-white mb-2">Verify Email</h1>
                        <p className="text-gray-500 text-xs tracking-wider max-w-xs mx-auto leading-relaxed">
                            We've sent a secure 6-digit code to your email. Enter it below to activate your account.
                        </p>
                        <div className="w-10 h-px bg-[#D4AF37]/50 mx-auto mt-6" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Address (Hidden if provided via state, but good UX to show it, or allow input) */}
                        {!initialEmail && (
                            <div>
                                <label className="block text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 mb-2 ml-1 sm:ml-0">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 sm:text-gray-600" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.toLowerCase())}
                                        required
                                        className="w-full pl-11 pr-4 py-4 sm:py-3.5 bg-[#121212] sm:bg-black border border-white/5 sm:border-[#262626] rounded-xl sm:rounded-none text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>
                        )}

                        {/* OTP Inputs */}
                        <div>
                            <div className="flex justify-between items-center mb-5">
                                <label className="block text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 ml-1 sm:ml-0 flex items-center gap-2">
                                    <KeyRound size={12} className="text-[#D4AF37]" />
                                    Security Code
                                </label>
                            </div>
                            
                            <div className="flex justify-between gap-2 sm:gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6} // allow pasting 6 chars into single box
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-full aspect-[4/5] bg-[#121212] sm:bg-black/50 border border-white/5 sm:border-[#262626] focus:border-[#D4AF37] focus:bg-[#D4AF37]/5 rounded-lg sm:rounded text-center text-white text-xl sm:text-2xl font-serif font-semibold outline-none transition-all duration-300 shadow-inner"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Submit & Resend Actions */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-[#D4AF37] text-black font-bold text-xs sm:text-sm tracking-[0.2em] uppercase py-4 rounded-xl sm:rounded-none hover:bg-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.25)] flex items-center justify-center gap-3 group"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify Access
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                            
                            {/* Resend Code */}
                            <div className="mt-8 text-center flex flex-col items-center gap-3">
                                <p className="text-gray-500 text-[11px] tracking-wide">Didn't receive the email?</p>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resending || cooldown > 0 || !email}
                                    className={`text-xs tracking-[0.1em] uppercase transition-all duration-300 font-semibold disabled:cursor-not-allowed flex items-center gap-2 ${cooldown > 0 ? 'text-gray-600' : 'text-[#D4AF37] hover:text-white'}`}
                                >
                                    {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                                </button>
                            </div>

                            <div className="text-center mt-10">
                                <Link to="/login" className="text-gray-600 hover:text-gray-300 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase transition-colors duration-300">
                                    Return to Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
