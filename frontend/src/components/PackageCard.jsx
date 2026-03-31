import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import Tilt from 'react-parallax-tilt';

const PackageCard = ({ pkg, index }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <>
            <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01} transitionSpeed={2500} className="rounded-none h-full">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="bg-[#171717]/80 backdrop-blur-md rounded-none border border-[#262626] p-4 sm:p-7 shadow-2xl relative overflow-hidden group hover:border-[#D4AF37]/50 transition-all duration-700 hover:shadow-[0_20px_40px_rgba(212,175,55,0.05)] flex flex-col h-full"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/5 to-transparent rounded-bl-full -z-10 group-hover:from-[#D4AF37]/20 transition-all duration-700"></div>

                    <div className="flex-grow flex flex-col justify-center text-center space-y-3 sm:space-y-4">
                        <h3 className="text-lg sm:text-3xl font-serif italic text-white leading-tight px-1 uppercase tracking-wider sm:normal-case sm:tracking-normal">{pkg.name}</h3>
                        <div className="w-8 sm:w-12 h-[1px] bg-[#D4AF37]/50 mx-auto"></div>
                        <p className="text-[#D4AF37] text-xl sm:text-4xl font-light tracking-tight">₹{Number(pkg.price).toLocaleString('en-IN')}</p>
                    </div>

                    <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-[#262626] flex justify-center">
                        <button
                            onClick={() => setShowDetails(true)}
                            className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400 hover:text-[#D4AF37] uppercase tracking-[0.2em] transition-colors group/btn"
                        >
                            Details
                            <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </motion.div>
            </Tilt>

            {/* Details Modal */}
            <AnimatePresence>
                {showDetails && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md" data-lenis-prevent>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#111111] border border-[#262626] w-full max-w-2xl max-h-[90vh] flex flex-col relative shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-[#262626] shrink-0 bg-[#111111] z-10">
                                <div>
                                    <h3 className="text-xl sm:text-2xl font-serif italic text-white">{pkg.name}</h3>
                                    <p className="text-[#D4AF37] text-lg font-light mt-1">₹{Number(pkg.price).toLocaleString('en-IN')}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-gray-500 hover:text-white bg-[#1a1a1a] p-2 border border-[#333] transition-colors"
                                >
                                    <X size={20} className="font-light" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="overflow-y-auto p-5 sm:p-8 flex-grow custom-scrollbar">
                                <div className="mb-8">
                                    <h4 className="text-white font-medium mb-4 sm:mb-6 text-[10px] sm:text-xs uppercase tracking-[0.2em] relative inline-block">
                                        Package Details
                                        <span className="absolute -bottom-2 left-0 w-8 h-[1px] bg-[#D4AF37]"></span>
                                    </h4>
                                    <div className="text-gray-400 text-[13px] sm:text-[14px] font-light whitespace-pre-wrap leading-[1.8] columns-1 sm:columns-2 gap-x-8 sm:break-inside-avoid">
                                        {pkg.description || 'No specific details provided for this package.'}
                                    </div>
                                </div>

                                <div className="border-t border-[#262626] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 text-[10px] uppercase tracking-wider">
                                    <span className={pkg.designConsultation ? "text-green-500/80 flex items-center gap-2" : "text-gray-600 flex items-center gap-2"}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${pkg.designConsultation ? 'bg-green-500/80' : 'bg-gray-600'}`}></div>
                                        Design Consultation
                                    </span>
                                    <span className={pkg.installation ? "text-green-500/80 flex items-center gap-2" : "text-gray-600 flex items-center gap-2"}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${pkg.installation ? 'bg-green-500/80' : 'bg-gray-600'}`}></div>
                                        Installation
                                    </span>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 sm:p-6 border-t border-[#262626] shrink-0 bg-[#0d0d0d]">
                                <a href="https://wa.me/919825864812" target="_blank" rel="noreferrer" className="block w-full text-center bg-[#D4AF37] text-[#0a0a0a] hover:bg-white py-4 font-bold transition-all duration-300 uppercase tracking-widest text-xs">
                                    Inquire Now
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PackageCard;
