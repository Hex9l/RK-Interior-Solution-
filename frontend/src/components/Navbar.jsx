import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const handleNavClick = (e, path) => {
        if (location.pathname === '/' && (path === '/' || path.startsWith('/#'))) {
            e.preventDefault();
            const id = path === '/' ? 'hero' : path.split('#')[1];
            const element = document.getElementById(id);
            if (element) {
                const y = element.getBoundingClientRect().top + window.scrollY - 70;
                window.scrollTo({ top: y, behavior: 'smooth' });
                window.history.pushState(null, '', path);
                setActiveSection(id);
            }
        }
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (location.pathname === '/') {
            const observerOptions = {
                root: null,
                rootMargin: '-45% 0px -45% 0px',
                threshold: 0
            };

            const observerCallback = (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            };

            const observer = new IntersectionObserver(observerCallback, observerOptions);
            const sections = ['hero', 'services'];

            sections.forEach(id => {
                const el = document.getElementById(id);
                if (el) observer.observe(el);
            });

            return () => observer.disconnect();
        } else {
            setActiveSection('');
        }
    }, [location.pathname]);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/#services' },
        { name: 'Gallery', path: '/gallery' },
        { name: 'Knowledge', path: '/furniture-knowledge' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path) => {
        if (location.pathname === '/') {
            // Home link highlights for hero or when no specific section is caught yet
            if (path === '/') return activeSection === 'hero' || activeSection === '';
            // Services link highlights when its section is dominant
            if (path === '/#services') return activeSection === 'services';
        }
        return location.pathname === path;
    };

    return (
        <>
            <nav
                className={`fixed w-full z-50 transition-all duration-500 ${scrolled
                    ? 'bg-black border-b border-[#D4AF37]/20 py-3 shadow-[0_4px_60px_rgba(0,0,0,0.8)]'
                    : 'bg-black py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <Link to="/" onClick={(e) => handleNavClick(e, '/')} className="flex items-center gap-4 group">
                            {/* Monogram Block */}
                            <div className="relative flex items-center justify-center w-14 h-14 bg-[#D4AF37] shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.2)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300">
                                <span className="text-black font-serif font-bold text-2xl leading-none tracking-tight">RK</span>
                            </div>
                            {/* Thin gold vertical divider */}
                            <div className="w-px h-9 bg-[#D4AF37]/30" />
                            {/* Brand Name */}
                            <div className="flex flex-col justify-center leading-none">
                                <span className="text-white text-sm tracking-[0.35em] uppercase font-semibold font-sans">Interior</span>
                                <span className="text-[#D4AF37] text-[10px] tracking-[0.5em] uppercase font-light mt-[3px]">Solution</span>
                            </div>
                        </Link>

                        {/* Desktop Links - only show on xl+ */}
                        <div className="hidden xl:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={(e) => handleNavClick(e, link.path)}
                                    className={`relative text-[11px] tracking-[0.3em] uppercase font-medium transition-colors duration-300 group ${isActive(link.path)
                                        ? 'text-[#D4AF37]'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                    <span className={`absolute -bottom-1.5 left-0 h-px bg-[#D4AF37] transition-all duration-400 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`} />
                                </Link>
                            ))}

                            {/* Auth Controls */}
                            {user ? (
                                <div className="ml-4 flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-400">
                                        <User size={13} />
                                        <span className="max-w-[100px] truncate">{user.name}</span>
                                    </div>
                                    {user.isAdmin && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="flex items-center gap-1.5 px-4 py-2 text-[11px] tracking-[0.2em] uppercase font-medium border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.25)]"
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                    <Link
                                        to="/liked-designs"
                                        className="flex items-center gap-1.5 px-4 py-2 text-[11px] tracking-[0.2em] uppercase font-medium border border-[#D4AF37]/20 text-white/80 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all duration-300"
                                        title="View saved designs"
                                    >
                                        <Heart size={12} className="fill-red-500/20 text-red-500" />
                                        Liked
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        title="Secure Logout"
                                        className="group flex items-center justify-center w-8 h-8 rounded-full text-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 border border-transparent hover:border-red-500/20"
                                    >
                                        <LogOut size={14} className="group-hover:scale-110 transition-transform duration-300" />
                                    </button>
                                </div>
                            ) : (
                                <div className="ml-4 flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-1.5 px-4 py-2 text-[11px] tracking-[0.2em] uppercase font-medium border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.25)]"
                                    >
                                        <LogIn size={12} />
                                        Login
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile/Tablet Burger Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="xl:hidden flex items-center justify-center w-10 h-10 text-gray-300 hover:text-[#D4AF37] transition-colors border border-[#262626] hover:border-[#D4AF37]/40"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 w-full h-screen bg-[#070707] z-40 flex flex-col pt-24 sm:pt-32 px-6"
                        data-lenis-prevent
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col h-full">
                            {/* Gold accent line */}
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: 40 }}
                                className="h-[1px] bg-[#D4AF37] mb-8 sm:mb-12 mx-auto opacity-60" 
                            />

                            <nav className="flex flex-col items-center gap-5 sm:gap-7 my-auto">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05, duration: 0.4 }}
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={(e) => {
                                                handleNavClick(e, link.path);
                                                setIsOpen(false);
                                            }}
                                            className={`block text-center text-2xl sm:text-3xl font-serif italic transition-all duration-300 transform hover:scale-105 ${
                                                isActive(link.path) ? 'text-[#D4AF37]' : 'text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <div className="mt-auto pb-10">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex flex-col items-center gap-6"
                                >
                                    <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                                    
                                    {/* User Branding */}
                                    <div className="flex flex-col items-center gap-1.5">
                                        <span className="text-gray-500 text-[10px] tracking-[0.4em] uppercase font-medium">Founder</span>
                                        <span className="text-[#D4AF37] text-sm tracking-[0.2em] uppercase font-semibold">Kirit Dhokiya</span>
                                    </div>

                                    {/* Mobile Auth Buttons */}
                                    <div className="w-full max-w-[320px] grid grid-cols-2 gap-3">
                                        {user ? (
                                            <>
                                                {user.isAdmin && (
                                                    <Link
                                                        to="/admin/dashboard"
                                                        onClick={() => setIsOpen(false)}
                                                        className="col-span-2 flex items-center justify-center px-4 py-3.5 bg-[#D4AF37]/5 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-[#D4AF37] hover:text-black transition-all rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                                                    >
                                                        Admin Panel
                                                    </Link>
                                                )}
                                                <Link
                                                    to="/liked-designs"
                                                    onClick={() => setIsOpen(false)}
                                                    className={`${user.isAdmin ? 'col-span-1' : 'col-span-2'} flex items-center justify-center gap-2 px-3 py-3.5 bg-white/[0.03] border border-white/10 text-white/90 text-[11px] tracking-[0.2em] uppercase font-medium hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all rounded-lg`}
                                                >
                                                    <Heart size={14} className="fill-red-500/20 text-red-500" strokeWidth={1.5} />
                                                    <span>Liked</span>
                                                </Link>
                                                <button
                                                    onClick={() => { handleLogout(); setIsOpen(false); }}
                                                    className={`${user.isAdmin ? 'col-span-1' : 'col-span-2'} flex items-center justify-center gap-2 px-3 py-3.5 bg-red-500/[0.02] border border-red-500/10 text-red-500/70 hover:text-red-400 hover:bg-red-500/5 transition-all text-[11px] tracking-[0.2em] uppercase font-medium rounded-lg`}
                                                >
                                                    <LogOut size={14} strokeWidth={1.5} />
                                                    <span>Logout</span>
                                                </button>
                                            </>
                                        ) : (
                                            <Link
                                                to="/login"
                                                onClick={() => setIsOpen(false)}
                                                className="col-span-2 flex items-center justify-center gap-2 px-8 py-4 bg-[#D4AF37]/5 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all text-[11px] tracking-[0.3em] uppercase font-bold rounded-lg shadow-[0_4px_25px_rgba(212,175,55,0.1)]"
                                            >
                                                <LogIn size={16} />
                                                Secure Login
                                            </Link>
                                        )}
                                    </div>

                                    <p className="text-gray-600 text-[9px] tracking-[0.4em] uppercase opacity-70">Premium Interior Design</p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
