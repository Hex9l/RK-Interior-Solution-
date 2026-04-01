import React from 'react';
import { useNavigate, useLocation, Navigate, Link, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package as PackageIcon, Image, Settings, MessageSquare, Home, ArrowLeft } from 'lucide-react';

const AdminLayout = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const navigate = useNavigate();
    const location = useLocation();

    if (!userInfo || !userInfo.isAdmin) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Packages', path: '/admin/packages', icon: <PackageIcon size={20} /> },
        { name: 'Completed Works', path: '/admin/works', icon: <Image size={20} /> },
        { name: 'Design Ideas', path: '/admin/ideas', icon: <Settings size={20} /> },
        { name: 'Inquiries', path: '/admin/inquiries', icon: <MessageSquare size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-[#0a0a0a]" data-lenis-prevent>
            {/* Sidebar */}
            <div className="w-64 bg-[#171717] border-r border-[#262626] flex flex-col hidden lg:flex">
                <div className="p-6 border-b border-[#262626] text-center">
                    <h2 className="text-xl font-bold text-[#D4AF37] tracking-widest uppercase">Admin Panel</h2>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.name}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                                            : 'text-gray-400 hover:bg-[#0a0a0a] hover:text-white'
                                            }`}
                                    >
                                        {item.icon}
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="p-4 border-t border-[#262626]">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white hover:bg-[#0a0a0a] rounded-lg transition-colors border border-transparent hover:border-[#262626]"
                    >
                        <Home size={20} />
                        <span className="font-medium text-sm">Home Screen</span>
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-[#171717] border-b border-[#262626] px-4 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-[10px] uppercase tracking-widest font-medium">Back</span>
                    </button>

                    <h2 className="text-sm font-bold text-[#D4AF37] tracking-[0.2em] uppercase absolute left-1/2 -translate-x-1/2">
                        Admin
                    </h2>

                    <Link to="/" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                        <Home size={18} />
                    </Link>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0a0a0a] p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
