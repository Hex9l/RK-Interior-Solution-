import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';

const Dashboard = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [stats, setStats] = useState({
        packages: 0,
        works: 0,
        ideas: 0,
        inquiries: 0
    });

    useEffect(() => {
        // Fetch some real stats concurrently
        const fetchStats = async () => {
            try {
                const [pkgs, wrks, idas, knw, inq] = await Promise.all([
                    api.get('/packages'),
                    api.get('/works'),
                    api.get('/design-images'),
                    api.get('/inquiries')
                ]);
                setStats({
                    packages: pkgs.data.length,
                    works: wrks.data.length,
                    ideas: idas.data.length,
                    inquiries: knw.data.filter(i => !i.isRead).length // Count unread
                });
            } catch (e) {
                console.error(e);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { name: 'Packages', value: stats.packages, icon: <Package size={28} />, path: '/admin/packages', color: 'from-blue-500/20 to-[#171717]' },
        { name: 'Completed Works', value: stats.works, icon: <ImageIcon size={28} />, path: '/admin/works', color: 'from-purple-500/20 to-[#171717]' },
        { name: 'Design Ideas', value: stats.ideas, icon: <Layers size={28} />, path: '/admin/ideas', color: 'from-emerald-500/20 to-[#171717]' },
        { name: 'Unread Inquiries', value: stats.inquiries, icon: <MessageSquare size={28} />, path: '/admin/inquiries', color: 'from-rose-500/20 to-[#171717]' },
    ];

    return (
        <div>
            <div className="mb-6 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl font-light text-white mb-1.5 sm:mb-2">Welcome Back, <span className="font-bold text-[#D4AF37]">{userInfo?.name}</span></h1>
                <p className="text-gray-400 text-xs sm:text-sm">Here is what is happening with your portfolio today.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {statCards.map((card, idx) => (
                    <Link key={idx} to={card.path}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`bg-gradient-to-br ${card.color} border border-[#262626] p-6 rounded-2xl shadow-lg hover:border-[#D4AF37]/50 transition-colors group cursor-pointer relative overflow-hidden`}
                        >
                            <div className="absolute top-0 right-0 p-4 sm:p-6 text-gray-600 group-hover:text-[#D4AF37] group-hover:scale-110 transition-all opacity-20 group-hover:opacity-50">
                                {card.icon}
                            </div>
                            <h3 className="text-gray-400 font-medium mb-1 text-sm sm:text-base">{card.name}</h3>
                            <p className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">{card.value}</p>
                            <div className="text-[#D4AF37] text-xs sm:text-sm flex items-center gap-1 font-medium group-hover:translate-x-2 transition-transform">
                                Manage <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
