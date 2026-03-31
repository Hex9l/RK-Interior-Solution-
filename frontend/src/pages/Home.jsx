import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, PlayCircle, X, PencilRuler, Zap, TreePine, Hammer, Layers, LayoutGrid, Paintbrush, Lightbulb, Gem, GlassWater, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/axiosInstance';
import PackageCard from '../components/PackageCard';
import DesignIdeas from '../components/DesignIdeas';


const Home = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
    const opacity = useTransform(scrollY, [0, 500], [1, 0]);

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videoWorks, setVideoWorks] = useState([]);
    const [modalVideo, setModalVideo] = useState(null);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const { data } = await api.get('/packages');
                setPackages(data);
            } catch (error) {
                console.error('Error fetching packages', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    useEffect(() => {
        const fetchVideoWorks = async () => {
            try {
                const { data } = await api.get('/works');
                // Filter only works that have a video media entry
                const videoItems = data.filter(w =>
                    w.media?.some(m => m.type === 'video' || m.url?.includes('/video/'))
                );
                // Shuffle and pick 3
                const shuffled = [...videoItems].sort(() => Math.random() - 0.5);
                setVideoWorks(shuffled.slice(0, 3)); // 3 for desktop, only first 2 shown on mobile
            } catch (e) {
                console.error('Error fetching works', e);
            }
        };
        fetchVideoWorks();
    }, []);

    return (
        <div className="w-full bg-[#0a0a0a]">
            {/* ── Hero Section ── */}
            <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">

                {/* Parallax Background */}
                <motion.div className="absolute inset-0 z-0" style={{ y: y1, opacity }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#0a0a0a] z-10" />
                    <img
                        src="/hero-bg.png"
                        alt="Luxury Interior Background"
                        className="w-full h-full object-cover opacity-20"
                        loading="eager"
                        decoding="async"
                    />
                </motion.div>

                {/* ── MOBILE LAYOUT (< xl) ── */}
                <div className="relative z-10 w-full xl:hidden flex flex-col items-center px-5 pt-24 pb-10 gap-0">

                    {/* Brand pill */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center gap-2 mb-5"
                    >
                        <div className="h-px w-6 bg-[#D4AF37]/60" />
                        <span className="text-[12px] uppercase tracking-[0.35em] text-[#D4AF37] font-medium">R.K. Interior Solution</span>
                        <div className="h-px w-6 bg-[#D4AF37]/60" />
                    </motion.div>

                    {/* Profile image + badge — stacked together */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-center mb-8"
                    >
                        {/* Oval portrait */}
                        <div
                            className="relative w-48 h-[17rem] sm:w-64 sm:h-[24rem] rounded-[999px] overflow-hidden p-[3px]"
                            style={{
                                background: 'linear-gradient(160deg, rgba(212,175,55,0.5) 0%, rgba(212,175,55,0.05) 60%)',
                                boxShadow: '0 0 60px rgba(212,175,55,0.12), 0 30px 80px rgba(0,0,0,0.6)',
                            }}
                        >
                            <div className="w-full h-full rounded-[999px] overflow-hidden bg-[#141414]">
                                <img
                                    src="/profile.png"
                                    alt="Founder Profile"
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                    decoding="async"
                                />
                            </div>
                        </div>

                        {/* Floating experience badge — below portrait */}
                        <div className="gpu-accelerated animate-smooth-float -mt-5 z-20">
                            <div
                                className="flex flex-col items-center justify-center gap-0.5 px-5 py-3 sm:px-6 sm:py-4 rounded-[1rem] sm:rounded-[1.25rem] w-[8rem] sm:w-[10rem]"
                                style={{
                                    background: 'rgba(18,18,18,0.97)',
                                    border: '1px solid rgba(212,175,55,0.45)',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212,175,55,0.1)',
                                }}
                            >
                                <span
                                    className="font-serif italic text-[#D4AF37] leading-none text-[1.9rem] sm:text-[2.5rem]"
                                    style={{ letterSpacing: '-0.02em', textShadow: '0 0 14px rgba(212,175,55,0.4)' }}
                                >
                                    20+
                                </span>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-gray-400 font-medium leading-[1.4]">Years Of</span>
                                    <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-white font-bold leading-[1.4]">Experience</span>
                                </div>
                                <div className="w-8 sm:w-10 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent my-1.5" />
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] font-bold text-white/90 text-center">Kirit Dhokiya</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Text block */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full text-center mt-6"
                    >
                        <h1 className="text-[2.6rem] sm:text-5xl font-sans tracking-tight text-white leading-[1.08] mb-3">
                            Crafting
                            <span
                                className="font-serif italic block"
                                style={{ color: '#D4AF37', textShadow: '0 0 40px rgba(212,175,55,0.4), 0 0 80px rgba(212,175,55,0.2)' }}
                            >
                                Futuristic Elegance
                            </span>
                        </h1>

                        <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light max-w-sm mx-auto mt-3 mb-5">
                            Transforming spaces into minimal, premium, and functional masterpieces. We offer complete{' '}
                            <span className="text-[#D4AF37] font-semibold" style={{ textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>Turnkey Projects</span>
                            {' '}— including{' '}
                            <span className="text-white underline underline-offset-4 decoration-[#D4AF37]/60">Wooden Furniture</span>,{' '}
                            <span className="text-white underline underline-offset-4 decoration-[#D4AF37]/60">Aluminium Section Work</span>,{' '}
                            <span className="text-white underline underline-offset-4 decoration-[#D4AF37]/60">Glass Work</span>,{' '}
                            <span className="text-white underline underline-offset-4 decoration-[#D4AF37]/60">Sofas &amp; Curtains</span>, and{' '}
                            <span className="text-white underline underline-offset-4 decoration-[#D4AF37]/60">Bed Sheets</span>{' '}
                            for your high-end lifestyle.
                        </p>

                        {/* Location chip */}
                        <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 mb-6">
                            <MapPin size={11} className="text-[#D4AF37]" strokeWidth={2} />
                            <span className="text-[12px] uppercase tracking-[0.2em] text-gray-400">Ahmedabad, Gujarat</span>
                        </div>

                        {/* CTA Buttons — full-width on mobile */}
                        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto sm:max-w-sm">
                            <Link
                                to="/contact"
                                className="group flex items-center justify-center gap-2.5 bg-[#D4AF37] text-[#0a0a0a] w-full py-4 rounded-2xl font-bold hover:bg-white transition-all duration-700 uppercase tracking-wider text-xs shadow-[0_8px_30px_rgba(212,175,55,0.25)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.2)]"
                            >
                                Contact Us
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/gallery"
                                className="flex items-center justify-center gap-2.5 border border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#D4AF37]/40 text-white w-full py-4 rounded-2xl font-medium transition-all duration-400 backdrop-blur-sm uppercase tracking-wider text-xs"
                            >
                                Explore Work
                            </Link>
                        </div>

                        {/* Stats row */}
                        <div
                            className="flex items-center w-full mt-8 rounded-2xl overflow-hidden border border-[#222] divide-x divide-[#222]"
                            style={{ background: 'linear-gradient(to bottom, #111, #0a0a0a)' }}
                        >
                            {[
                                { value: '100+', label: 'Satisfied\nClients' },
                                { value: '5+', label: 'Cities\nCovered' },
                                { value: '100%', label: 'Premium\nQuality' },
                            ].map((stat) => (
                                <div key={stat.label} className="flex-[1] flex flex-col items-center justify-center py-4 sm:py-5 px-1 sm:px-2">
                                    <span
                                        className="font-serif italic text-[#D4AF37] text-[1.15rem] leading-none mb-1.5"
                                        style={{ textShadow: '0 0 10px rgba(212,175,55,0.2)' }}
                                    >
                                        {stat.value}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-[0.15em] text-white font-medium leading-tight whitespace-pre-line text-center">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ── DESKTOP LAYOUT (xl+) ── */}
                <div className="relative z-10 hidden xl:flex max-w-7xl mx-auto px-8 py-20 flex-row items-center gap-16 w-full">

                    {/* Profile Image Column */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 flex justify-end relative"
                    >
                        <div
                            className="relative w-80 h-[40rem] rounded-[999px] overflow-hidden p-[3px]"
                            style={{
                                background: 'linear-gradient(160deg, rgba(212,175,55,0.45) 0%, rgba(212,175,55,0.04) 70%)',
                                boxShadow: '0 0 80px rgba(212,175,55,0.1), 0 40px 100px rgba(0,0,0,0.6)',
                            }}
                        >
                            <div className="w-full h-full rounded-[999px] overflow-hidden bg-[#141414]">
                                <img
                                    src="/profile.png"
                                    alt="Founder Profile"
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                    decoding="async"
                                />
                            </div>
                        </div>

                        {/* Floating badge */}
                        <div className="absolute bottom-14 left-30 z-20 gpu-accelerated animate-smooth-float">
                            <div
                                className="relative flex flex-col items-center justify-center gap-1 px-6 py-5 rounded-[1.5rem] w-[11.5rem]"
                                style={{
                                    background: '#141414',
                                    border: '1px solid rgba(212,175,55,0.25)',
                                    boxShadow: '0 15px 40px rgba(0,0,0,0.8), 0 0 20px rgba(212,175,55,0.05)',
                                }}
                            >
                                <span
                                    className="font-serif italic text-[#D4AF37] leading-none mb-1"
                                    style={{ fontSize: '3rem', letterSpacing: '-0.02em', textShadow: '0 0 15px rgba(212,175,55,0.3)' }}
                                >
                                    20+
                                </span>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9.5px] uppercase tracking-[0.25em] text-gray-400 font-medium leading-[1.3]">Years Of</span>
                                    <span className="text-[9.5px] uppercase tracking-[0.25em] text-white font-bold leading-[1.3] mt-[1px]">Experience</span>
                                </div>
                                <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent my-3.5" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white text-center">Kirit Dhokiya</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Text Content Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 text-left"
                    >
                        <p className="text-[#D4AF37] mb-6 text-xs uppercase tracking-[0.35em] font-medium flex items-center gap-3">
                            <span className="h-px w-8 bg-[#D4AF37]/60 inline-block" />
                            R.K. Interior Solution
                        </p>

                        <h1 className="text-6xl lg:text-7xl font-sans tracking-tight text-white mb-6 leading-tight">
                            Crafting
                            <span className="font-serif italic text-[#D4AF37] block mt-2">Futuristic Elegance</span>
                        </h1>

                        <p className="text-gray-400 mb-8 max-w-lg leading-relaxed font-light text-lg">
                            Transforming spaces into minimal, premium, and functional masterpieces. We offer complete{' '}
                            <span className="text-[#D4AF37] font-semibold" style={{ textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>Turnkey Projects</span>
                            {' '}— including{' '}
                            <span className="text-white underline underline-offset-4 decoration-[#D4AF37]/60">Wooden Furniture</span>,{' '}
                            <span className="text-white underline underline-offset-4 decoration-[#D4AF37]/60">Aluminium Section Work</span>,{' '}
                            <span className="text-white underline underline-offset-4 decoration-[#D4AF37]/60">Glass Work</span>,{' '}
                            <span className="text-white underline underline-offset-4 decoration-[#D4AF37]/60">Sofas &amp; Curtains</span>, and{' '}
                            <span className="text-white underline underline-offset-4 decoration-[#D4AF37]/60">Bed Sheets</span>{' '}
                            for your high-end lifestyle.
                        </p>

                        <div className="flex items-center gap-2 mb-10 text-xs text-gray-500 uppercase tracking-widest">
                            <MapPin size={14} className="text-[#D4AF37]" strokeWidth={1.5} />
                            <span>Ahmedabad, Gujarat, India</span>
                        </div>

                        <div className="flex gap-4 mb-10">
                            <Link
                                to="/contact"
                                className="group flex items-center gap-3 bg-[#D4AF37] text-[#0a0a0a] px-10 py-4 rounded-full font-semibold hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-700 uppercase tracking-wider text-xs"
                            >
                                Contact Us
                                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/gallery"
                                className="flex items-center gap-3 border border-[#262626] bg-[#171717]/50 hover:bg-[#171717] hover:border-[#D4AF37]/50 text-white px-10 py-4 rounded-full font-medium transition-all duration-500 backdrop-blur-sm uppercase tracking-wider text-xs"
                            >
                                Explore Work
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6">
                            {[
                                { value: '100+', label: 'Satisfied\nClients' },
                                { value: '5+', label: 'Cities\nCovered' },
                                { value: '100%', label: 'Premium\nQuality' },
                            ].map((stat, i) => (
                                <React.Fragment key={stat.value}>
                                    {i > 0 && <div className="w-px h-8 bg-[#D4AF37]/20" />}
                                    <div className="flex items-center gap-3">
                                        <span className="font-serif italic text-2xl text-[#D4AF37]">{stat.value}</span>
                                        <span className="text-[10px] uppercase tracking-[0.15em] text-white leading-[1.3] whitespace-pre-line">{stat.label}</span>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            

            {/* ── Completed Works Video Section ── */}
            {videoWorks.length > 0 && (
                <section id="works" className="py-20 bg-[#0a0a0a] overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Section header */}
                        <div className="text-center mb-12">
                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-3"
                            >
                                Our Craftsmanship
                            </motion.p>
                            <motion.h2
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-4"
                            >
                                Completed <span className="italic text-[#D4AF37]">Works</span>
                            </motion.h2>
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: 60 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="h-[1px] bg-[#D4AF37] mx-auto mb-5"
                            />
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.25 }}
                                className="text-gray-400 max-w-md mx-auto font-light text-sm sm:text-base"
                            >
                                A glimpse into the spaces we've transformed — premium finishes, bespoke details.
                            </motion.p>
                        </div>

                        {/* Video cards grid — mobile: 2col/2 videos, sm+: 3col/3 videos */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                            {videoWorks.map((work, index) => {
                                const videoMedia = work.media.find(m => m.type === 'video' || m.url?.includes('/video/'));
                                if (!videoMedia) return null;
                                return (
                                    <motion.div
                                        key={work._id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                                        className={`group relative cursor-pointer rounded-xl overflow-hidden bg-[#111] border border-white/[0.06] hover:border-[#D4AF37]/40 transition-all duration-500 hover:shadow-[0_8px_30px_rgba(212,175,55,0.15)] hover:-translate-y-0.5 ${index >= 2 ? 'hidden sm:block' : ''}`}
                                        onClick={() => setModalVideo(videoMedia)}
                                    >
                                        {/* Aspect ratio container */}
                                        <div className="aspect-[9/16] relative overflow-hidden">
                                            {/* Video */}
                                            <video
                                                src={videoMedia.url}
                                                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:opacity-90 opacity-60 group-hover:scale-105"
                                                muted loop playsInline preload="none"
                                                poster={videoMedia.coverUrl || ''}
                                                onMouseEnter={e => e.target.play().catch(() => {})}
                                                onMouseLeave={e => e.target.pause()}
                                            />
                                            {/* Dark gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                            {/* Gold shimmer on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/0 to-[#D4AF37]/0 group-hover:from-[#D4AF37]/5 transition-all duration-700" />
                                            {/* Play button */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 border border-[#D4AF37]/50 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                                                    <PlayCircle size={22} className="text-[#D4AF37] sm:hidden drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]" strokeWidth={1.5} />
                                                    <PlayCircle size={28} className="text-[#D4AF37] hidden sm:block drop-shadow-[0_0_6px_rgba(212,175,55,0.6)]" strokeWidth={1.5} />
                                                </div>
                                            </div>
                                            {/* VIDEO badge */}
                                            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/70 border border-[#D4AF37]/30 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.12em] text-[#D4AF37]">Video</span>
                                            </div>
                                        </div>

                                        {/* Bottom info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 z-10">
                                            <div className="w-5 h-[1px] bg-[#D4AF37]/50 mb-1.5 sm:mb-2 group-hover:w-10 transition-all duration-500" />
                                            <p className="text-white text-[10px] sm:text-sm font-semibold uppercase tracking-wider opacity-80 group-hover:opacity-100 group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-1">
                                                {work.title || 'Interior'}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* View all CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                            className="flex justify-center mt-10"
                        >
                            <Link
                                to="/gallery"
                                className="group flex items-center gap-3 border border-[#D4AF37]/30 hover:border-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 text-[#D4AF37] px-8 py-3.5 rounded-full font-semibold transition-all duration-500 uppercase tracking-widest text-xs"
                            >
                                View All Works
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </Link>
                        </motion.div>
                    </div>

                    {/* ── Fullscreen Video Modal ── */}
                    <AnimatePresence>
                        {modalVideo && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/95 backdrop-blur-lg"
                                onClick={() => setModalVideo(null)}
                                data-lenis-prevent
                            >
                                <button
                                    onClick={() => setModalVideo(null)}
                                    className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all duration-300 z-10"
                                >
                                    <X size={18} />
                                </button>
                                <motion.div
                                    initial={{ scale: 0.93, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.93, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] border border-white/10"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <video
                                        src={modalVideo.url}
                                        poster={modalVideo.coverUrl || ''}
                                        controls
                                        autoPlay
                                        playsInline
                                        preload="metadata"
                                        className="w-full max-h-[90vh] object-contain bg-black"
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            )}

            {/* ── Services We Offer Section ── */}
            <section id="our-services" className="py-20 bg-[#070707]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-3"
                        >
                            What We Do
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-4"
                        >
                            Services We <span className="italic text-[#D4AF37]">Offer</span>
                        </motion.h2>
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: 60 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-[1px] bg-[#D4AF37] mx-auto mb-5"
                        />
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.25 }}
                            className="text-gray-400 max-w-md mx-auto font-light text-sm sm:text-base"
                        >
                            Tailored interior solutions for every space — crafted with precision and passion.
                        </motion.p>
                    </div>

                    {/* Service Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                        {[
                            {
                                icon: '🏡',
                                title: 'Bungalow Furniture',
                                desc: 'Luxurious, spacious furniture crafted for elegant bungalow living.',
                            },
                            {
                                icon: '🏢',
                                title: 'Flat Furniture',
                                desc: 'Smart, modern designs that maximize every corner of your apartment.',
                            },
                            {
                                icon: '🛍️',
                                title: 'Shop Furniture',
                                desc: 'Attractive retail display fixtures and counters for your business.',
                            },
                            {
                                icon: '💼',
                                title: 'Office Furniture',
                                desc: 'Ergonomic and professional setups for a productive workspace.',
                            },
                            {
                                icon: '🪵',
                                title: 'Wooden Work',
                                desc: 'Handcrafted wooden panels, wardrobes and custom joinery.',
                            },
                            {
                                icon: '🪟',
                                title: 'Aluminium & Glass',
                                desc: 'Sleek aluminium sections and tempered glass partitions.',
                            },
                            {
                                icon: '🛋️',
                                title: 'Sofas & Curtains',
                                desc: 'Premium upholstery and bespoke curtain solutions.',
                            },
                            {
                                icon: '🏨',
                                title: 'Full Turnkey Projects',
                                desc: 'End-to-end interior execution from bare shell to move-in ready.',
                            },
                        ].map((service, i) => {
                            const isTurnkey = service.title === 'Full Turnkey Projects';
                            return (
                                <motion.div
                                    key={service.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                                    className={`group relative bg-[#111111] border p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 transition-all duration-500 hover:-translate-y-0.5 ${
                                        isTurnkey
                                            ? 'border-[#D4AF37]/60 shadow-[0_8px_30px_rgba(212,175,55,0.15)] bg-[#151515]'
                                            : 'border-[#1e1e1e] hover:border-[#D4AF37]/40 hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)]'
                                    }`}
                                >
                                    {/* Gold corner accent */}
                                    <div
                                        className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] transition-all duration-500 ${
                                            isTurnkey
                                                ? 'border-t-[#D4AF37]/40'
                                                : 'border-t-[#D4AF37]/20 group-hover:border-t-[#D4AF37]/50'
                                        }`}
                                    />

                                    {/* Icon */}
                                    <div className="text-2xl sm:text-3xl leading-none">{service.icon}</div>

                                    {/* Gold divider */}
                                    <div
                                        className={`h-[1px] bg-[#D4AF37]/40 transition-all duration-500 ${
                                            isTurnkey ? 'w-10 bg-[#D4AF37]/70' : 'w-6 group-hover:w-10 group-hover:bg-[#D4AF37]/70'
                                        }`}
                                    />

                                    {/* Title */}
                                    <h3 className="text-white font-semibold text-sm sm:text-base leading-snug tracking-wide uppercase">
                                        {service.title}
                                        {isTurnkey && <span className="ml-2 text-[10px] text-[#D4AF37] align-middle">Featured</span>}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-500 text-[11px] sm:text-[13px] font-light leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                                        {service.desc}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
            
            {/* ── Design Ideas Section ── */}
            <DesignIdeas />

            {/* ── Packages Section ── */}

            <section id="services" className="pt-10 pb-20 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-12">
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-3"
                        >
                            Curated For You
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-4 sm:mb-6"
                        >
                            Service <span className="italic text-[#D4AF37]">Packages</span>
                        </motion.h2>
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: 60 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="h-[1px] bg-[#D4AF37] mx-auto mb-6 sm:mb-8"
                        />
                        <p className="text-gray-400 max-w-xl mx-auto font-light leading-relaxed text-sm sm:text-base">
                            Choose from our perfectly curated interior and bespoke furniture packages.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
                        </div>
                    ) : packages.length === 0 ? (
                        <div className="text-center text-gray-500 py-20 font-light italic text-sm">
                            <p>Check back soon for our exclusive design packages.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-10">
                            {packages.map((pkg, index) => (
                                <PackageCard key={pkg._id} pkg={pkg} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
