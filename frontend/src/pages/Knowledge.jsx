import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axiosInstance';
import { BookOpen, Layers, Sofa, Frame, Paintbrush, Ruler, Search, X, ChevronRight } from 'lucide-react';

// Static curated furniture knowledge
const STATIC_ARTICLES = [
    {
        _id: 's1',
        icon: Layers,
        category: 'Materials',
        title: 'Understanding Wood Types in Furniture',
        excerpt: 'The choice of wood significantly impacts durability, aesthetics, and cost. Solid hardwoods like teak, sheesham, and oak offer superior longevity, while engineered woods like MDF and plywood provide cost-effective solutions with consistent quality.',
        content: `Wood is the foundation of premium furniture. Here's what you need to know:

SOLID HARDWOODS
• Teak – Highly resistant to moisture and termites. Ideal for Ahmedabad's climate. Develops a beautiful patina over time.
• Sheesham (Indian Rosewood) – Rich grain, extremely durable. Popular for bedroom and dining furniture.
• Oak – Straight grain, great for contemporary styles. Works well with both light and dark finishes.
• Walnut – Deep, chocolatey tones. Premium choice for executive furniture and statement pieces.

ENGINEERED WOODS
• Plywood (BWR Grade) – Boiling Water Resistant. Best choice for kitchen cabinets and wet areas.
• MDF (Medium Density Fibreboard) – Smooth surface, ideal for painted finishes and intricate routing.
• Particle Board – Budget option, not suitable for load-bearing applications or moisture-prone areas.

PRO TIP
Always ask for the wood species and grade certification. At R.K. Interior Solution, we use only ISI-certified plywood and FSC-sourced solid wood for all our projects.`,
    },
    {
        _id: 's2',
        icon: Frame,
        category: 'Finishes',
        title: 'Laminates vs PU Paint vs Veneer',
        excerpt: 'The finish you choose defines the character of your furniture. Laminates offer durability at scale, PU paint delivers a flawless lacquer-like appearance, while veneers bring natural wood grain to engineered substrates.',
        content: `Choosing the right finish is as important as choosing the right wood.

LAMINATES
• Available in thousands of textures and colors (matte, gloss, woodgrain, marble, fabric-look).
• Extremely scratch-resistant and easy to maintain.
• Best for: Kitchen shutters, wardrobes, office furniture.
• Leading brands: Merino, Greenlam, Century.

PU (POLYURETHANE) PAINT
• Sprayed in multiple coats for a glassy, premium finish.
• Can be done in any RAL color — ideal for customized luxury interiors.
• Requires skilled labor and a dust-free environment.
• Best for: Bed frames, TV panels, high-end living room furniture.

VENEER
• Real wood slices (0.5mm) glued onto engineered substrates.
• Provides the look and feel of solid wood at a fraction of the cost.
• Available in teak, walnut, oak, wenge, and more.
• Best for: Premium wardrobes, wall paneling, executive desks.

GLASS & ACRYLIC
• High-gloss acrylic gives a mirror-like finish.
• Lacquered glass is easy to clean and very contemporary.
• Best for: Kitchen shutters, wardrobe shutters, feature panels.`,
    },
    {
        _id: 's3',
        icon: Sofa,
        category: 'Upholstery',
        title: 'Sofa Fabrics & Upholstery Guide',
        excerpt: 'From full-grain leather to performance fabrics, the right upholstery protects your investment and defines comfort. Understanding thread count, abrasion resistance (Martindale rating), and cleanability is key to selecting the perfect sofa fabric.',
        content: `Upholstery is the most touched surface in your home — choose wisely.

FABRIC TYPES
• Cotton & Linen – Breathable and natural. Best for cooler climates. Can stain easily.
• Velvet – Luxurious feel, reflects light beautifully. Requires regular brushing.
• Microfiber – Highly durable, stain-resistant. Great for families with children.
• Polyester Blends – Budget-friendly, wide variety of textures and colors.

LEATHER
• Full-Grain Leather – Top quality. Shows natural markings, develops character over time.
• Top-Grain Leather – Sanded smooth, more uniform look. Still premium.
• Bonded/PU Leather – Budget option. Peels over time in humid climates — not recommended.

MARTINDALE RATING (Abrasion Resistance)
• Less than 15,000 – Decorative use only
• 15,000–25,000 – Light residential use
• 25,000–40,000 – Heavy residential use (recommended for sofas)
• 40,000+ – Commercial grade

CLEANING GUIDE
• 'W' code: Water-based cleaning
• 'S' code: Solvent-based cleaning only
• 'WS' code: Either method works
• 'X' code: Vacuum only, no liquids`,
    },
    {
        _id: 's4',
        icon: Paintbrush,
        category: 'Aluminium',
        title: 'Aluminium Profiles in Modern Interiors',
        excerpt: 'Aluminium section work has revolutionized contemporary interiors. Powder-coated and anodized profiles offer a sleek, maintenance-free alternative to wood for partitions, sliding doors, wardrobes, and window frames.',
        content: `Aluminium is the material of choice for modern, minimal interiors.

TYPES OF ALUMINIUM PROFILES
• Powder-Coated – Paint is electrostatically applied and cured. Available in any RAL color. Scratch and UV resistant.
• Anodized – Electrochemical process that thickens the oxide layer. Gives a metallic, brushed finish. More durable than paint.
• Wooden Finish / Wood-Effect Foil – Aluminium with a PVC wood-grain laminate. Combines the strength of aluminium with wood aesthetics.

COMMON APPLICATIONS
• Sliding wardrobe frames and partitions
• Window and door frames (UPVC vs Aluminium)
• Glass partitions in offices and bathrooms
• False ceiling grid systems
• Staircase railings and balusters
• Kitchen cabinet frames (handleless profile systems)

GLASS OPTIONS FOR ALUMINIUM FRAMES
• Clear Tempered Glass – Maximum transparency, safety-compliant.
• Frosted / Sandblasted Glass – Privacy with light transmission.
• Tinted Glass (Bronze, Grey, Blue) – Reduces heat and glare.
• Back-painted Glass (Lacquered) – Used as kitchen splashbacks and feature panels.
• Fluted / Ribbed Glass – Textured for a designer look, currently trending.

THICKNESS GUIDE
• 4mm – Internal partitions, small panels
• 6mm – Larger panels, sliding doors
• 8–12mm – Heavy structural glass, shower enclosures`,
    },
    {
        _id: 's5',
        icon: Ruler,
        category: 'Planning',
        title: 'How to Plan a Turnkey Interior Project',
        excerpt: 'A successful turnkey interior project requires careful planning across three phases: Design & BOQ, Execution, and Handover. Understanding the timeline, material procurement cycle, and on-site coordination prevents costly delays.',
        content: `Planning a complete interior fit-out the right way.

PHASE 1 — DESIGN & BOQ (2–4 Weeks)
• Site measurement and civil work assessment
• 2D layout planning and furniture placement
• Material selection: Wood, laminate, hardware, fabric
• BOQ (Bill of Quantities) preparation and cost estimation
• 3D visualization (optional but recommended for large projects)

PHASE 2 — EXECUTION (4–10 Weeks typical)
• Civil work: Plastering, flooring prep, false ceiling framing
• Electrical first-fix: Conduit, wiring, switchboard positions
• Carpentry: Modular kitchen, wardrobes, beds, TV units
• Aluminium & glass work: Partitions, doors, windows
• Painting and wallpaper
• Electrical second-fix: Lights, sockets, switches
• Upholstery: Sofas, curtain installation, bed sheets

PHASE 3 — HANDOVER (1–2 Days)
• Site cleaning and snagging list
• Quality check on all hardware (soft-close hinges, channels)
• Touch-up painting
• Final walkthrough with client
• Warranty documentation handover

COMMON MISTAKES TO AVOID
✗ Skipping proper waterproofing under flooring
✗ Choosing hardware based on price alone
✗ Not accounting for electrical load before design
✗ Finalizing designs after material procurement begins`,
    },
    {
        _id: 's6',
        icon: BookOpen,
        category: 'Hardware',
        title: 'Furniture Hardware: Hinges, Channels & Handles',
        excerpt: 'Premium hardware is what separates lasting furniture from furniture that fails within years. Soft-close mechanisms, full-extension drawer channels, and concealed hinges define the quality benchmark for modern modular furniture.',
        content: `Hardware is the unsung hero of great furniture.

HINGES
• Concealed (Clip-top) Hinges – Invisible when cabinet is closed. Adjustable in 3 directions. Standard in all modern cabinets.
• Soft-Close Hinges – Damper mechanism prevents slamming. Essential for kitchen and bedroom shutters.
• 170° Hinges – Opens wide for corner units and appliance sections.
• Flap-Up Hinges (Aventos) – For overhead shutters in kitchens. Gas lift mechanism.

DRAWER CHANNELS
• Basic Ball-Bearing Channel – Budget option, suitable for light loads.
• Full-Extension Channel – Drawer pulls out completely for full access.
• Soft-Close Channel – Built-in damper for silent, smooth closing.
• Push-to-Open (Tip-on) – No handle required for handleless design.
• Undermount Channel (Tandem) – Completely concealed under drawer. Premium look.

TOP HARDWARE BRANDS
• Hettich (Germany) – Industry standard for hinges and channels
• Hafele (Germany) – Full range of architectural and furniture hardware
• Ebco (India) – Excellent value for money, wide distribution
• Blum (Austria) – Premium soft-close systems (Tandem, Movento, Legrabox)

HANDLE STYLES
• Profile Handle (Integrated) – Recessed groove in shutter. Most modern look.
• Bar Handle (G/U-shape) – Classic and durable. Easy to grip.
• Knob – Traditional look, works with vintage and classic styles.
• Push-to-Open – Completely handleless, requires soft-close hardware.`,
    },
];

