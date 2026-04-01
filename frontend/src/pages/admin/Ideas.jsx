import { useState, useEffect, useRef } from 'react';
import api from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, Edit2, Trash2, ChevronDown, CheckCircle, X } from 'lucide-react';

const AdminIdeas = () => {
    const [activeTab, setActiveTab] = useState('images'); // 'images' or 'categories'
    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all');

    // Category Modal State
    const [showCatModal, setShowCatModal] = useState(false);
    const [editingCatId, setEditingCatId] = useState(null);
    const [catFormData, setCatFormData] = useState({ name: '' });

    // Image Modal State
    const [showImgModal, setShowImgModal] = useState(false);
    const [editingImgId, setEditingImgId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imgFormData, setImgFormData] = useState({ title: '', category: '', url: '', type: 'image' });
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, type: 'category'|'image' }
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const filterDropdownRef = useRef(null);

    useEffect(() => {
        fetchData();

        return () => {
        };
    }, [activeTab]);

    useEffect(() => {
        if (showCatModal || showImgModal) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            document.body.style.overflow = '';
            setIsAnimating(false);
            setIsDropdownOpen(false);
        }
        return () => { document.body.style.overflow = ''; };
    }, [showCatModal, showImgModal]);

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle click outside filter dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
                setFilterDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'categories') {
                const { data } = await api.get('/design-categories');
                setCategories(data);
            } else {
                const [catRes, imgRes] = await Promise.all([
                    api.get('/design-categories'),
                    api.get('/design-images')
                ]);
                setCategories(catRes.data);
                setImages(imgRes.data);
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // --- Category Handlers ---
    const handleCatSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCatId) {
                await api.put(`/design-categories/${editingCatId}`, catFormData);
                toast.success('Category updated');
            } else {
                await api.post('/design-categories', catFormData);
                toast.success('Category created');
            }
            setIsAnimating(false);
            setTimeout(() => setShowCatModal(false), 300);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const deleteCategory = async () => {
        if (!deleteConfirm) return;
        try {
            await api.delete(`/design-categories/${deleteConfirm.id}`);
            toast.success('Category deleted');
            fetchData();
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setDeleteConfirm(null);
        }
    };


    // --- Image Handlers ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('media', file);

        setUploading(true);
        
        try {
            const res = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            await new Promise(r => setTimeout(r, 800)); // Slight delay for premium feel
            setImgFormData({ ...imgFormData, url: res.data.url, type: res.data.type || 'image' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload media');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleImgSubmit = async (e) => {
        e.preventDefault();
        if (!imgFormData.url) return toast.error('Please upload media');
        try {
            if (editingImgId) {
                await api.put(`/design-images/${editingImgId}`, imgFormData);
                toast.success('Media updated');
            } else {
                await api.post('/design-images', imgFormData);
                toast.success('Media saved');
            }
            setIsAnimating(false);
            setTimeout(() => setShowImgModal(false), 300);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const deleteImage = async () => {
        if (!deleteConfirm) return;
        try {
            await api.delete(`/design-images/${deleteConfirm.id}`);
            toast.success('Media deleted');
            fetchData();
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm?.type === 'category') deleteCategory();
        else deleteImage();
    };

    return (
        <div className="min-h-screen pb-24 sm:pb-12 bg-[#0a0a0a]">
            {/* Premium Header */}
            <div className="relative lg:sticky lg:top-0 z-[30] bg-[#0a0a0a] lg:bg-[#0a0a0a]/90 lg:backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-5 sm:py-6 mb-6 sm:mb-8">
                <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">Design Ideas</h1>
                        <p className="text-[#D4AF37] text-[10px] sm:text-xs font-semibold tracking-widest uppercase mt-1">Manage Inspiration</p>
                    </div>
                    <div className="flex gap-2">
                        {activeTab === 'images' ? (
                            <button onClick={() => { setEditingImgId(null); setImgFormData({ title: '', category: '', url: '', type: 'image' }); setShowImgModal(true); }} className="flex items-center justify-center gap-2 bg-[#D4AF37] text-black w-11 h-11 sm:w-auto sm:h-auto sm:px-6 sm:py-3.5 rounded-full sm:rounded-xl font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                                <Plus size={20} className="sm:mr-1" />
                                <span className="hidden sm:inline text-xs uppercase tracking-[0.1em]">Add Media</span>
                            </button>
                        ) : (
                            <button onClick={() => { setEditingCatId(null); setCatFormData({ name: '' }); setShowCatModal(true); }} className="flex items-center justify-center gap-2 bg-[#D4AF37] text-black w-11 h-11 sm:w-auto sm:h-auto sm:px-6 sm:py-3.5 rounded-full sm:rounded-xl font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                                <Plus size={20} className="sm:mr-1" />
                                <span className="hidden sm:inline text-xs uppercase tracking-[0.1em]">Add Category</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                {/* Premium Tabs */}
                <div className="flex bg-[#111] p-1.5 rounded-2xl border border-white/5 mb-8 w-full sm:w-max mx-auto shadow-2xl">
                    <button onClick={() => setActiveTab('images')} className={`flex-1 sm:flex-none px-8 py-3 text-[11px] tracking-[0.2em] font-black uppercase rounded-xl transition-all duration-500 ${activeTab === 'images' ? 'bg-[#D4AF37] text-black shadow-[0_4px_15px_rgba(212,175,55,0.3)]' : 'text-gray-500 hover:text-white'}`}>Media</button>
                    <button onClick={() => setActiveTab('categories')} className={`flex-1 sm:flex-none px-8 py-3 text-[11px] tracking-[0.2em] font-black uppercase rounded-xl transition-all duration-500 ${activeTab === 'categories' ? 'bg-[#D4AF37] text-black shadow-[0_4px_15px_rgba(212,175,55,0.3)]' : 'text-gray-500 hover:text-white'}`}>Categories</button>
                </div>

                {/* ASOS-Style Dropdown Filter — Only for Images Tab */}
                {activeTab === 'images' && !loading && categories.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-[#111]/30 p-4 rounded-xl border border-white/5">
                        {/* Results count */}
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-[#D4AF37]">
                                {filterCategory === 'all'
                                    ? images.length
                                    : images.filter(img => img.category?._id === filterCategory).length}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">
                                Designs Found
                            </span>
                        </div>

                        {/* Dropdown Trigger */}
                        <div className="relative w-full sm:w-auto" ref={filterDropdownRef}>
                            <button
                                onClick={() => setFilterDropdownOpen(prev => !prev)}
                                className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-6 py-3 border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                    filterDropdownOpen
                                        ? 'border-[#D4AF37] text-black bg-[#D4AF37]'
                                        : filterCategory !== 'all'
                                        ? 'border-[#D4AF37]/60 text-[#D4AF37] bg-[#D4AF37]/5'
                                        : 'border-white/10 text-gray-400 bg-[#1a1a1a] hover:border-white/20 hover:text-white'
                                }`}
                            >
                                <span>
                                    {filterCategory === 'all'
                                        ? 'View Category'
                                        : categories.find(c => c._id === filterCategory)?.name || 'Category'
                                    }
                                </span>
                                <motion.div
                                    animate={{ rotate: filterDropdownOpen ? 180 : 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <ChevronDown size={14} />
                                </motion.div>
                            </button>

                            {/* Dropdown Panel */}
                            <AnimatePresence>
                                {filterDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        className="absolute left-0 sm:right-0 top-[calc(100%+8px)] z-50 w-full sm:w-72 bg-[#141414] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden rounded-xl"
                                    >
                                        {/* Header Row */}
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                                {filterCategory === 'all' ? '0 selected' : '1 selected'}
                                            </span>
                                            <button
                                                onClick={() => { setFilterCategory('all'); setFilterDropdownOpen(false); }}
                                                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest border transition-all duration-200 ${
                                                    filterCategory === 'all'
                                                        ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                                                        : 'border-white/10 text-gray-500 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]'
                                                }`}
                                            >
                                                {filterCategory === 'all' && <CheckCircle size={10} />}
                                                All
                                            </button>
                                        </div>

                                        {/* Category List */}
                                        <div className="max-h-64 overflow-y-auto">
                                            {categories.map((cat, i) => {
                                                const count = images.filter(img => img.category?._id === cat._id).length;
                                                const isActive = filterCategory === cat._id;
                                                return (
                                                    <button
                                                        key={cat._id}
                                                        onClick={() => { setFilterCategory(cat._id); setFilterDropdownOpen(false); }}
                                                        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-all duration-150 border-b border-white/[0.03] last:border-0 ${
                                                            isActive
                                                                ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                                                                : 'text-gray-300 hover:bg-white/[0.03] hover:text-white'
                                                        }`}
                                                    >
                                                        <span className="font-semibold tracking-wide">{cat.name}</span>
                                                        <span className={`text-xs font-bold ${
                                                            isActive ? 'text-[#D4AF37]' : 'text-gray-600'
                                                        }`}>({count})</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-4">
                            <Upload size={24} className="text-[#D4AF37] opacity-60" />
                        </div>
                        <p className="text-gray-500 text-xs tracking-[0.2em] font-medium uppercase">Fetching Data...</p>
                    </div>
                ) : activeTab === 'images' ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                        <AnimatePresence mode="popLayout">
                            {images
                                .filter(img => filterCategory === 'all' || img.category?._id === filterCategory)
                                .map(img => (
                                    <motion.div 
                                        key={img._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        className="group relative bg-[#121212] rounded-2xl p-1 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-2xl border border-white/[0.02]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-2xl" />
                                        <div className="bg-[#121212] rounded-[0.9rem] h-full flex flex-col relative z-10 overflow-hidden">
                                            {/* Media */}
                                            <div className="aspect-[4/5] relative overflow-hidden">
                                                {img.type === 'video' ? (
                                                    <video src={img.url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                                ) : (
                                                    <img src={img.url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                )}
                                            </div>
                                            {/* Category name — solid, always readable */}
                                            <div className="px-2 py-2 bg-[#0d0d0d] border-t border-white/5">
                                                <p className="text-[9px] text-[#D4AF37] font-black uppercase tracking-widest text-center truncate">
                                                    {img.category?.name || 'Interior Design'}
                                                </p>
                                            </div>
                                            {/* Always-visible action bar */}
                                            <div className="flex bg-[#0d0d0d] border-t border-white/5 p-1.5 gap-1.5">
                                                <button
                                                    onClick={() => { setEditingImgId(img._id); setImgFormData({ title: img.title, category: img.category?._id || '', url: img.url, type: img.type || 'image' }); setShowImgModal(true); }}
                                                    className="flex-1 flex items-center justify-center h-9 rounded-xl text-white bg-white/5 active:scale-95 transition-all"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <div className="w-px bg-white/10 my-1.5" />
                                                <button
                                                    onClick={() => setDeleteConfirm({ id: img._id, type: 'image' })}
                                                    className="flex-1 flex items-center justify-center h-9 rounded-xl text-red-400 bg-red-500/5 active:scale-95 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                        {categories.map((cat) => (
                            <div key={cat._id} className="group relative bg-[#121212] rounded-2xl sm:rounded-[1.5rem] p-1 overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 shadow-xl border border-white/[0.02]">
                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                                <div className="bg-[#121212] rounded-[0.9rem] sm:rounded-[1.25rem] h-full flex flex-row sm:flex-col items-center sm:items-stretch relative z-10 overflow-hidden">
                                    <div className="flex-grow p-4 sm:p-6 min-w-0">
                                        <h3 className="text-sm sm:text-xl font-black text-white uppercase tracking-wider truncate">{cat.name}</h3>
                                    </div>
                                    <div className="flex px-3 sm:px-2 py-2 sm:py-2 gap-2 sm:gap-2 bg-[#0d0d0d]/50 sm:bg-[#0d0d0d] sm:border-t border-white/5 h-full sm:h-auto items-center sm:items-stretch">
                                        <button onClick={() => { setEditingCatId(cat._id); setCatFormData({ name: cat.name }); setShowCatModal(true); }} className="flex items-center justify-center w-9 h-9 sm:flex-1 sm:h-11 rounded-xl sm:rounded-xl text-white bg-white/5 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider">
                                            <Edit2 size={14} /> <span className="hidden sm:inline sm:ml-2">Edit</span>
                                        </button>
                                        <div className="hidden sm:block w-[1px] h-6 bg-white/10" />
                                        <button onClick={() => setDeleteConfirm({ id: cat._id, type: 'category' })} className="flex items-center justify-center w-9 h-9 sm:flex-1 sm:h-11 rounded-xl sm:rounded-xl text-red-400 bg-red-500/5 active:scale-95 transition-all text-xs font-bold uppercase tracking-wider">
                                            <Trash2 size={14} /> <span className="hidden sm:inline sm:ml-2">Remove</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category Modal */}
            {showCatModal && (
                <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} data-lenis-prevent>
                    <div className={`bg-[#0d0d0d] w-full sm:max-w-lg sm:border sm:border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col h-auto max-h-[90vh] transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${isAnimating ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:translate-y-0 sm:scale-95'}`} onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 sm:hidden shrink-0" />
                        <div className="flex justify-between items-center px-6 sm:px-8 py-5 sm:py-6 border-b border-white/5 shrink-0">
                            <div>
                                <h2 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-1">{editingCatId ? 'Edit Configuration' : 'New Configuration'}</h2>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider leading-none">Category</h3>
                            </div>
                        </div>
                        <div className="px-6 sm:px-8 py-6">
                            <form id="catForm" onSubmit={handleCatSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-gray-400 uppercase tracking-widest font-black ml-1">Category Name</label>
                                    <input required value={catFormData.name} onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })} placeholder="e.g. Luxurious Living Room" className="w-full h-[52px] bg-[#1a1a1a] border border-transparent focus:bg-[#222] focus:border-[#D4AF37] rounded-xl px-4 text-white text-[15px] outline-none transition-all placeholder:text-gray-600" />
                                </div>

                            </form>
                        </div>
                        <div className="p-4 sm:p-6 border-t border-white/5 bg-[#0d0d0d]/95 backdrop-blur-md flex gap-3">
                            <button type="button" onClick={() => { setIsAnimating(false); setTimeout(() => setShowCatModal(false), 300); }} className="flex-1 h-[56px] rounded-xl text-gray-300 bg-[#1a1a1a] active:bg-[#222] transition-colors uppercase tracking-widest text-xs font-black">Cancel</button>
                            <button type="submit" form="catForm" className="flex-[2] h-[56px] bg-[#D4AF37] text-black rounded-xl font-black active:scale-95 transition-transform uppercase tracking-widest text-xs shadow-[0_4px_14px_0_rgba(212,175,55,0.3)]">Save Category</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImgModal && (
                <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} data-lenis-prevent>
                    <div className={`bg-[#0d0d0d] w-full sm:max-w-lg sm:border sm:border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col h-auto max-h-[90vh] transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${isAnimating ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:translate-y-0 sm:scale-95'}`} onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 sm:hidden shrink-0" />
                        <div className="flex justify-between items-center px-6 sm:px-8 py-5 sm:py-6 border-b border-white/5 shrink-0">
                            <div>
                                <h2 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-1">{editingImgId ? 'Edit Asset' : 'New Asset'}</h2>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider leading-none">Design Media</h3>
                            </div>
                        </div>
                        <div className="px-6 sm:px-8 py-6 space-y-6">
                            <form id="imgForm" onSubmit={handleImgSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-gray-400 uppercase tracking-widest  font-black ml-1">Asset Category</label>
                                    <div className="relative mt-2" ref={dropdownRef}>
                                        <button 
                                            type="button"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className={`w-full h-[52px] bg-[#1a1a1a] border rounded-xl px-4 flex items-center justify-between transition-all duration-300 ${isDropdownOpen ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'border-white/5 hover:border-white/10'}`}
                                        >
                                            <span className={`text-[15px] ${imgFormData.category ? 'text-white font-medium' : 'text-gray-500'}`}>
                                                {imgFormData.category 
                                                    ? categories.find(c => c._id === imgFormData.category)?.name 
                                                    : 'Choose Collection'}
                                            </span>
                                            <motion.div
                                                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                <ChevronDown size={18} className={isDropdownOpen ? 'text-[#D4AF37]' : 'text-gray-500'} />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {isDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="absolute z-[70] left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl"
                                                >
                                                    <div className="max-h-[240px] overflow-y-auto premium-scrollbar py-2">
                                                        {categories.length === 0 ? (
                                                            <div className="px-4 py-3 text-gray-500 text-[13px] italic">No categories available</div>
                                                        ) : (
                                                            categories.map((c) => (
                                                                <button
                                                                    key={c._id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setImgFormData({ ...imgFormData, category: c._id });
                                                                        setIsDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full px-4 py-3 text-left transition-all duration-200 group flex items-center justify-between ${imgFormData.category === c._id ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'}`}
                                                                >
                                                                    <span className="text-[14px] font-medium tracking-wide">{c.name}</span>
                                                                    {imgFormData.category === c._id && (
                                                                        <motion.div 
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"
                                                                        />
                                                                    )}
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-[11px] text-gray-400 uppercase tracking-widest font-black">Digital Asset</label>
                                        <label className={`cursor-pointer bg-[#D4AF37] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <Upload size={14} /> {uploading ? 'Wait...' : 'Upload'}
                                            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#0d0d0d] border border-white/5 flex items-center justify-center">
                                        {imgFormData.url ? (
                                            imgFormData.type === 'video' ? (
                                                <video src={imgFormData.url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                            ) : (
                                                <img src={imgFormData.url} alt="Preview" className="w-full h-full object-cover" />
                                            )
                                        ) : (
                                            <div className="text-center">
                                                <Upload size={24} className="mx-auto mb-2 text-gray-700" />
                                                <p className="text-[10px] text-gray-600 uppercase font-black">Ready for media</p>
                                            </div>
                                        )}
                                    </div>
                                    {uploading && (
                                        <div className="mt-4 flex items-center justify-between bg-[#0a0a0a] p-4 rounded-xl border border-white/5 overflow-hidden relative">
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="relative">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                        className="w-8 h-8 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                                                    />
                                                    <motion.div
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                        className="absolute inset-0 rounded-full bg-[#D4AF37]/10 -z-10 blur-md"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-[#D4AF37] uppercase font-black tracking-[0.2em] mb-0.5">Uploading</span>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-[12px] text-white font-black uppercase tracking-wider">Perfecting Asset</span>
                                                        <motion.div
                                                            animate={{ opacity: [0, 1, 0] }}
                                                            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
                                                            className="flex gap-0.5"
                                                        >
                                                            <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                                                            <div className="w-1 h-1 bg-[#D4AF37] rounded-full" style={{ animationDelay: '0.2s' }} />
                                                            <div className="w-1 h-1 bg-[#D4AF37] rounded-full" style={{ animationDelay: '0.4s' }} />
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#D4AF37]/5 to-transparent pointer-events-none" />
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                        <div className="p-4 sm:p-6 border-t border-white/5 bg-[#0d0d0d]/95 backdrop-blur-md flex gap-3">
                            <button type="button" onClick={() => { setIsAnimating(false); setTimeout(() => setShowImgModal(false), 300); }} className="flex-1 h-[56px] rounded-xl text-gray-300 bg-[#1a1a1a] active:bg-[#222] transition-colors uppercase tracking-widest text-xs font-black">Cancel</button>
                            <button type="submit" form="imgForm" disabled={uploading} className="flex-[2] h-[56px] bg-[#D4AF37] text-black rounded-xl font-black active:scale-95 transition-transform uppercase tracking-widest text-xs shadow-[0_4px_14px_0_rgba(212,175,55,0.3)] disabled:opacity-50">Save Asset</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-[2rem] p-6 text-center animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 shadow-2xl border border-white/5 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 relative z-10">
                            <Trash2 size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 relative z-10 tracking-wide uppercase">Remove {deleteConfirm.type}?</h3>
                        <p className="text-[13px] text-gray-400 mb-8 leading-relaxed relative z-10">This {deleteConfirm.type} will be permanently purged. This action cannot be reversed.</p>
                        <div className="flex flex-col gap-3 relative z-10">
                            <button onClick={handleConfirmDelete} className="w-full h-14 rounded-xl bg-red-500/20 text-red-500 font-black tracking-widest text-[11px] uppercase active:scale-95 transition-transform border border-red-500/30 hover:bg-red-500 hover:text-white">Delete</button>
                            <button onClick={() => setDeleteConfirm(null)} className="w-full h-14 rounded-xl bg-white/5 text-white font-black tracking-widest text-[11px] uppercase active:scale-95 transition-transform border border-white/5">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminIdeas;
