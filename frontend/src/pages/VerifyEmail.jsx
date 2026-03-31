import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(3);
    const { token } = useParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await api.get(`/users/verify-email/${token}`);
                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');
                
                // Perform automatic login
                if (data.token) {
                    login(data);
                }

                // Start countdown for redirection
                const interval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            navigate('/');
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(interval);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
            }
        };

        if (token) {
            verify();
        }
    }, [token, login, navigate]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden text-white">
            {/* Background Accents */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/3 blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg"
            >
                <div className="bg-[#0d0d0d] border border-[#D4AF37]/20 p-12 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden">
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/10 flex items-center justify-center -mr-8 -mt-8 rotate-45" />

                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-12">
                        <motion.div 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 bg-[#D4AF37] flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(212,175,55,0.3)]"
                        >
                            <span className="text-black font-serif font-bold text-2xl tracking-tighter">RK</span>
                        </motion.div>
                        <div className="h-px w-12 bg-[#D4AF37]/40 mb-2" />
                        <h2 className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37]/80 font-semibold">Interior Solution</h2>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === 'loading' && (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center py-4"
                            >
                                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin mb-8 opacity-80" />
                                <h1 className="text-3xl font-serif text-white mb-3">Authenticating</h1>
                                <p className="text-gray-500 tracking-[0.15em] text-xs uppercase italic">Connecting to secure servers...</p>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div 
                                key="success"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-4"
                            >
                                <div className="relative mb-12">
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
                                        className="relative z-10"
                                    >
                                        <div className="p-1 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#f7e4a1] to-[#D4AF37] shadow-[0_0_50px_rgba(212,175,55,0.4)]">
                                            <div className="bg-[#0d0d0d] rounded-full p-4">
                                                <CheckCircle className="w-16 h-16 text-[#D4AF37]" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </motion.div>
                                    
                                    {/* Success Rings */}
                                    <motion.div 
                                        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                        className="absolute inset-0 border-2 border-[#D4AF37] rounded-full -z-10"
                                    />
                                    <motion.div 
                                        animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                        className="absolute inset-0 border border-[#D4AF37] rounded-full -z-10"
                                    />
                                </div>
                                
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-center"
                                >
                                    <h1 className="text-4xl font-serif text-white mb-4 tracking-tight leading-tight">Verification <span className="text-[#D4AF37]">Complete</span></h1>
                                    <p className="text-gray-400 tracking-widest text-[10px] uppercase mb-12 max-w-xs mx-auto leading-loose">
                                        Your premium access is now activated. Welcome to the world of exquisite design.
                                    </p>
                                </motion.div>
                                
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="w-full space-y-6"
                                >
                                    <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 p-5 flex items-center justify-between group">
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-bold mb-1">Redirecting</span>
                                            <span className="text-xs text-gray-500 tracking-wider">Taking you to our showroom</span>
                                        </div>
                                        <div className="relative">
                                            <div className="text-[#D4AF37] font-serif font-bold text-3xl">{countdown}</div>
                                            <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#D4AF37]/20">
                                                <motion.div 
                                                    initial={{ width: "100%" }}
                                                    animate={{ width: "0%" }}
                                                    transition={{ duration: 3, ease: "linear" }}
                                                    className="h-full bg-[#D4AF37]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Link 
                                        to="/" 
                                        className="w-full bg-[#D4AF37] text-black font-black text-[11px] tracking-[0.3em] uppercase py-6 hover:bg-white transition-all duration-700 flex items-center justify-center gap-4 group relative overflow-hidden shadow-[0_15px_40px_rgba(212,175,55,0.2)]"
                                    >
                                        <span className="relative z-10 flex items-center gap-4">
                                            Enter Storefront
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform duration-700" />
                                        </span>
                                        <motion.div 
                                            initial={{ x: "-100%" }}
                                            whileHover={{ x: "100%" }}
                                            transition={{ duration: 0.8 }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                                        />
                                    </Link>
                                </motion.div>
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div 
                                key="error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center py-4"
                            >
                                <XCircle className="w-20 h-20 text-red-500/80 mb-10 shadow-[0_0_50px_rgba(239,68,68,0.2)]" />
                                <h1 className="text-3xl font-serif text-white mb-4 tracking-tight">Access Denied</h1>
                                <p className="text-gray-400 tracking-wide text-sm mb-12 max-w-sm mx-auto italic">
                                    {message}
                                </p>
                                
                                <div className="flex flex-col gap-4 w-full">
                                    <Link 
                                        to="/signup" 
                                        className="w-full bg-white/5 border border-white/10 text-white font-bold text-xs tracking-[0.2em] uppercase py-5 hover:bg-white hover:text-black transition-all duration-500 text-center"
                                    >
                                        Return to Signup
                                    </Link>
                                    <Link 
                                        to="/" 
                                        className="text-gray-600 hover:text-[#D4AF37] transition-all duration-500 text-[10px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 py-4"
                                    >
                                        <Home size={14} />
                                        Back to Storefront
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom decorative text */}
                <div className="mt-8 text-center">
                    <p className="text-[9px] text-gray-700 uppercase tracking-[0.4em]">Crafting Premium Interiors Since 2012</p>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