const Knowledge = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const { data } = await api.get('/knowledge');
                // Merge static + dynamic, dynamic articles shown after static
                setArticles(data);
            } catch (error) {
                console.error('Error fetching articles', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    const openModal = (article) => {
        setSelectedArticle(article);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedArticle(null);
        document.body.style.overflow = '';
    };

    // Merge static articles + fetched dynamic articles
    const allArticles = [...STATIC_ARTICLES, ...articles];

    // Get unique categories
    const categories = ['All', ...Array.from(new Set(
        allArticles.map(a => a.category).filter(Boolean)
    ))];

    const filtered = activeCategory === 'All'
        ? allArticles
        : allArticles.filter(a => a.category === activeCategory);

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-14">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#D4AF37] mb-4"
                    >
                        Expert Insights
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-serif text-white mb-5"
                    >
                        Furniture{' '}
                        <span className="italic text-[#D4AF37]">Knowledge</span>
                    </motion.h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 64 }}
                        transition={{ duration: 1, delay: 0.25 }}
                        className="h-[1px] bg-[#D4AF37] mx-auto mb-5"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="text-gray-400 max-w-xl mx-auto font-light leading-relaxed text-sm sm:text-base"
                    >
                        In-depth guides on materials, finishes, hardware, and planning — curated by our 20+ years of interior expertise.
                    </motion.p>
                </div>

                {/* Category filter */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 }}
                    className="flex flex-wrap justify-center gap-2 mb-12"
                >
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold transition-all duration-300 border ${
                                activeCategory === cat
                                    ? 'bg-[#D4AF37] text-[#0a0a0a] border-[#D4AF37]'
                                    : 'bg-transparent text-gray-400 border-white/10 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </motion.div>

                {/* Articles Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filtered.map((article, index) => {
                            const Icon = article.icon || BookOpen;
                            return (
                                <motion.div
                                    key={article._id}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                                    onClick={() => openModal(article)}
                                    className="group relative bg-[#111] border border-[#1e1e1e] hover:border-[#D4AF37]/40 cursor-pointer transition-all duration-500 hover:shadow-[0_12px_40px_rgba(212,175,55,0.08)] hover:-translate-y-0.5 p-6 sm:p-7 flex flex-col gap-4"
                                >
                                    {/* Corner accent */}
                                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[18px] border-l-transparent border-t-[18px] border-t-[#D4AF37]/15 group-hover:border-t-[#D4AF37]/40 transition-all duration-500" />

                                    {/* Category + Icon row */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full">
                                            {article.category || 'General'}
                                        </span>
                                        <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/8 flex items-center justify-center border border-[#D4AF37]/15 group-hover:border-[#D4AF37]/40 group-hover:bg-[#D4AF37]/15 transition-all duration-500">
                                            <Icon size={16} className="text-[#D4AF37]" strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    {/* Gold divider */}
                                    <div className="w-6 h-[1px] bg-[#D4AF37]/30 group-hover:w-10 group-hover:bg-[#D4AF37]/60 transition-all duration-500" />

                                    {/* Title */}
                                    <h3 className="text-white font-semibold text-base sm:text-lg leading-snug tracking-normal group-hover:text-[#D4AF37] transition-colors duration-400">
                                        {article.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="text-gray-500 text-[12px] sm:text-[13px] font-light leading-relaxed line-clamp-3 flex-grow group-hover:text-gray-400 transition-colors duration-300">
                                        {article.excerpt || (article.content && article.content.substring(0, 120) + '…')}
                                    </p>

                                    {/* Read more */}
                                    <div className="pt-3 border-t border-white/5 group-hover:border-[#D4AF37]/20 flex items-center justify-between transition-colors duration-300">
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">Read Guide</span>
                                        <div className="w-6 h-6 rounded-full border border-[#D4AF37]/30 flex items-center justify-center group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37] transition-all duration-300">
                                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                                <path d="M2 10L10 2M10 2H4M10 2V8" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Article Modal */}
            <AnimatePresence>
                {selectedArticle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-6"
                        onClick={closeModal}
                        data-lenis-prevent
                    >
                        <motion.div
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 60, opacity: 0 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                            className="bg-[#0f0f0f] w-full sm:max-w-2xl rounded-t-[2rem] sm:rounded-[1.5rem] border border-white/8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Drag handle (mobile) */}
                            <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-white/5 shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full">
                                        {selectedArticle.category || 'Guide'}
                                    </span>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="w-8 h-8 rounded-full bg-white/5 border border-white/8 flex items-center justify-center hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all duration-300"
                                >
                                    <X size={15} className="text-white" />
                                </button>
                            </div>

                            {/* Scrollable content */}
                            <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-6">
                                {/* Title */}
                                <h2 className="text-white font-serif text-2xl sm:text-3xl leading-snug mb-3">
                                    {selectedArticle.title}
                                </h2>
                                <div className="w-10 h-[1px] bg-[#D4AF37] mb-5" />

                                {/* Excerpt summary */}
                                {selectedArticle.excerpt && (
                                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-light italic border-l-2 border-[#D4AF37]/40 pl-4 mb-6">
                                        {selectedArticle.excerpt}
                                    </p>
                                )}

                                {/* Full content */}
                                <div className="text-gray-300 text-sm sm:text-[15px] leading-[1.85] font-light whitespace-pre-line">
                                    {selectedArticle.content || selectedArticle.excerpt || 'No content available.'}
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-white/5">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 text-center">
                                    R.K. Interior Solution · 20+ Years of Expertise
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Knowledge;
