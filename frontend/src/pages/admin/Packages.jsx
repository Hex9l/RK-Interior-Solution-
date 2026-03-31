import { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { Plus, Package, CheckCircle2, IndianRupee, Edit2, Trash2 } from 'lucide-react';

const AdminPackages = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        designConsultation: true,
        installation: true
    });

    // For bottom sheet animation
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        fetchPackages();
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

    const fetchPackages = async () => {
        try {
            const { data } = await api.get('/packages');
            setPackages(data);
        } catch (error) {
            toast.error('Failed to fetch packages');
        } finally {
            setLoading(false);
        }
    };

    const formatIndianNumber = (num) => {
        if (num === null || num === undefined || num === '') return '';
        const value = num.toString().replace(/,/g, '');
        const number = Number(value);
        if (isNaN(number)) return value;
        return number.toLocaleString('en-IN');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'price') {
            // Remove commas to get raw number, then format for display
            const rawValue = value.replace(/,/g, '');
            if (!isNaN(rawValue) || rawValue === '') {
                setFormData({
                    ...formData,
                    price: formatIndianNumber(rawValue)
                });
            }
            return;
        }

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            name: '', price: '', description: '',
            designConsultation: true, installation: true
        });
        setShowModal(true);
    };

    const openEditModal = (pkg) => {
        setEditingId(pkg._id);
        setFormData({
            name: pkg.name,
            price: formatIndianNumber(pkg.price),
            description: pkg.description || '',
            designConsultation: pkg.designConsultation,
            installation: pkg.installation
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setIsAnimating(false);
        setTimeout(() => setShowModal(false), 300); // Wait for slide down animation
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Strip commas for the payload
        const payload = { 
            ...formData, 
            price: Number(formData.price.toString().replace(/,/g, '')),
            features: [], 
            materials: [] 
        };

        try {
            if (editingId) {
                await api.put(`/packages/${editingId}`, payload);
                toast.success('Package updated');
            } else {
                await api.post('/packages', payload);
                toast.success('Package created');
            }
            closeModal();
            fetchPackages();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await api.delete(`/packages/${deleteConfirmId}`);
            toast.success('Package deleted');
            fetchPackages();
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const formatDescription = (description) => {
        if (!description) return [];
        return description.split(/[|\n]/).map(item => item.trim()).filter(item => item !== '');
    };

    return (
        <div className="min-h-screen pb-24 sm:pb-12 bg-[#0a0a0a]">
            {/* App-like Header: Relative on mobile to avoid double-sticky clutter, Sticky on desktop */}
            <div className="relative lg:sticky lg:top-0 z-[30] bg-[#0a0a0a] lg:bg-[#0a0a0a]/90 lg:backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 sm:py-6 mb-4 sm:mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">Packages</h1>
                        <p className="text-[#D4AF37] text-[10px] sm:text-xs font-semibold tracking-widest uppercase mt-1">Manage Offerings</p>
                    </div>
                    <button 
                        onClick={openAddModal} 
                        className="flex items-center justify-center gap-2 bg-[#D4AF37] text-black w-11 h-11 sm:w-auto sm:h-auto sm:px-6 sm:py-3.5 rounded-full sm:rounded-xl font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                        aria-label="Add Package"
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
                            <Package size={24} className="text-[#D4AF37] opacity-60" />
                        </div>
                        <p className="text-gray-500 text-xs tracking-[0.2em] font-medium uppercase">Loading Data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                        {packages.map((pkg) => (
                            <div 
                                key={pkg._id} 
                                className="group relative bg-[#121212] rounded-[1.5rem] p-1 overflow-hidden transition-transform duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-white/[0.02]"
                            >
                                {/* Subtle inner gradient for premium feel */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-[1.5rem]" />
                                
                                <div className="bg-[#121212] rounded-[1.25rem] h-full flex flex-col relative z-10">
                                    <div className="p-5 sm:p-6 flex-1">
                                        <div className="flex justify-between items-start mb-5 gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider leading-tight mb-3">
                                                    {pkg.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {pkg.designConsultation && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#1a1a1a] text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                                                            <CheckCircle2 size={10} className="mr-1" /> Config
                                                        </span>
                                                    )}
                                                    {pkg.installation && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#1a1a1a] text-[10px] text-green-400 font-semibold uppercase tracking-wider">
                                                            <CheckCircle2 size={10} className="mr-1" /> Install
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 bg-[#0a0a0a] px-3 py-2 rounded-xl border border-white/5">
                                                <div className="flex items-center justify-end text-[#D4AF37] text-lg sm:text-xl font-black tracking-tight">
                                                    <IndianRupee size={16} className="mr-0.5" />
                                                    {Number(pkg.price).toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="h-[1px] w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                                            <ul className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-1 relative">
                                                {formatDescription(pkg.description).map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/20 shrink-0 group-hover:bg-[#D4AF37] transition-colors duration-300" />
                                                        <span className="text-[13px] text-gray-400 leading-snug font-medium">{item}</span>
                                                    </li>
                                                ))}
                                                {formatDescription(pkg.description).length === 0 && (
                                                    <p className="text-gray-600 text-xs italic">No additional details configured.</p>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* App-like Action Bar inside card */}
                                    <div className="flex items-center border-t border-white/5 p-2 gap-2 bg-[#0d0d0d] rounded-b-[1.25rem]">
                                        <button 
                                            onClick={() => openEditModal(pkg)} 
                                            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold text-white bg-white/5 active:scale-95 transition-all uppercase tracking-wider"
                                        >
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <div className="w-[1px] h-6 bg-white/10" />
                                        <button 
                                            onClick={() => setDeleteConfirmId(pkg._id)} 
                                            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-bold text-red-400 bg-red-500/5 active:scale-95 transition-all uppercase tracking-wider"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {!loading && packages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111] rounded-[2rem] border border-white/5">
                        <div className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-6">
                            <Package size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-widest uppercase mb-2">No Packages</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8">Tap the button above to create your first service offering.</p>
                        <button 
                            onClick={openAddModal} 
                            className="bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-transform"
                        >
                            Create First Package
                        </button>
                    </div>
                )}
            </div>

            {/* App-like Modal (Bottom Sheet on Mobile, Centered on Desktop) */}
            {showModal && (
                <div 
                    className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`} 
                    data-lenis-prevent
                >
                    <div 
                        className={`bg-[#0d0d0d] w-full sm:max-w-3xl sm:border sm:border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col h-[92vh] sm:h-auto sm:max-h-[90vh] transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${isAnimating ? 'translate-y-0 sm:scale-100' : 'translate-y-full sm:translate-y-0 sm:scale-95'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Mobile Pull Indicator */}
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 sm:hidden shrink-0" />

                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 sm:px-8 py-5 sm:py-6 border-b border-white/5 shrink-0">
                            <div>
                                <h2 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-1">
                                    {editingId ? 'Edit Configuration' : 'New Configuration'}
                                </h2>
                                <h3 className="text-xl font-black text-white uppercase tracking-wider leading-none">Service Package</h3>
                            </div>
                        </div>

                        {/* Scrollable Form Body with exact sizing */}
                        <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6 custom-scrollbar pb-32 sm:pb-6 relative z-0">
                            <form id="packageForm" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold ml-1">Package Name</label>
                                        <input 
                                            required 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            placeholder="Standard 2BHK" 
                                            className="w-full h-[52px] bg-[#1a1a1a] border border-transparent focus:bg-[#222] focus:border-[#D4AF37] rounded-xl px-4 text-white text-[15px] outline-none transition-all duration-300 placeholder:text-gray-600" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold ml-1">Price (₹)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">
                                                <IndianRupee size={16} />
                                            </div>
                                            <input 
                                                required 
                                                name="price" 
                                                type="text"
                                                value={formData.price} 
                                                onChange={handleChange} 
                                                placeholder="9,00,000" 
                                                className="w-full h-[52px] bg-[#1a1a1a] border border-transparent focus:bg-[#222] focus:border-[#D4AF37] rounded-xl pl-10 pr-4 text-white text-[15px] outline-none transition-all duration-300 placeholder:text-gray-600 font-mono" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 focus-within:z-10 relative">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold ml-1">Details & Features</label>
                                        <span className="text-[10px] text-gray-600 hidden sm:inline">Use '|' or New Lines</span>
                                    </div>
                                    <textarea 
                                        required 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        placeholder="Enter package inclusions...&#10;e.g., False Ceiling | Modular Kitchen | Wardrobes" 
                                        className="w-full bg-[#1a1a1a] border border-transparent focus:bg-[#222] focus:border-[#D4AF37] rounded-xl px-4 py-4 text-white text-[15px] leading-relaxed outline-none transition-all duration-300 resize-none placeholder:text-gray-600 min-h-[250px] sm:min-h-[300px]"
                                    ></textarea>
                                    <p className="text-[10px] text-gray-600 sm:hidden mt-2 ml-1 text-center">Tip: Press Enter to create a new list item</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <label className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl cursor-pointer active:scale-95 transition-transform min-h-[56px]">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${formData.designConsultation ? 'bg-[#D4AF37]' : 'bg-[#333]'}`}>
                                            {formData.designConsultation && <CheckCircle2 size={16} className="text-black" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            name="designConsultation" 
                                            checked={formData.designConsultation} 
                                            onChange={handleChange} 
                                            className="hidden" 
                                        />
                                        <span className="text-[14px] font-medium text-white tracking-wide">Design Consultation</span>
                                    </label>
                                    <label className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-xl cursor-pointer active:scale-95 transition-transform min-h-[56px]">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${formData.installation ? 'bg-[#D4AF37]' : 'bg-[#333]'}`}>
                                            {formData.installation && <CheckCircle2 size={16} className="text-black" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            name="installation" 
                                            checked={formData.installation} 
                                            onChange={handleChange} 
                                            className="hidden" 
                                        />
                                        <span className="text-[14px] font-medium text-white tracking-wide">Included Installation</span>
                                    </label>
                                </div>
                            </form>
                        </div>

                        {/* Sticky Bottom Action Bar with gradient fade */}
                        <div className="absolute sm:static bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-white/5 bg-[#0d0d0d]/95 backdrop-blur-md shrink-0 z-20">
                            <div className="absolute bottom-full left-0 right-0 h-6 bg-gradient-to-t from-[#0d0d0d]/95 to-transparent sm:hidden pointer-events-none" />
                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    className="flex-[0.4] sm:flex-1 h-[56px] rounded-xl text-gray-300 bg-[#1a1a1a] active:bg-[#222] transition-colors uppercase tracking-widest text-xs font-bold shrink-0"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    form="packageForm" 
                                    className="flex-1 h-[56px] bg-[#D4AF37] text-black rounded-xl font-bold active:scale-95 transition-transform uppercase tracking-widest text-xs shadow-[0_4px_14px_0_rgba(212,175,55,0.39)]"
                                >
                                    {editingId ? 'Save Changes' : 'Create Package'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Native-feeling Action Alert (Delete) */}
            {deleteConfirmId && (
                <div 
                    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" 
                    onClick={() => setDeleteConfirmId(null)}
                >
                    <div className="bg-[#1c1c1e] w-full max-w-sm rounded-[2rem] p-6 text-center animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 shadow-2xl border border-white/5 relative overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
                        
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20 relative z-10">
                            <Trash2 size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 relative z-10 tracking-wide">Delete Package?</h3>
                        <p className="text-[13px] text-gray-400 mb-8 leading-relaxed relative z-10">This package will be permanently removed. This action cannot be undone.</p>
                        
                        <div className="flex flex-col gap-3 relative z-10">
                            <button 
                                onClick={handleDelete} 
                                className="w-full h-14 rounded-xl bg-red-500/20 text-red-500 font-bold tracking-wide active:scale-95 transition-transform border border-red-500/30 hover:bg-red-500 hover:text-white"
                            >
                                Delete
                            </button>
                            <button 
                                onClick={() => setDeleteConfirmId(null)} 
                                className="w-full h-14 rounded-xl bg-white/5 text-white font-semibold tracking-wide active:scale-95 transition-transform border border-white/5 hover:bg-white/10"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPackages;
