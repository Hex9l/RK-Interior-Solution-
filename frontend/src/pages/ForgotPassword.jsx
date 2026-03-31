import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const navigate = useNavigate();

    const handleSubmitEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/users/forgotpassword', { email });
            setStep(2);
            toast.success(data.message || 'Verification code sent. Check your inbox.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not send verification email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value !== '' && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                const prevInput = document.getElementById(`otp-${index - 1}`);
                if (prevInput) prevInput.focus();
            }
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            return toast.error('Please enter the complete 6-digit code');
        }

        setLoading(true);
        try {
            const { data } = await api.post('/users/verify-reset-otp', { email, otp: otpString });
            toast.success('Code verified successfully!');
            navigate(`/reset-password/${data.resetToken}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

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
                        <Link to="/login" className="inline-flex items-center justify-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-[#D4AF37] flex items-center justify-center">
                                <span className="text-black font-serif font-bold text-base">RK</span>
                            </div>
                        </Link>
                        <h1 className="text-2xl font-serif text-white mb-1">
                            {step === 1 ? 'Recover Access' : 'Verify Code'}
                        </h1>
                        <p className="text-gray-500 text-sm tracking-wider">
                            {step === 1 ? "Enter your email for a verification code." : "Enter the 6-digit code sent to your email."}
                        </p>
                        <div className="w-10 h-px bg-[#D4AF37]/50 mx-auto mt-4" />
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleSubmitEmail} className="space-y-6 sm:space-y-5">
                            {/* Email */}
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
                                        placeholder="email@example.com"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="pt-2 sm:pt-0">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#D4AF37] text-black font-bold sm:font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase py-4 mt-2 rounded-xl sm:rounded-none hover:bg-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]"
                                >
                                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                                </button>

                                <div className="text-center mt-8">
                                    <Link to="/login" className="text-gray-500 hover:text-[#D4AF37] text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 group">
                                        <span className="w-4 h-[1px] bg-gray-800 group-hover:bg-[#D4AF37]/40 transition-colors"></span>
                                        Back to Login
                                        <span className="w-4 h-[1px] bg-gray-800 group-hover:bg-[#D4AF37]/40 transition-colors"></span>
                                    </Link>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6 sm:space-y-5">
                            <div>
                                <label className="block text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 ml-1 sm:ml-0 text-center">Enter 6-Digit Code</label>
                                <div className="flex justify-center gap-2 sm:gap-3">
                                    {otp.map((data, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={data}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-10 h-12 sm:w-12 sm:h-14 bg-[#121212] sm:bg-black border border-white/5 sm:border-[#262626] rounded-lg sm:rounded-none text-white text-center text-xl font-medium focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                                            required
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 sm:pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#D4AF37] text-black font-bold sm:font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase py-4 mt-2 rounded-xl sm:rounded-none hover:bg-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Verifying...' : (
                                        <>
                                            <KeyRound size={16} /> Verify & Continue
                                        </>
                                    )}
                                </button>
                                
                                <div className="text-center mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-gray-500 hover:text-white text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <ArrowLeft size={14} /> Change Email
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
