import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/axiosInstance';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const LikedDesigns = () => {
    const [likedIdeas, setLikedIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalMedia, setModalMedia] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchLiked = async () => {
            try {
                const { data } = await api.get('/design-images/liked');
                setLikedIdeas(data);
            } catch (error) {
                console.error('Error fetching liked designs', error);
                toast.error('Failed to load your favorites');
            } finally {
                setLoading(false);
            }
        };
        fetchLiked();
    }, [user, navigate]);

    const handleUnlike = async (e, ideaId) => {
        e.stopPropagation();
        try {
            await api.post(`/design-images/${ideaId}/toggle-like`);
            setLikedIdeas(prev => prev.filter(idea => idea._id !== ideaId));
            
            if (modalMedia) {
                closeModal();
            }
            
            toast.success('Removed from favorites', {
                icon: '💔',
                className: 'bg-black border border-[#D4AF37]/20 text-white'
            });
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const openModal = (index) => {
        setCurrentIndex(index);
        const idea = likedIdeas[index];
        setModalMedia({ 
            url: idea.url, 
            type: idea.type || 'image', 
            title: idea.title || idea.category?.name || 'Design Idea' 
        });
    };

    const closeModal = () => {
        setModalMedia(null);
    };

    const handleNext = (e) => {
        e?.stopPropagation();
        const nextIdx = (currentIndex + 1) % likedIdeas.length;
        setCurrentIndex(nextIdx);
        const idea = likedIdeas[nextIdx];
        setModalMedia({ 
            url: idea.url, 
            type: idea.type || 'image', 
            title: idea.title || idea.category?.name || 'Design Idea' 
        });
    };

    const handlePrev = (e) => {
        e?.stopPropagation();
        const prevIdx = (currentIndex - 1 + likedIdeas.length) % likedIdeas.length;
        setCurrentIndex(prevIdx);
        const idea = likedIdeas[prevIdx];
        setModalMedia({ 
            url: idea.url, 
            type: idea.type || 'image', 
            title: idea.title || idea.category?.name || 'Design Idea' 
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#D4AF37] transition-colors mb-6 group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs uppercase tracking-[0.2em]">Back to Home</span>
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-3"
                            >
                                Your Personal Collection
                            </motion.p>
                            <motion.h1
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl font-serif text-white"
                            >
                                Liked <span className="italic text-[#D4AF37]">Designs</span>
                            </motion.h1>
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/30 to-transparent hidden md:block mb-4" />
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                            <Heart size={14} className="text-red-500 fill-red-500" />
                            <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">
                                {likedIdeas.length} {likedIdeas.length === 1 ? 'Design' : 'Designs'} Saved
                            </span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-40">
                        <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin"></div>
                    </div>
                ) : likedIdeas.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40 border border-white/5 bg-[#0d0d0d] rounded-3xl"
                    >
                        <Heart size={48} className="text-gray-800 mx-auto mb-6" />
                        <h2 className="text-xl text-white font-serif mb-2">No liked designs yet</h2>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
                            Explore our gallery and heart the designs that inspire you to see them here.
                        </p>
                        <Link 
                            to="/gallery"
                            className="inline-flex items-center gap-3 bg-[#D4AF37] text-black px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white transition-all duration-300 shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
                        >
                            Explore Gallery
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {likedIdeas.map((idea, index) => (
                            <motion.div
                                key={idea._id}
                                layoutId={idea._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                onClick={() => openModal(index)}
                                className="group relative aspect-[3/4] cursor-pointer overflow-hidden bg-[#111] border border-white/[0.05] rounded-2xl transition-all duration-500 hover:border-[#D4AF37]/40 hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)]"
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
                                        />
                                    )}
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                                
                                <button
                                    onClick={(e) => handleUnlike(e, idea._id)}
                                    className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg"
                                    title="Remove from favorites"
                                >
                                    <Heart size={16} className="fill-current" />
                                </button>

                                <div className="absolute inset-x-0 bottom-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                                        {idea.category?.name || 'Inspiration'}
                                    </p>
                                    <div className="h-[1px] w-8 bg-[#D4AF37]/50" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal - Same as DesignIdeas for consistency */}
            <AnimatePresence>
                {modalMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                        onClick={closeModal}
                        data-lenis-prevent
                    >
                        {/* Small, Cute Close Button */}
                        <motion.button 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            onClick={closeModal} 
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/40 hover:text-[#D4AF37] transition-all bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/5 backdrop-blur-md z-[80]"
                        >
                            <X size={20} />
                        </motion.button>

                        {/* Navigation Arrows */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="absolute inset-x-4 sm:inset-x-10 top-1/2 -translate-y-1/2 flex justify-between items-center pointer-events-none z-[75]"
                        >
                            <button
                                onClick={handlePrev}
                                className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 hover:bg-black/80 transition-all backdrop-blur-sm group"
                            >
                                <ChevronLeft size={20} className="sm:size-6" />
                            </button>
                            <button
                                onClick={handleNext}
                                className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-black/40 border border-white/10 text-white/60 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 hover:bg-black/80 transition-all backdrop-blur-sm group"
                            >
                                <ChevronRight size={20} className="sm:size-6" />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center px-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.8)] border border-white/10 bg-black">
                                {modalMedia.type === 'video' ? (
                                    <video key={modalMedia.url} src={modalMedia.url} controls autoPlay playsInline className="w-full max-h-[75vh] object-contain bg-black" />
                                ) : (
                                    <motion.img 
                                        key={modalMedia.url} 
                                        initial={{ opacity: 0.6 }} 
                                        animate={{ opacity: 1 }} 
                                        transition={{ duration: 0.3 }}
                                        src={modalMedia.url} 
                                        alt="Fullscreen Preview" 
                                        className="w-full max-h-[75vh] object-contain bg-black" 
                                        decoding="async" 
                                    />
                                )}
                            </div>

                            <div className="mt-6 flex flex-col items-center gap-4">
                                <h3 className="text-[#D4AF37] font-serif italic text-2xl tracking-wide drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]">
                                    {modalMedia.title}
                                </h3>
                                
                                <div className="flex items-center gap-4">
                                    <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em]">
                                            {currentIndex + 1} of {likedIdeas.length}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => handleUnlike(e, likedIdeas[currentIndex]._id)}
                                        className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg backdrop-blur-md"
                                    >
                                        <Heart size={20} className="fill-current" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LikedDesigns;
