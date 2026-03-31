import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, PlayCircle, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/axiosInstance';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const DesignIdeas = ({ initialIdeas, initialLoading }) => {
    const [ideas, setIdeas] = useState(initialIdeas || []);
    const [loading, setLoading] = useState(initialLoading !== undefined ? initialLoading : true);
    const [modalMedia, setModalMedia] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        // Skip internal fetch if initial data is provided
        if (initialIdeas) {
            setIdeas(initialIdeas);
            setLoading(initialLoading !== undefined ? initialLoading : false);
            return;
        }

        const fetchIdeas = async () => {
            try {
                const { data } = await api.get('/design-images?shuffle=true');
                setIdeas(data.slice(0, 8));
            } catch (err) {
                console.error('Error fetching design ideas', err);
            } finally {
                setLoading(false);
            }
        };
        fetchIdeas();
    }, [initialIdeas, initialLoading]);

    const handleLike = async (e, ideaId) => {
        e.stopPropagation();
        if (!user) {
            toast.info('Please login to save your favorite designs!', {
                icon: '✨'
            });
            return;
        }

        try {
            const { data } = await api.post(`/design-images/${ideaId}/toggle-like`);
            setIdeas(prev => prev.map(idea => 
                idea._id === ideaId ? { ...idea, likes: data.likes } : idea
            ));
            
            // If modal is open, update its likes too (indirectly via index)
            if (data.message === 'Liked') {
                toast.success('Added to your favorites!', {
                    icon: '❤️',
                    className: 'bg-black border border-[#D4AF37]/20 text-white'
                });
            }
        } catch (err) {
            toast.error('Failed to update like status');
        }
    };

    const openModal = (index) => {
        setCurrentIndex(index);
        const idea = ideas[index];
        setModalMedia({ 
            url: idea.url, 
            type: idea.type || 'image', 
            title: idea.title || idea.category?.name || 'Design Idea' 
        });
    };

    const closeModal = () => {
        setModalMedia(null);
    };

    const handleNext = React.useCallback((e) => {
        e?.stopPropagation();
        const nextIdx = (currentIndex + 1) % ideas.length;
        setCurrentIndex(nextIdx);
        const idea = ideas[nextIdx];
        setModalMedia({ 
            url: idea.url, 
            type: idea.type || 'image', 
            title: idea.title || idea.category?.name || 'Design Idea' 
        });
    }, [currentIndex, ideas]);

    const handlePrev = React.useCallback((e) => {
        e?.stopPropagation();
        const prevIdx = (currentIndex - 1 + ideas.length) % ideas.length;
        setCurrentIndex(prevIdx);
        const idea = ideas[prevIdx];
        setModalMedia({ 
            url: idea.url, 
            type: idea.type || 'image', 
            title: idea.title || idea.category?.name || 'Design Idea' 
        });
    }, [currentIndex, ideas]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!modalMedia) return;
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalMedia, handleNext, handlePrev]);

    if (!loading && ideas.length === 0) return null;

    return (
        <section className="py-20 bg-[#0a0a0a] overflow-hidden">
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
                        Pure Inspiration
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-4"
                    >
                        Design <span className="italic text-[#D4AF37]">Ideas</span>
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
                        className="text-gray-400 max-w-md mx-auto font-light text-sm sm:text-base leading-relaxed"
                    >
                        Explore our curated collection of visionary interior concepts to spark your next transformation.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                        {ideas.map((idea, index) => (
                            <motion.div
                                key={idea._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.05 }}
                                onClick={() => openModal(index)}
                                className="group relative aspect-[3/4] cursor-pointer overflow-hidden bg-[#111] border border-white/[0.05] rounded-xl sm:rounded-2xl transition-all duration-500 hover:border-[#D4AF37]/40 hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)]"
                            >
                                <div className="absolute inset-0 z-0">
                                    {idea.type === 'video' ? (
                                        <video
                                            src={idea.url}
                                            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                                            muted loop playsInline autoPlay
                                        />
                                    ) : (
                                        <img
                                            src={getOptimizedImageUrl(idea.url)}
                                            alt={idea.category?.name}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    )}
                                </div>

                                {/* Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                                
                                {idea.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <PlayCircle size={40} className="text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" strokeWidth={1.5} />
                                    </div>
                                )}

                                {/* Heart Like Button */}
                                <button
                                    onClick={(e) => handleLike(e, idea._id)}
                                    className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:text-red-500 hover:bg-white/10 transition-all duration-300 group/like shadow-lg"
                                >
                                    <Heart 
                                        size={18} 
                                        className={`transition-all duration-300 ${idea.likes?.some(id => id.toString() === user?._id?.toString()) ? 'fill-red-500 text-red-500 scale-110' : 'group-hover/like:scale-110'}`} 
                                    />
                                </button>

                                {/* Content */}
                                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <p className="text-[#D4AF37] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {idea.category?.name || 'Inspiration'}
                                    </p>
                                    <div className="h-[1px] w-0 bg-[#D4AF37]/50 group-hover:w-8 transition-all duration-500 delay-100" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Footer CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex justify-center mt-12 sm:mt-16"
                >
                    <Link
                        to="/gallery"
                        className="group flex items-center gap-3 border border-[#D4AF37]/30 hover:border-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 text-[#D4AF37] px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold transition-all duration-500 uppercase tracking-[0.2em] text-[10px] sm:text-xs"
                    >
                        Explore Full Gallery
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </motion.div>
            </div>

            <AnimatePresence>
                {modalMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                        onClick={closeModal}
                        data-lenis-prevent
                    >
                        {/* Small, Cute Close Button */}
                        <button 
                            onClick={closeModal} 
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/40 hover:text-[#D4AF37] transition-all bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/5 backdrop-blur-md z-[80]"
                        >
                            <X size={20} />
                        </button>

                        {/* Navigation Arrows */}
                        <div className="absolute inset-x-4 sm:inset-x-10 top-1/2 -translate-y-1/2 flex justify-between items-center pointer-events-none z-[75]">
                            <button
                                onClick={handlePrev}
                                className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 hover:bg-black/60 transition-all backdrop-blur-sm group"
                            >
                                <ChevronLeft size={20} className="sm:size-6" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 hover:bg-black/60 transition-all backdrop-blur-sm group"
                            >
                                <ChevronRight size={20} className="sm:size-6" />
                            </button>
                        </div>

                        <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.98, opacity: 0 }}
                            className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center px-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] border border-white/10">
                                {modalMedia.type === 'video' ? (
                                    <video key={modalMedia.url} src={modalMedia.url} controls autoPlay playsInline preload="metadata" className="w-full max-h-[70vh] object-contain bg-black" />
                                ) : (
                                    <img key={modalMedia.url} src={modalMedia.url} alt="Fullscreen Preview" className="w-full max-h-[70vh] object-contain bg-black" decoding="async" />
                                )}
                            </div>

                            {/* Caption/Counter info */}
                            <div className="mt-5 flex flex-col items-center gap-3">
                                {modalMedia.title && (
                                    <div className="flex flex-col items-center gap-1">
                                        <h3 className="text-[#D4AF37] font-serif italic text-xl sm:text-2xl tracking-wide drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]">
                                            {modalMedia.title}
                                        </h3>
                                        <div className="w-10 h-[1px] bg-[#D4AF37]/50" />
                                    </div>
                                )}

                                {/* Counter pill & Like button row */}
                                <div className="flex items-center gap-3">
                                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-medium">
                                            Idea {currentIndex + 1} of {ideas.length}
                                        </span>
                                    </div>

                                    <button
                                        onClick={(e) => handleLike(e, ideas[currentIndex]._id)}
                                        className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-red-500 hover:bg-white/10 transition-all backdrop-blur-md group/modal-like"
                                    >
                                        <Heart 
                                            size={18} 
                                            className={`transition-all duration-300 ${ideas[currentIndex].likes?.some(id => id.toString() === user?._id?.toString()) ? 'fill-red-500 text-red-500 scale-110' : 'group-hover/modal-like:scale-110'}`} 
                                        />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default DesignIdeas;
