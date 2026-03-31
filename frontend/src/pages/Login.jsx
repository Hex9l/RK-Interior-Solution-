import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [unverified, setUnverified] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const from = location.state?.from?.pathname || '/';

    const handleResend = async () => {
        setResending(true);
        try {
            await api.post('/users/resend-verification', { email });
            toast.success('Verification email sent! Please check your inbox.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend email.');
        } finally {
            setResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUnverified(false);
        try {
            const { data } = await api.post('/users/login', { email, password });
            login(data);
            toast.success(`Welcome back, ${data.name}!`);
            if (data.isAdmin) {
                navigate('/admin/dashboard');
            } else {
                navigate(from, { replace: true });
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed.';
            if (message.toLowerCase().includes('verify')) {
                setUnverified(true);
            }
            toast.error(message);
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
                {/* Card */}
                <div className="bg-[#0a0a0a] sm:bg-[#0d0d0d] sm:border sm:border-[#D4AF37]/15 px-6 py-12 sm:p-10 shadow-none sm:shadow-[0_0_80px_rgba(0,0,0,0.8)] min-h-[100dvh] sm:min-h-0 w-full flex flex-col justify-center">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-flex items-center justify-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-[#D4AF37] flex items-center justify-center">
                                <span className="text-black font-serif font-bold text-base">RK</span>
                            </div>
                        </Link>
                        <h1 className="text-2xl font-serif text-white mb-1">Welcome Back</h1>
                        <p className="text-gray-500 text-sm tracking-wider">Sign in to access your account</p>
                        <div className="w-10 h-px bg-[#D4AF37]/50 mx-auto mt-4" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-5">
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
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[10px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 mb-2 ml-1 sm:ml-0">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 sm:text-gray-600" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-12 py-4 sm:py-3.5 bg-[#121212] sm:bg-black border border-white/5 sm:border-[#262626] rounded-xl sm:rounded-none text-white text-sm placeholder-gray-700 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 sm:text-gray-600 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-2 sm:pt-0">
                            {/* Links row: Create Account + Forgot Password */}
                            <div className="flex items-center justify-between mb-5">
                                <Link to="/signup" className="text-[10px] sm:text-[11px] tracking-[0.15em] uppercase text-gray-500 hover:text-white transition-colors duration-300">
                                    Create Account
                                </Link>
                                <Link to="/forgot-password" title="Forgot Password?" className="text-[10px] sm:text-[11px] tracking-[0.15em] uppercase text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors duration-300">
                                    Forgot Password?
                                </Link>
                            </div>

                            {unverified && (
                                <div className="mb-6 p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-center">
                                    <p className="text-[10px] sm:text-xs text-gray-400 mb-2">Your email is not verified.</p>
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="text-[#D4AF37] hover:text-white text-[10px] sm:text-xs font-semibold tracking-widest uppercase transition-colors disabled:opacity-50"
                                    >
                                        {resending ? 'Sending...' : 'Resend Verification Link'}
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#D4AF37] text-black font-bold sm:font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase py-4 mt-2 rounded-xl sm:rounded-none hover:bg-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.25)]"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                            
                            {/* Back to home moved here for better flow */}
                            <div className="text-center mt-8">
                                <Link to="/" className="text-gray-500 hover:text-[#D4AF37] text-[10px] sm:text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 group">
                                    <span className="w-4 h-[1px] bg-gray-800 group-hover:bg-[#D4AF37]/40 transition-colors"></span>
                                    Back to Home
                                    <span className="w-4 h-[1px] bg-gray-800 group-hover:bg-[#D4AF37]/40 transition-colors"></span>
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
