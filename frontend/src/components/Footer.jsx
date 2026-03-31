import { useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();
    const isContactPage = location.pathname === '/contact';

    return (
        <footer className="bg-[#050505] border-t border-[#1a1a1a] pt-16 pb-8 mt-auto relative overflow-hidden">
            {/* Background decorative element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37] opacity-[0.02] blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-12 gap-x-8 lg:gap-12">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-5 space-y-8">
                        <Link to="/" className="flex items-center gap-4 group w-fit">
                            {/* Monogram Block - Matching Navbar */}
                            <div className="relative flex items-center justify-center w-14 h-14 bg-[#D4AF37] shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.2)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-500">
                                <span className="text-black font-serif font-bold text-2xl leading-none tracking-tight">RK</span>
                            </div>
                            {/* Thin gold vertical divider */}
                            <div className="w-px h-10 bg-[#D4AF37]/30" />
                            {/* Brand Name */}
                            <div className="flex flex-col justify-center leading-none">
                                <span className="text-white text-base tracking-[0.35em] uppercase font-semibold font-sans">Interior</span>
                                <span className="text-[#D4AF37] text-[12px] tracking-[0.5em] uppercase font-light mt-[3px]">Solution</span>
                            </div>
                        </Link>
                        
                        <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light max-w-md">
                            Elevating living spaces with bespoke interior solutions. Our design philosophy merges timeless elegance with functional innovation to create environments that inspire.
                        </p>

                        <div className="flex gap-4">
                            {/* Social or additional badges can go here if needed in future */}
                        </div>
                    </div>

                    {/* Quick Links Section */}
                    <div className="lg:col-span-3">
                        <h4 className="text-white font-medium mb-8 tracking-[0.25em] text-xs uppercase relative flex items-center gap-3">
                            <span className="w-8 h-px bg-[#D4AF37]/40"></span>
                            Quick Links
                        </h4>
                        <ul className="space-y-5 text-sm sm:text-base text-gray-400 font-light">
                            <li>
                                <Link to="/gallery" className="group flex items-center gap-2 hover:text-[#D4AF37] transition-all duration-300 w-fit">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-2">
                                        Completed Works
                                        <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="group flex items-center gap-2 hover:text-[#D4AF37] transition-all duration-300 w-fit">
                                    <span className="group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-2">
                                        Contact Us
                                        <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info Section */}
                    {!isContactPage && (
                        <div className="md:col-span-2 lg:col-span-4 lg:justify-self-end w-full">
                            <h4 className="text-white font-medium mb-8 tracking-[0.25em] text-xs uppercase relative flex items-center gap-3">
                                <span className="w-8 h-px bg-[#D4AF37]/40"></span>
                                Contact Info
                            </h4>
                            <ul className="space-y-6 text-sm sm:text-base text-gray-400 font-light">
                                <li className="flex items-start gap-4 group transition-all duration-300">
                                    <div className="mt-1 bg-[#121212] border border-[#262626] p-2.5 rounded-lg text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-500 shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] uppercase tracking-widest text-gray-600 font-medium">Headquarters</span>
                                        <span className="leading-relaxed group-hover:text-gray-200 transition-colors duration-300 cursor-default">Shop no.3, Padmavatinagar Society, canal Rd, Naroda, Ahmedabad, Gujarat, India</span>
                                    </div>
                                </li>
                                <li className="flex items-center gap-4 group transition-all duration-300">
                                    <div className="bg-[#121212] border border-[#262626] p-2.5 rounded-lg text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-500 shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] uppercase tracking-widest text-gray-600 font-medium">Direct Email</span>
                                        <a href="mailto:Kiritdhokiya988@gmail.com" className="hover:text-[#D4AF37] transition-colors duration-300 truncate font-light tracking-wide italic">Kiritdhokiya988@gmail.com</a>
                                    </div>
                                </li>
                                <li className="flex items-center gap-4 group transition-all duration-300">
                                    <div className="bg-[#121212] border border-[#262626] p-2.5 rounded-lg text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-500 shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] uppercase tracking-widest text-gray-600 font-medium">Call Us</span>
                                        <a href="tel:+919825864812" className="hover:text-[#D4AF37] transition-colors duration-300 tracking-[0.1em] font-medium">+91 98258 64812</a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer Bottom */}
                <div className="mt-20 pt-10 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-10 md:gap-6 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start gap-4 md:gap-3">
                        <p className="text-[11px] sm:text-xs text-gray-400 tracking-[0.25em] uppercase font-medium">
                            &copy; {new Date().getFullYear()} RK Interior Solution. All rights reserved.
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] text-gray-500 uppercase tracking-[0.15em] font-medium italic">Built with excellence by RK Interior</span>
                            <div className="w-8 h-px bg-[#D4AF37]/30"></div>
                            <div className="text-[#D4AF37] text-xl animate-pulse">&hearts;</div>
                        </div>
                        <p className="text-[10px] text-gray-700 uppercase tracking-[0.4em] font-bold mt-1">Premium Bespoke Design</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
