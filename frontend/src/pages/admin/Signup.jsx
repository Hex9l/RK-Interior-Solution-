import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, User } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/axiosInstance';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/users/register', { name, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Registration successful. You are now logged in as admin.');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-[#171717] p-8 rounded-2xl shadow-2xl border border-[#262626]"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-light text-white mb-2">Admin <span className="font-bold text-[#D4AF37]">Sign Up</span></h2>
                    <div className="w-16 h-1 bg-[#D4AF37] mx-auto"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full pl-10 bg-[#0a0a0a] border border-[#262626] rounded-lg py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 bg-[#0a0a0a] border border-[#262626] rounded-lg py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                                placeholder="admin@rkinterior.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 bg-[#0a0a0a] border border-[#262626] rounded-lg py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#D4AF37] hover:bg-white text-[#0a0a0a] font-bold py-3 rounded-lg transition-colors disabled:opacity-70 mt-4"
                    >
                        {loading ? 'Registering...' : 'Sign Up'}
                    </button>
                    
                    <div className="mt-4 text-center text-sm text-gray-400">
                        Already have an account? <Link to="/admin/login" className="text-[#D4AF37] hover:underline">Sign In</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Signup;
