import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, PlayCircle, Heart, X, Search, Filter, 
    Image as ImageIcon, Video 
} from 'lucide-react';
import api from '../utils/axiosInstance';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Gallery = () => {
    const [activeTab, setActiveTab] = useState('works');
    const [works, setWorks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [ideas, setIdeas] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedWorkType, setSelectedWorkType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [modalMedia, setModalMedia] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const { user } = useAuth();

    const filteredWorks = works.filter(work => {
        if (selectedWorkType === 'all') return true;
        const hasVideo = work.media?.some(m => m.type === 'video' || m.url?.includes('/video/'));
        if (selectedWorkType === 'videos') return hasVideo;
        if (selectedWorkType === 'images') return !hasVideo;
        return true;
    });

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
            
            if (data.message === 'Liked') {
                toast.success('Added to your favorites!', {
                    icon: '❤️',
                    className: 'bg-black border border-[#D4AF37]/20 text-white shadow-2xl'
                });
            }
        } catch (err) {
            toast.error('Failed to update like status');
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedCategory]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'works') {
                const { data } = await api.get('/works');
                setWorks(data.map(work => ({
                    ...work,
                    media: work.media.map(m => ({
                        ...m,
                        url: m.type === 'image' ? getOptimizedImageUrl(m.url) : m.url
                    }))
                })));
            } else {
                if (categories.length === 0) {
                    const catRes = await api.get('/design-categories');
                    setCategories(catRes.data);
                }
                const endpoint = selectedCategory
                    ? `/design-images?category=${selectedCategory}&shuffle=true`
                    : '/design-images?shuffle=true';
                const { data } = await api.get(endpoint);
                setIdeas(data.map(idea => ({
                    ...idea,
                    url: getOptimizedImageUrl(idea.url)
                })));
            }
        } catch (error) {
            console.error('Error fetching gallery data', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (index, mediaIdx = 0) => {
        setCurrentIndex(index);
        setCurrentMediaIndex(mediaIdx);
        if (activeTab === 'works') {
            setModalMedia(filteredWorks[index].media[mediaIdx]);
        } else {
            const idea = ideas[index];
            setModalMedia({ url: idea.url, type: idea.type || 'image', title: idea.title || idea.category?.name || 'Design Idea' });
        }
    };

    const closeModal = () => {
        setModalMedia(null);
        setCurrentMediaIndex(0);
    };

    const handleNext = React.useCallback((e) => {
        e?.stopPropagation();
        if (activeTab === 'works') {
            const currentWork = filteredWorks[currentIndex];
            if (currentMediaIndex < currentWork.media.length - 1) {
                const nextMediaIdx = currentMediaIndex + 1;
                setCurrentMediaIndex(nextMediaIdx);
                setModalMedia(currentWork.media[nextMediaIdx]);
            } else {
                const nextIdx = (currentIndex + 1) % filteredWorks.length;
                setCurrentIndex(nextIdx);
                setCurrentMediaIndex(0);
                setModalMedia(filteredWorks[nextIdx].media[0]);
            }
        } else {
            const nextIdx = (currentIndex + 1) % ideas.length;
            setCurrentIndex(nextIdx);
            const idea = ideas[nextIdx];
            setModalMedia({ url: idea.url, type: idea.type || 'image', title: idea.title || idea.category?.name || 'Design Idea' });
        }
    }, [activeTab, filteredWorks, currentIndex, currentMediaIndex, ideas]);

    const handlePrev = React.useCallback((e) => {
        e?.stopPropagation();
        if (activeTab === 'works') {
            if (currentMediaIndex > 0) {
                const prevMediaIdx = currentMediaIndex - 1;
                setCurrentMediaIndex(prevMediaIdx);
                setModalMedia(filteredWorks[currentIndex].media[prevMediaIdx]);
            } else {
                const prevIdx = (currentIndex - 1 + filteredWorks.length) % filteredWorks.length;
                const prevWork = filteredWorks[prevIdx];
                const lastMediaIdx = prevWork.media.length - 1;
                setCurrentIndex(prevIdx);
                setCurrentMediaIndex(lastMediaIdx);
                setModalMedia(prevWork.media[lastMediaIdx]);
            }
        } else {
            const prevIdx = (currentIndex - 1 + ideas.length) % ideas.length;
            setCurrentIndex(prevIdx);
            const idea = ideas[prevIdx];
            setModalMedia({ url: idea.url, type: idea.type || 'image', title: idea.title || idea.category?.name || 'Design Idea' });
        }
    }, [activeTab, filteredWorks, currentIndex, currentMediaIndex, ideas]);

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

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-serif text-white mb-6"
                    >
                        Our <span className="italic text-[#D4AF37]">Portfolio</span>
                    </motion.h1>
                    <div className="w-24 h-[1px] bg-[#D4AF37] mx-auto mb-12"></div>

                    <div className="flex justify-center border-b border-[#262626] mb-12">
                        <button
                            onClick={() => setActiveTab('works')}
                            className={`px-10 py-5 text-sm uppercase tracking-[0.2em] font-medium transition-all duration-300 relative ${activeTab === 'works' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Completed Works
                            {activeTab === 'works' && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('ideas')}
                            className={`px-10 py-5 text-sm uppercase tracking-[0.2em] font-medium transition-all duration-300 relative ${activeTab === 'ideas' ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Design Ideas
                            {activeTab === 'ideas' && (
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></span>
                            )}
                        </button>
                    </div>
                </div>

                {activeTab === 'works' && works.length > 0 && (
                    <div className="relative mb-12 sm:mb-16">
                        {/* Gradient Fades for Mobile Scroll indicator */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none sm:hidden" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none sm:hidden" />

                        <div className="flex overflow-x-auto no-scrollbar gap-2.5 px-6 pb-2 sm:flex-wrap sm:justify-center sm:px-0 sm:pb-0 sm:gap-4">
                            {[
                                { id: 'all', label: 'All Works' },
                                { id: 'images', label: 'Images' },
                                { id: 'videos', label: 'Videos' }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setSelectedWorkType(filter.id)}
                                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all duration-300 border sm:px-6 sm:py-2 sm:text-xs ${selectedWorkType === filter.id ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-[#262626] bg-[#171717]/50 text-gray-400 hover:text-white hover:border-gray-500'}`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ideas' && categories.length > 0 && (
                    <div className="relative mb-12 sm:mb-16">
                        {/* Gradient Fades for Mobile Scroll indicator */}
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none sm:hidden" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none sm:hidden" />

                        <div className="flex overflow-x-auto no-scrollbar gap-2.5 px-6 pb-2 sm:flex-wrap sm:justify-center sm:px-0 sm:pb-0 sm:gap-4">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all duration-300 border sm:px-6 sm:py-2 sm:text-xs ${selectedCategory === '' ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-[#262626] bg-[#171717]/50 text-gray-400 hover:text-white hover:border-gray-500'}`}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat._id}
                                    onClick={() => setSelectedCategory(cat._id)}
                                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all duration-300 border sm:px-6 sm:py-2 sm:text-xs ${selectedCategory === cat._id ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-[#262626] bg-[#171717]/50 text-gray-400 hover:text-white hover:border-gray-500'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                        <AnimatePresence>
                            {activeTab === 'works' ? (
                                filteredWorks.map((work, index) => (
                                    <motion.div
                                        key={work._id}
                                        layout
                                        className="relative group cursor-pointer overflow-hidden bg-[#111] border border-white/[0.06] hover:border-[#D4AF37]/40 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(212,175,55,0.10)]"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.4, delay: index * 0.06 }}
                                        onClick={() => work.media?.length > 0 && openModal(index)}
                                    >
                                        <div className="aspect-[3/4] sm:aspect-[4/5] overflow-hidden relative">
                                            {work.media && work.media.length > 0 ? (
                                                work.media[0].type === 'video' ? (
                                                    <div className="w-full h-full relative bg-[#0a0a0a] flex items-center justify-center">
                                                        <PlayCircle size={36} className="text-[#D4AF37] absolute z-10 transition-transform duration-500 group-hover:scale-125 drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]" strokeWidth={1.5} />
                                                        <video
                                                            src={work.media[0].url}
                                                            className="absolute inset-0 w-full h-full object-cover opacity-70"
                                                            muted loop playsInline preload="none"
                                                            poster={work.media[0].coverUrl || ''}
                                                        />
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={work.media[0].url}
                                                        alt={work.title || ''}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                )
                                            ) : (
                                                <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
                                                    <PlayCircle size={28} className="text-gray-700" />
                                                </div>
                                            )}
                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                                            {work.media?.length > 1 && (
                                                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-[#D4AF37] text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-[#D4AF37]/30">
                                                    {work.media.length}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
                                            {work.title && (
                                                <h3 className="text-white font-serif italic text-sm sm:text-lg leading-tight tracking-wide group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-2">
                                                    {work.title}
                                                </h3>
                                            )}
                                            {work.clientName && (
                                                <p className="text-[#D4AF37]/70 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium mt-1">
                                                    {work.clientName}
                                                </p>
                                            )}
                                            <div className="w-6 h-[1px] bg-[#D4AF37]/40 mt-2 group-hover:w-12 transition-all duration-500" />
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                ideas.map((idea, index) => (
                                    <motion.div
                                        key={idea._id}
                                        layout
                                        className="group cursor-pointer overflow-hidden bg-[#111] border border-white/[0.06] hover:border-[#D4AF37]/40 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(212,175,55,0.10)]"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.4, delay: index * 0.06 }}
                                        onClick={() => openModal(index)}
                                    >
                                        <div className="aspect-[3/4] sm:aspect-[4/5] overflow-hidden relative">
                                            {idea.type === 'video' ? (
                                                <div className="w-full h-full relative bg-[#0a0a0a] flex items-center justify-center">
                                                    <PlayCircle size={36} className="text-[#D4AF37] absolute z-10 transition-transform duration-500 group-hover:scale-125 drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]" strokeWidth={1.5} />
                                                    <video
                                                        src={idea.url}
                                                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                                                        muted loop playsInline preload="none"
                                                    />
                                                </div>
                                            ) : (
                                                <img
                                                    src={idea.url}
                                                    alt={idea.category?.name || 'Design Idea'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            )}

                                            {/* Heart Like Button */}
                                            <button
                                                onClick={(e) => handleLike(e, idea._id)}
                                                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-red-500 hover:bg-black/60 transition-all duration-300 group/like shadow-lg"
                                            >
                                                <Heart 
                                                    size={16} 
                                                    className={`transition-all duration-300 ${idea.likes?.some(id => id.toString() === user?._id?.toString()) ? 'fill-red-500 text-red-500 scale-110' : 'group-hover/like:scale-110'}`} 
                                                />
                                            </button>
                                        </div>
                                        <div className="p-3 bg-[#0d0d0d] border-t border-white/5">
                                            <p className="text-[#D4AF37] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-center">
                                                {idea.category?.name || 'Interior Design'}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && activeTab === 'works' && works.length === 0 && (
                    <p className="text-gray-500 text-center py-20">No completed works to showcase yet.</p>
                )}
                {!loading && activeTab === 'works' && works.length > 0 && filteredWorks.length === 0 && (
                    <p className="text-gray-500 text-center py-20">No {selectedWorkType} found in completed works.</p>
                )}
                {!loading && activeTab === 'ideas' && ideas.length === 0 && (
                    <p className="text-gray-500 text-center py-20">No design ideas found for this category.</p>
                )}

            </div>

            <AnimatePresence>
                {modalMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
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

                        {/* Navigation Arrows - Better Positioning & Responsive Sizing */}
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
                                    <video key={modalMedia.url} src={modalMedia.url} poster={modalMedia.coverUrl || ''} controls autoPlay playsInline preload="metadata" className="w-full max-h-[70vh] object-contain bg-black" />
                                ) : (
                                    <img key={modalMedia.url} src={modalMedia.url} alt="Fullscreen Preview" className="w-full max-h-[70vh] object-contain bg-black" decoding="async" />
                                )}
                            </div>

                            {/* Caption/Counter info */}
                            <div className="mt-5 flex flex-col items-center gap-3">
                                {/* Title — shown for both tabs */}
                                {activeTab === 'ideas' && modalMedia.title && (
                                    <div className="flex flex-col items-center gap-1">
                                        <h3 className="text-[#D4AF37] font-serif italic text-xl sm:text-2xl tracking-wide drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]">
                                            {modalMedia.title}
                                        </h3>
                                        <div className="w-10 h-[1px] bg-[#D4AF37]/50" />
                                    </div>
                                )}
                                {activeTab === 'works' && filteredWorks[currentIndex] && filteredWorks[currentIndex].title && (
                                    <h3 className="text-white font-serif italic text-xl sm:text-2xl tracking-wide">
                                        {filteredWorks[currentIndex].title}
                                    </h3>
                                )}

                                <div className="flex items-center gap-4">
                                    {/* Counter pill */}
                                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-medium">
                                            {activeTab === 'works' ? (
                                                `Work ${currentIndex + 1} of ${filteredWorks.length}`
                                            ) : (
                                                `Design Idea ${currentIndex + 1} of ${ideas.length}`
                                            )}
                                        </span>
                                    </div>

                                    {activeTab === 'ideas' && ideas[currentIndex] && (
                                        <button
                                            onClick={(e) => handleLike(e, ideas[currentIndex]._id)}
                                            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-red-500 hover:bg-white/10 transition-all backdrop-blur-md group/modal-like"
                                        >
                                            <Heart 
                                                size={18} 
                                                className={`transition-all duration-300 ${ideas[currentIndex].likes?.some(id => id.toString() === user?._id?.toString()) ? 'fill-red-500 text-red-500 scale-110' : 'group-hover/modal-like:scale-110'}`} 
                                            />
                                        </button>
                                    )}
                                </div>

                                {/* Media dot indicators for multi-media works */}
                                {activeTab === 'works' && filteredWorks[currentIndex] && filteredWorks[currentIndex].media.length > 1 && (
                                    <div className="flex gap-2">
                                        {filteredWorks[currentIndex].media.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 transition-all duration-300 rounded-full ${i === currentMediaIndex ? 'w-8 bg-[#D4AF37]' : 'w-1.5 bg-white/20'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Gallery;
