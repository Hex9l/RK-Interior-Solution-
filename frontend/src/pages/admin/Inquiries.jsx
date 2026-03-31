import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { Edit2, Trash2, Plus, X, Eye } from 'lucide-react';

const AdminInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);


    useEffect(() => {
        fetchInquiries();
    }, []);

    useEffect(() => {
        if (selectedInquiry) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            document.body.style.overflow = '';
            setIsAnimating(false);
        }
        return () => { document.body.style.overflow = ''; };
    }, [selectedInquiry]);

    const fetchInquiries = async () => {
        try {
            const { data } = await api.get('/inquiries');
            setInquiries(data);
        } catch (error) {
            toast.error('Failed to fetch inquiries');
        } finally {
            setLoading(false);
        }
    };

    const handleView = async (inquiry) => {
        setSelectedInquiry(inquiry);
        if (!inquiry.isRead) {
            try {
                await api.put(`/inquiries/${inquiry._id}`, { isRead: true });
                fetchInquiries();
            } catch (error) {
                console.error('Failed to mark as read', error);
            }
        }
    };

    const handleCloseModal = () => {
        setIsAnimating(false);
        setTimeout(() => setSelectedInquiry(null), 300);
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await api.delete(`/inquiries/${deleteConfirmId}`);
            toast.success('Inquiry deleted');
            fetchInquiries();
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
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">User Inquiries</h1>
                        <p className="text-[#D4AF37] text-[10px] sm:text-xs font-semibold tracking-widest uppercase mt-1">Lead Management</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-4">
                            <Plus size={24} className="text-[#D4AF37] opacity-60" />
                        </div>
                        <p className="text-gray-500 text-xs tracking-[0.2em] font-medium uppercase">Scanning Inbox...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                        {inquiries.map((inquiry) => (
                            <div key={inquiry._id} onClick={() => handleView(inquiry)} className={`group relative bg-[#121212] rounded-[1.5rem] p-1 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-2xl border ${inquiry.isRead ? 'border-white/[0.02]' : 'border-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]'}`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
                                <div className="bg-[#121212] rounded-[1.25rem] h-full flex flex-col relative z-10 overflow-hidden p-4 sm:p-6">
                                    <div className="flex justify-between items-start mb-4 sm:mb-6">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] font-black text-sm sm:text-lg">
                                            {inquiry.name.charAt(0).toUpperCase()}
                                        </div>
                                        {!inquiry.isRead && (
                                            <span className="bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]">NEW</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider mb-1 truncate">{inquiry.name}</h3>
                                        <p className="text-[9px] sm:text-[10px] text-[#D4AF37] font-black uppercase tracking-[0.1em] mb-3 sm:mb-4 truncate">{inquiry.service || 'General Inquiry'}</p>
                                        <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 leading-relaxed italic mb-4 sm:mb-6">"{inquiry.message}"</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-600 uppercase font-black">Received</span>
                                            <span className="text-[10px] text-gray-500 font-bold">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(inquiry._id); }} className="w-8 h-8 sm:w-10 sm:h-10 flex flex-shrink-0 items-center justify-center rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90">
                                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && inquiries.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-[#111] rounded-[2rem] border border-white/5 max-w-2xl mx-auto shadow-2xl">
                        <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6">
                            <Plus size={32} className="text-gray-700" />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-widest uppercase mb-2">Inbox is Pristine</h3>
                        <p className="text-sm text-gray-600 max-w-xs mx-auto">New inquiries from your website will appear here automatically.</p>
                    </div>
                )}
            </div>

            {/* Premium Detail Modal */}
            {selectedInquiry && (
                <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} onClick={handleCloseModal} data-lenis-prevent>
                    <div className={`bg-[#0d0d0d] w-full sm:max-w-xl sm:border sm:border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[75vh] sm:h-auto sm:max-h-[85vh] transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${isAnimating ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:translate-y-0 sm:scale-95'}`} onClick={e => e.stopPropagation()}>
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 sm:hidden shrink-0" />
                        
                        <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-black text-xl border border-[#D4AF37]/20">
                                    {selectedInquiry.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-1">Lead Details</h2>
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider leading-none">{selectedInquiry.name}</h3>
                                </div>
                            </div>
                            <button onClick={handleCloseModal} className="w-11 h-11 flex items-center justify-center rounded-full bg-[#1a1a1a] active:bg-[#222] transition-colors"><X size={20} className="text-gray-300" /></button>
                        </div>

                        <div className="overflow-y-auto flex-1 px-8 py-8 custom-scrollbar space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 group hover:border-[#D4AF37]/30 transition-colors">
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Email Channel</p>
                                    <a href={`mailto:${selectedInquiry.email}`} className="text-white text-sm font-bold block truncate tracking-wide">{selectedInquiry.email}</a>
                                </div>
                                <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 group hover:border-[#D4AF37]/30 transition-colors">
                                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Direct Contact</p>
                                    <a href={`tel:${selectedInquiry.phone}`} className="text-white text-sm font-bold block tracking-wide">{selectedInquiry.phone}</a>
                                </div>
                            </div>

                            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5 shadow-inner">
                                <p className="text-[10px] text-gray-500 uppercase font-black mb-4 flex items-center gap-2">
                                    <span className="w-4 h-[1px] bg-gray-700"></span>
                                    Inquiry Context
                                </p>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[11px] text-[#D4AF37] uppercase font-black mb-1">Service Required</p>
                                        <p className="text-white text-base font-bold tracking-wide uppercase">{selectedInquiry.service || 'General Consulting'}</p>
                                    </div>
                                    <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/[0.03]">
                                        <p className="text-[11px] text-[#D4AF37] uppercase font-black mb-2">Full Message</p>
                                        <p className="text-gray-400 text-sm leading-relaxed font-medium whitespace-pre-wrap">{selectedInquiry.message}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-2">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-600 uppercase font-black">Timestamp</span>
                                    <span className="text-xs text-gray-500 font-bold">{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                                </div>
                                <button onClick={() => { setDeleteConfirmId(selectedInquiry._id); handleCloseModal(); }} className="text-[11px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2 hover:text-red-400 transition-colors">
                                    <Trash2 size={14} /> Purge Record
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-8 bg-[#0d0d0d]/95 backdrop-blur-md shrink-0">
                            <button onClick={handleCloseModal} className="w-full h-14 bg-[#D4AF37] text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_10px_30px_rgba(212,175,55,0.2)] active:scale-95 transition-transform">Close Record</button>
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
                        <h3 className="text-xl font-black text-white mb-2 relative z-10 tracking-wide uppercase">Purge Lead?</h3>
                        <p className="text-[13px] text-gray-400 mb-8 leading-relaxed relative z-10">This inquiry data will be wiped from your records. This is permanent.</p>
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

export default AdminInquiries;
