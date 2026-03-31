import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/axiosInstance';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);
        try {
            const { data } = await api.put(`/users/resetpassword/${resetToken}`, { password });
            
            // Optionally log them in immediately, or redirect to login. Redirecting to login is safer.
            toast.success('Password updated successfully. Please log in with your new password.');
            navigate('/admin/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
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
                <div className="mb-6">
                    <Link to="/admin/login" className="text-gray-400 hover:text-white flex items-center text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-light text-white mb-2">Reset <span className="font-bold text-[#D4AF37]">Password</span></h2>
                    <div className="w-16 h-1 bg-[#D4AF37] mx-auto"></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full pl-10 bg-[#0a0a0a] border border-[#262626] rounded-lg py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
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
                        {loading ? 'Updating...' : 'Set New Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
