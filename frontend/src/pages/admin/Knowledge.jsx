import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { Edit2, Trash2, Plus, X, Upload } from 'lucide-react';

const AdminKnowledge = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);


    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        imageUrl: '',
        author: 'Admin'
    });

    useEffect(() => {
        fetchArticles();
    }, []);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            document.body.style.overflow = '';
            setIsAnimating(false);
        }
        return () => { document.body.style.overflow = ''; };
    }, [showModal]);

    const fetchArticles = async () => {
        try {
            const { data } = await api.get('/knowledge');
            setArticles(data);
        } catch (error) {
            toast.error('Failed to fetch articles');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
            setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
            toast.success('Image uploaded');
        } catch (err) {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
            e.target.value = null; // reset input
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ title: '', content: '', excerpt: '', imageUrl: '', author: 'Admin' });
        setShowModal(true);
    };

    const openEditModal = (article) => {
        setEditingId(article._id);
        setFormData({
            title: article.title,
            content: article.content,
            excerpt: article.excerpt || '',
            imageUrl: article.imageUrl || '',
            author: article.author
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/knowledge/${editingId}`, formData);
                toast.success('Article updated');
            } else {
                await api.post('/knowledge', formData);
                toast.success('Article created');
            }
            setIsAnimating(false);
            setTimeout(() => setShowModal(false), 300);
            fetchArticles();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await api.delete(`/knowledge/${deleteConfirmId}`);
            toast.success('Article deleted');
            fetchArticles();
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    return (
        <div className="min-h-screen pb-24 sm:pb-12 bg-[#0a0a0a]">
            {/* Premium Header */}
            <div className="relative lg:sticky lg:top-0 z-[30] bg-[#0a0a0a] lg:bg-[#0a0a0a]/90 lg:backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 sm:py-6 mb-4 sm:mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">Knowledge Base</h1>
                        <p className="text-[#D4AF37] text-[10px] sm:text-xs font-semibold tracking-widest uppercase mt-1">Manage Articles</p>
                    </div>
                    <button 
                        onClick={openAddModal} 
                        className="flex items-center justify-center gap-2 bg-[#D4AF37] text-black w-11 h-11 sm:w-auto sm:h-auto sm:px-6 sm:py-3.5 rounded-full sm:rounded-xl font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    >
                        <Plus size={20} className="sm:mr-1" />
                        <span className="hidden sm:inline text-xs uppercase tracking-[0.1em]">Write Article</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-4">
                            <Plus size={24} className="text-[#D4AF37] opacity-60" />
                        </div>
                        <p className="text-gray-500 text-xs tracking-[0.2em] font-medium uppercase">Loading Articles...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <div key={article._id} className="group relative bg-[#121212] rounded-[1.5rem] p-1 overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-2xl border border-white/[0.02]">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                                <div className="bg-[#121212] rounded-[1.25rem] h-full flex flex-col relative z-10 overflow-hidden">
                                    <div className="h-48 overflow-hidden relative group/media">
                                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" />
                                        <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-md shadow-lg">{article.author}</div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 line-clamp-2 leading-tight">{article.title}</h3>
                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-6 flex-1">{article.excerpt}</p>
                                        <div className="flex gap-2 pt-4 border-t border-white/5">
                                            <button onClick={() => openEditModal(article)} className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-[11px] font-black text-white bg-white/5 active:scale-95 transition-all uppercase tracking-[0.2em]">
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <div className="w-[1px] h-6 bg-white/10 my-auto" />
                                            <button onClick={() => setDeleteConfirmId(article._id)} className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-[11px] font-black text-red-400 bg-red-500/5 active:scale-95 transition-all uppercase tracking-[0.2em]">
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && articles.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111] rounded-[2rem] border border-white/5 max-w-2xl mx-auto shadow-2xl">
                        <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6">
                            <Plus size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-widest uppercase mb-2">No Articles Yet</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8">Ready to share your interior design expertise? Start writing your first guide.</p>
                        <button onClick={openAddModal} className="bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform">Get Started</button>
                    </div>
                )}
            </div>

            {/* Premium Modal */}
            {showModal && (
                <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} data-lenis-prevent>
                    <div className={`bg-[#0d0d0d] w-full sm:max-w-2xl sm:border sm:border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh] transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${isAnimating ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:translate-y-0 sm:scale-95'}`} onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 sm:hidden shrink-0" />
                        <div className="flex justify-between items-center px-6 sm:px-8 py-5 sm:py-6 border-b border-white/5 shrink-0">
                            <div>
                                <h2 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-1">{editingId ? 'Edit Article' : 'New Article'}</h2>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider leading-none">Draft Publication</h3>
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6 space-y-6 custom-scrollbar pb-32 sm:pb-8">
                            <form id="articleForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-gray-400 uppercase tracking-widest font-black ml-1">Article Title</label>
                                    <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Modern Minimalist Living" className="w-full h-[52px] bg-[#1a1a1a] border border-transparent focus:bg-[#222] focus:border-[#D4AF37] rounded-xl px-4 text-white text-[15px] outline-none transition-all placeholder:text-gray-600" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-gray-400 uppercase tracking-widest font-black ml-1">Author Name</label>
                                        <input required name="author" value={formData.author} onChange={handleChange} placeholder="Your name or brand" className="w-full h-[52px] bg-[#1a1a1a] border border-transparent focus:bg-[#222] focus:border-[#D4AF37] rounded-xl px-4 text-white text-[15px] outline-none transition-all placeholder:text-gray-600" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-gray-400 uppercase tracking-widest font-black ml-1">Cover Image Source</label>
                                        <div className="flex gap-2">
                                            <input required name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://unsplash.com/..." className="flex-1 h-[52px] bg-[#1a1a1a] border border-transparent focus:bg-[#222] focus:border-[#D4AF37] rounded-xl px-4 text-white text-[15px] outline-none transition-all placeholder:text-gray-600" />
                                            <label className={`cursor-pointer bg-[#1a1a1a] border border-white/5 text-gray-400 hover:text-white w-[52px] h-[52px] flex items-center justify-center rounded-xl transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <Upload size={18} />
                                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-gray-400 uppercase tracking-widest font-black ml-1">Short Excerpt</label>
                                    <input required name="excerpt" value={formData.excerpt} onChange={handleChange} placeholder="One sentence summary for previews..." className="w-full h-[52px] bg-[#1a1a1a] border border-transparent focus:bg-[#222] focus:border-[#D4AF37] rounded-xl px-4 text-white text-[15px] outline-none transition-all placeholder:text-gray-600" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] text-gray-400 uppercase tracking-widest font-black ml-1">Main Content</label>
                                    <textarea required name="content" value={formData.content} onChange={handleChange} rows="8" placeholder="Share your insights and tips..." className="w-full bg-[#1a1a1a] border border-transparent focus:bg-[#222] focus:border-[#D4AF37] rounded-xl px-4 py-4 text-white text-[15px] outline-none transition-all resize-none placeholder:text-gray-600 custom-scrollbar"></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="absolute sm:static bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-white/5 bg-[#0d0d0d]/95 backdrop-blur-md shrink-0 z-20">
                            <div className="flex gap-3">
                                <button type="button" onClick={() => { setIsAnimating(false); setTimeout(() => setShowModal(false), 300); }} className="flex-1 h-[56px] rounded-xl text-gray-300 bg-[#1a1a1a] active:bg-[#222] transition-colors uppercase tracking-widest text-xs font-black">Cancel</button>
                                <button type="submit" form="articleForm" className="flex-[2] h-[56px] bg-[#D4AF37] text-black rounded-xl font-black active:scale-95 transition-transform uppercase tracking-widest text-xs shadow-[0_4px_14px_0_rgba(212,175,55,0.3)]">Publish Article</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Delete Confirmation */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setDeleteConfirmId(null)}>
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-[2rem] p-6 text-center animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 shadow-2xl border border-white/5 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 relative z-10">
                            <Trash2 size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 relative z-10 tracking-wide uppercase">Archieve Article?</h3>
                        <p className="text-[13px] text-gray-400 mb-8 leading-relaxed relative z-10">This piece of literature will be permanently removed from the Knowledge Base.</p>
                        <div className="flex flex-col gap-3 relative z-10">
                            <button onClick={handleDelete} className="w-full h-14 rounded-xl bg-red-500/20 text-red-500 font-black tracking-widest text-[11px] uppercase active:scale-95 transition-transform border border-red-500/30 hover:bg-red-500 hover:text-white">Delete</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="w-full h-14 rounded-xl bg-white/5 text-white font-black tracking-widest text-[11px] uppercase active:scale-95 transition-transform border border-white/5">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminKnowledge;
