import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { Edit2, Trash2, Plus, X, Upload, Image, Video, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// State shape (keep it simple & flat):
//   mediaMode: 'none' | 'image' | 'video'
//   images: [{ url }]               ← only used in image mode
//   videoUrl: string | null          ← only used in video mode
//   coverUrl: string | null          ← only used in video mode (optional)
// ─────────────────────────────────────────────────────────────────────────────

const AdminWorks = () => {
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Clean, flat upload state
    const [mediaMode, setMediaMode] = useState('none');   // 'none' | 'image' | 'video'
    const [images, setImages] = useState([]);             // [{ url }]
    const [videoUrl, setVideoUrl] = useState(null);       // string | null
    const [coverUrl, setCoverUrl] = useState(null);       // string | null

    // Upload tracking
    const [uploading, setUploading] = useState(false);
    const [uploadTarget, setUploadTarget] = useState('');  // 'image' | 'cover' | 'video'
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadController, setUploadController] = useState(null);
    const progressTimerRef = React.useRef(null);

    // Track newly uploaded URLs so we can delete them if modal is cancelled
    const [newUrls, setNewUrls] = useState([]);

    // ─── Modal scroll lock ───────────────────────────────────────────────────
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

    // ─── Fetch ────────────────────────────────────────────────────────────────
    const fetchWorks = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/works');
            setWorks(data);
        } catch {
            toast.error('Failed to fetch works');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWorks(); }, []);

    // ─── Reset modal state ────────────────────────────────────────────────────
    const resetModal = () => {
        setEditingId(null);
        setMediaMode('none');
        setImages([]);
        setVideoUrl(null);
        setCoverUrl(null);
        setUploading(false);
        setUploadProgress(0);
        setUploadController(null);
        setNewUrls([]);
    };

    // ─── Open modals ──────────────────────────────────────────────────────────
    const openAddModal = () => {
        resetModal();
        setShowModal(true);
    };

    const openEditModal = (work) => {
        resetModal();
        setEditingId(work._id);

        // Reconstruct flat state from db media array
        const videoItem = work.media?.find(m => m.type === 'video' || m.url?.includes('/video/'));
        if (videoItem) {
            setMediaMode('video');
            setVideoUrl(videoItem.url);
            if (videoItem.coverUrl) setCoverUrl(videoItem.coverUrl);
        } else if (work.media?.length > 0) {
            setMediaMode('image');
            setImages(work.media.map(m => ({ url: m.url })));
        }

        setShowModal(true);
    };

    // ─── Close modal (with cleanup) ───────────────────────────────────────────
    const handleCloseModal = () => {
        // Abort any in-progress upload
        if (uploadController) {
            uploadController.abort();
        }
        // Delete any files uploaded this session (if we cancel, they're orphaned)
        newUrls.forEach(url => {
            api.delete('/upload', { data: { url } }).catch(() => { });
        });
        setIsAnimating(false);
        setTimeout(() => {
            setShowModal(false);
            resetModal();
        }, 300);
    };

    // ─── Simulated smooth progress (video only) ───────────────────────────────
    // Increments 1% at a time. Phase 1 (0→70): fast (upload to server).
    // Phase 2 (70→95): slow (Cloudinary processing). Stops at 95 until done.
    const startVideoProgress = () => {
        setUploadProgress(0);
        let current = 0;

        const tick = () => {
            current += 1;
            setUploadProgress(current);

            if (current >= 95) return; // hold at 95 until real response

            // Phase 1: 0–70 → ~40ms per % (2.8s total)
            // Phase 2: 70–95 → ~300ms per % (7.5s total)
            const delay = current < 70 ? 40 : 300;
            progressTimerRef.current = setTimeout(tick, delay);
        };

        progressTimerRef.current = setTimeout(tick, 40);
    };

    const stopVideoProgress = () => {
        if (progressTimerRef.current) {
            clearTimeout(progressTimerRef.current);
            progressTimerRef.current = null;
        }
    };

    // ─── Upload a file ────────────────────────────────────────────────────────
    const handleUpload = async (e, target) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = null; // reset input

        if (target === 'video' && file.size > 100 * 1024 * 1024) {
            return toast.error('Video must be under 100 MB');
        }

        const formData = new FormData();
        formData.append('media', file);

        const controller = new AbortController();
        setUploading(true);
        setUploadTarget(target);
        setUploadProgress(0);
        setUploadController(controller);

        // Start smooth simulated progress only for video
        if (target === 'video') {
            startVideoProgress();
        }

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                signal: controller.signal,
            });

            // Stop timer, jump to 100%
            if (target === 'video') {
                stopVideoProgress();
                setUploadProgress(100);
                await new Promise(r => setTimeout(r, 500));
            }

            const uploadedUrl = res.data.url;
            setNewUrls(prev => [...prev, uploadedUrl]);

            if (target === 'image') {
                setImages(prev => [...prev, { url: uploadedUrl }]);
            } else if (target === 'cover') {
                setCoverUrl(uploadedUrl);
            } else if (target === 'video') {
                setVideoUrl(uploadedUrl);
            }

            toast.success('Uploaded!');
        } catch (err) {
            stopVideoProgress();
            if (axios.isCancel(err) || err.name === 'CanceledError') {
                toast.info('Upload cancelled');
            } else {
                toast.error(err.response?.data?.message || 'Upload failed');
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
            setUploadController(null);
            setUploadTarget('');
        }
    };

    // ─── Remove an image from image mode ──────────────────────────────────────
    const removeImage = (index) => {
        const urlToRemove = images[index]?.url;
        if (!urlToRemove) return;
        if (newUrls.includes(urlToRemove) || !editingId) {
            api.delete('/upload', { data: { url: urlToRemove } }).catch(() => { });
        }
        setImages(prev => prev.filter((_, i) => i !== index));
        setNewUrls(prev => prev.filter(u => u !== urlToRemove));
    };

    // ─── Remove video ─────────────────────────────────────────────────────────
    const removeVideo = () => {
        if (videoUrl && (newUrls.includes(videoUrl) || !editingId)) {
            api.delete('/upload', { data: { url: videoUrl } }).catch(() => { });
        }
        setNewUrls(prev => prev.filter(u => u !== videoUrl));
        setVideoUrl(null);
    };

    // ─── Remove cover ─────────────────────────────────────────────────────────
    const removeCover = () => {
        if (coverUrl && (newUrls.includes(coverUrl) || !editingId)) {
            api.delete('/upload', { data: { url: coverUrl } }).catch(() => { });
        }
        setNewUrls(prev => prev.filter(u => u !== coverUrl));
        setCoverUrl(null);
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        let mediaPayload = [];

        if (mediaMode === 'image') {
            if (images.length === 0) return toast.error('Please upload at least one image');
            mediaPayload = images.map(img => ({ url: img.url, type: 'image' }));
        } else if (mediaMode === 'video') {
            if (!videoUrl) return toast.error('Please upload the project video');
            const videoEntry = { url: videoUrl, type: 'video' };
            if (coverUrl) videoEntry.coverUrl = coverUrl;
            mediaPayload = [videoEntry];
        } else {
            return toast.error('Please choose a media type first');
        }

        try {
            if (editingId) {
                await api.put(`/works/${editingId}`, { media: mediaPayload });
                toast.success('Work updated!');
            } else {
                await api.post('/works', { media: mediaPayload });
                toast.success('Work created!');
            }
            setShowModal(false);
            resetModal();
            fetchWorks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Save failed');
        }
    };

    // ─── Delete a work ────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await api.delete(`/works/${deleteConfirmId}`);
            toast.success('Work deleted');
            fetchWorks();
        } catch {
            toast.error('Delete failed');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen pb-24 sm:pb-12 bg-[#0a0a0a]">
            {/* Header */}
            <div className="relative lg:sticky lg:top-0 z-[30] bg-[#0a0a0a] lg:bg-[#0a0a0a]/90 lg:backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 sm:py-6 mb-4 sm:mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">Completed Works</h1>
                        <p className="text-[#D4AF37] text-[10px] sm:text-xs font-semibold tracking-widest uppercase mt-1">Manage Portfolio</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-2 bg-[#D4AF37] text-black w-11 h-11 sm:w-auto sm:h-auto sm:px-6 sm:py-3.5 rounded-full sm:rounded-xl font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    >
                        <Plus size={20} className="sm:mr-1" />
                        <span className="hidden sm:inline text-xs uppercase tracking-[0.1em]">Add New</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-4">
                            <Upload size={24} className="text-[#D4AF37] opacity-60" />
                        </div>
                        <p className="text-gray-500 text-xs tracking-[0.2em] font-medium uppercase">Loading Dashboard...</p>
                    </div>
                ) : (() => {
                    const imageWorks = works.filter(w => w.media?.[0]?.type !== 'video');
                    const videoWorks = works.filter(w => w.media?.[0]?.type === 'video');

                    const WorkCard = ({ work }) => (
                        <div className="group relative bg-[#121212] rounded-[1.5rem] p-1 overflow-hidden transition-transform duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/[0.02]">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-[1.5rem]" />
                            <div className="bg-[#121212] rounded-[1.25rem] h-full flex flex-col relative z-10 overflow-hidden">
                                <div className="h-48 sm:h-52 overflow-hidden relative group/media">
                                    {work.media && work.media.length > 0 ? (
                                        work.media[0].type === 'video' ? (
                                            work.media[0].coverUrl ? (
                                                <img src={work.media[0].coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" alt="Cover" />
                                            ) : (
                                                <video src={work.media[0].url} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" muted loop preload="metadata" onMouseEnter={e => e.target.play().catch(() => { })} onMouseLeave={e => e.target.pause()} />
                                            )
                                        ) : (
                                            <img src={work.media[0].url} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110" alt="" />
                                        )
                                    ) : (
                                        <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center text-gray-800"><Plus size={32} /></div>
                                    )}
                                </div>
                                <div className="p-1.5 sm:p-2 bg-[#0d0d0d] flex items-center gap-1.5 sm:gap-2">
                                    <button onClick={() => openEditModal(work)} className="flex-1 flex items-center justify-center gap-1.5 h-9 sm:h-11 rounded-xl text-xs font-bold text-white bg-white/5 active:scale-95 transition-all uppercase tracking-wider">
                                        <Edit2 size={14} />
                                        <span className="hidden sm:inline">Edit</span>
                                    </button>
                                    <div className="w-[1px] h-5 sm:h-6 bg-white/10" />
                                    <button onClick={() => setDeleteConfirmId(work._id)} className="flex-1 flex items-center justify-center gap-1.5 h-9 sm:h-11 rounded-xl text-xs font-bold text-red-400 bg-red-500/5 active:scale-95 transition-all uppercase tracking-wider">
                                        <Trash2 size={14} />
                                        <span className="hidden sm:inline">Remove</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );

                    return (
                        <div className="space-y-12">
                            {/* ── Image Works Section ─── */}
                            {imageWorks.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <Image size={16} className="text-[#D4AF37]" />
                                            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.25em]">Image Works</h2>
                                            <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-widest">
                                                {imageWorks.length}
                                            </span>
                                        </div>
                                        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D4AF37]/30 to-transparent" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                                        {imageWorks.map(work => <WorkCard key={work._id} work={work} />)}
                                    </div>
                                </div>
                            )}

                            {/* ── Video Works Section ─── */}
                            {videoWorks.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <Video size={16} className="text-[#D4AF37]" />
                                            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.25em]">Video Works</h2>
                                            <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-widest">
                                                {videoWorks.length}
                                            </span>
                                        </div>
                                        <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D4AF37]/30 to-transparent" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                                        {videoWorks.map(work => <WorkCard key={work._id} work={work} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {!loading && works.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111] rounded-[2rem] border border-white/5">
                        <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6">
                            <Plus size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-widest uppercase mb-2">No Works Portrayed</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8">Tap the button above to showcase your first project.</p>
                        <button onClick={openAddModal} className="bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform">Add Project</button>
                    </div>
                )}
            </div>

            {/* ─── Modal ────────────────────────────────────────────────────────── */}
            {showModal && (
                <div
                    className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
                    data-lenis-prevent
                >
                    <div
                        className={`bg-[#0d0d0d] w-full sm:max-w-2xl sm:border sm:border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh] transition-transform duration-300 ${isAnimating ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:translate-y-0 sm:scale-95'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drag handle on mobile */}
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 sm:hidden shrink-0" />

                        {/* Modal header */}
                        <div className="flex justify-between items-center px-6 sm:px-8 py-5 sm:py-6 border-b border-white/5 shrink-0">
                            <div>
                                <h2 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-1">{editingId ? 'Edit Showcase' : 'New Showcase'}</h2>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider leading-none">Completed Work</h3>
                            </div>
                        </div>

                        {/* Scrollable form body */}
                        <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6 custom-scrollbar">
                            <form id="workForm" onSubmit={handleSubmit} className="space-y-5">

                                {/* Step 1 — Choose type */}
                                {!editingId && (
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Step 1 — Choose Upload Type</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => { setMediaMode('image'); setVideoUrl(null); setCoverUrl(null); }}
                                                className={`flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border-2 transition-all duration-200 ${mediaMode === 'image' ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/5 bg-[#1a1a1a] text-gray-400 hover:border-white/20 hover:text-white'}`}
                                            >
                                                <Image size={22} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Image</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setMediaMode('video'); setImages([]); }}
                                                className={`flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border-2 transition-all duration-200 ${mediaMode === 'video' ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/5 bg-[#1a1a1a] text-gray-400 hover:border-white/20 hover:text-white'}`}
                                            >
                                                <Video size={22} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Video</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ── IMAGE MODE ───────────────────────────────────────────────────── */}
                                {mediaMode === 'image' && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                            {editingId ? 'Project Images' : 'Step 2 — Upload Images'}
                                        </p>
                                        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                                            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                                                <span className="text-[11px] text-gray-400 font-black tracking-widest uppercase">Project Images</span>
                                                <label className={`cursor-pointer bg-[#D4AF37] text-black px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all ${(uploading) ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    <Upload size={14} /> {uploading && uploadTarget === 'image' ? 'Uploading...' : 'Add Image'}
                                                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e, 'image')} disabled={uploading} />
                                                </label>
                                            </div>

                                            {/* Image upload indicator (no progress bar) */}
                                            {uploading && uploadTarget === 'image' && (
                                                <div className="mb-4 flex items-center gap-3 bg-[#0a0a0a] px-4 py-3 rounded-xl border border-white/5">
                                                    <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin shrink-0" />
                                                    <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest">Uploading image...</span>
                                                </div>
                                            )}

                                            {/* Image thumbnails */}
                                            {images.length > 0 ? (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                    {images.map((img, idx) => (
                                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/5 group bg-[#0a0a0a]">
                                                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                                                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-lg transition-all shadow-lg active:scale-90">
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-10 text-gray-600 border-2 border-dashed border-white/5 rounded-2xl">
                                                    <Image size={24} className="mx-auto mb-3 opacity-20" />
                                                    <p className="text-[10px] uppercase tracking-widest font-black">No images uploaded yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── VIDEO MODE ───────────────────────────────────────────────────── */}
                                {mediaMode === 'video' && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                                            {editingId ? 'Project Video & Cover' : 'Step 2 — Upload Video & Cover'}
                                        </p>

                                        {/* Rules box */}
                                        <div className="bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-2xl p-4 flex gap-3 items-start">
                                            <AlertCircle size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Video Upload Rules</p>
                                                <ul className="space-y-1">
                                                    {['Max file size: 100 MB', 'Supported: MP4, MOV, AVI, WEBM', 'Recommended: MP4 (H.264)', 'Best resolution: 1080p or below', 'Upload time: 30–90 sec on average Wi-Fi'].map((rule, i) => (
                                                        <li key={i} className="text-[10px] text-gray-400 flex gap-2 items-start">
                                                            <span className="text-[#D4AF37] font-black mt-px">·</span>
                                                            <span>{rule}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* ─ Cover Image ─ */}
                                        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                                            <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                                                <div className="min-w-0">
                                                    <span className="text-[11px] text-gray-400 font-black tracking-widest uppercase block">Cover Image</span>
                                                    <span className="text-[10px] text-gray-600 block mt-0.5">Thumbnail shown before video plays — Optional</span>
                                                </div>
                                                {!coverUrl && (
                                                    <label className={`cursor-pointer shrink-0 bg-white/10 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-all ${(uploading) ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <Image size={13} /> {uploading && uploadTarget === 'cover' ? 'Uploading...' : 'Add Cover'}
                                                        <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 'cover')} disabled={uploading} />
                                                    </label>
                                                )}
                                                {coverUrl && (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle size={14} className="text-green-400" />
                                                        <span className="text-[10px] text-green-400 font-black uppercase">Uploaded</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Cover upload indicator (no progress bar) */}
                                            {uploading && uploadTarget === 'cover' && (
                                                <div className="mb-4 flex items-center gap-3 bg-[#0a0a0a] px-4 py-3 rounded-xl border border-white/5">
                                                    <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin shrink-0" />
                                                    <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest">Uploading cover...</span>
                                                </div>
                                            )}

                                            {coverUrl ? (
                                                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/5 group">
                                                    <img src={coverUrl} className="w-full h-full object-cover" alt="Cover" />
                                                    <button type="button" onClick={removeCover} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-lg opacity-0 opacity-100 transition-all">
                                                        <X size={13} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                                                    <Image size={20} className="mx-auto mb-2 text-gray-700" />
                                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">No cover image</p>
                                                    <p className="text-[9px] text-gray-700 mt-1">Optional but recommended</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* ─ Project Video ─ */}
                                        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                                            <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                                                <div className="min-w-0">
                                                    <span className="text-[11px] text-gray-400 font-black tracking-widest uppercase block">Project Video</span>
                                                    <span className="text-[10px] text-gray-600 block mt-0.5">Max 100 MB · MP4 recommended</span>
                                                </div>
                                                {!videoUrl && (
                                                    <label className={`cursor-pointer shrink-0 bg-[#D4AF37] text-black px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                        <Video size={13} /> {uploading && uploadTarget === 'video' ? 'Uploading...' : 'Add Video'}
                                                        <input type="file" accept="video/*" className="hidden" onChange={e => handleUpload(e, 'video')} disabled={uploading} />
                                                    </label>
                                                )}
                                            </div>

                                            {/* Video upload progress — smooth 1% increments */}
                                            {uploading && uploadTarget === 'video' && (
                                                <div className="mb-4 bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                                                    {/* Header row */}
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest">
                                                            {uploadProgress >= 95 ? 'Processing on Cloudinary...' : uploadProgress >= 70 ? 'Sending to server...' : 'Uploading video...'}
                                                        </span>
                                                        <span className="text-sm text-white font-mono font-bold">{uploadProgress}%</span>
                                                    </div>
                                                    {/* Progress bar */}
                                                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mb-1">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#f5d76e] transition-all duration-200"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                    {/* Step indicators */}
                                                    <div className="flex justify-between mt-2 mb-3">
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${uploadProgress >= 1 ? 'text-[#D4AF37]' : 'text-gray-700'}`}>Upload</span>
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${uploadProgress >= 70 ? 'text-[#D4AF37]' : 'text-gray-700'}`}>Server</span>
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${uploadProgress >= 95 ? 'text-[#D4AF37]' : 'text-gray-700'}`}>Cloudinary</span>
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider ${uploadProgress >= 100 ? 'text-[#D4AF37]' : 'text-gray-700'}`}>Done</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => { uploadController?.abort(); stopVideoProgress(); }}
                                                        className="w-full h-10 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 active:scale-95 transition-all"
                                                    >
                                                        Cancel Upload
                                                    </button>
                                                </div>
                                            )}

                                            {videoUrl ? (
                                                <div className="relative w-full rounded-xl overflow-hidden border border-white/5 bg-black">
                                                    <video
                                                        src={videoUrl}
                                                        className="w-full max-h-56"
                                                        preload="metadata"
                                                        controls
                                                        style={{ display: 'block' }}
                                                    />
                                                    <div className="px-3 py-2.5 bg-[#0a0a0a] flex items-center justify-between border-t border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle size={14} className="text-green-400" />
                                                            <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Video Uploaded</span>
                                                        </div>
                                                        <button type="button" onClick={removeVideo} className="text-[10px] text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 font-bold uppercase active:scale-90 transition-all">
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-xl">
                                                    <Video size={24} className="mx-auto mb-3 text-gray-700" />
                                                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">No video uploaded</p>
                                                    <p className="text-[9px] text-gray-700 mt-1">Tap "Add Video" above to select a file</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* No mode placeholder */}
                                {mediaMode === 'none' && (
                                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                                        <Upload size={24} className="mx-auto mb-3 text-gray-700" />
                                        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-black">Choose a type above to begin</p>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer buttons */}
                        <div className="shrink-0 p-4 sm:p-6 border-t border-white/5 bg-[#0d0d0d]">
                            <div className="flex gap-3">
                                <button type="button" onClick={handleCloseModal} className="flex-1 h-[56px] rounded-xl text-gray-300 bg-[#1a1a1a] active:bg-[#222] transition-colors uppercase tracking-widest text-xs font-black">Cancel</button>
                                <button
                                    type="submit"
                                    form="workForm"
                                    disabled={uploading || mediaMode === 'none'}
                                    className="flex-[2] h-[56px] bg-[#D4AF37] text-black rounded-xl font-black active:scale-95 transition-transform uppercase tracking-widest text-xs shadow-[0_4px_14px_0_rgba(212,175,55,0.3)] disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    {uploading ? 'UPLOADING...' : 'SAVE PROJECT'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setDeleteConfirmId(null)}>
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-[2rem] p-6 text-center animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 shadow-2xl border border-white/5 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 relative z-10">
                            <Trash2 size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 relative z-10 tracking-wide uppercase">Delete Project?</h3>
                        <p className="text-[13px] text-gray-400 mb-8 leading-relaxed relative z-10">This project will be permanently removed from your portfolio.</p>
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

export default AdminWorks;
