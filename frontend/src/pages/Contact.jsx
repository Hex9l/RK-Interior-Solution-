import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, MessageCircle, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/inquiries', formData);
            toast.success('Your message has been sent successfully!');
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const contactItems = [
        { icon: MapPin, label: 'Location', value: 'Shop no.3, Padmavatinagar Society, canal Rd, Naroda, Ahmedabad, Gujarat, India', href: null },
        { icon: Phone, label: 'Phone', value: '+91 98258 64812', href: 'tel:+919825864812' },
        { icon: Mail, label: 'Email', value: 'Kiritdhokiya988@gmail.com', href: 'mailto:Kiritdhokiya988@gmail.com' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-14">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-4xl md:text-5xl font-serif text-white mb-3"
                    >
                        Get In <span className="italic text-[#D4AF37]">Touch</span>
                    </motion.h1>
                    <div className="w-12 h-[1px] bg-[#D4AF37] mx-auto mb-3"></div>
                    <p className="text-gray-400 max-w-md mx-auto font-light text-sm leading-relaxed">
                        Ready to transform your space? Let's talk about your dream interior.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

                    {/* Contact Info Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        {/* Contact Items */}
                        <div className="bg-[#111111] border border-[#1e1e1e] p-4 sm:p-5 space-y-4">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-medium">Contact Information</p>
                            {contactItems.map(({ icon: Icon, label, value, href }) => (
                                <div key={label} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                                        <Icon size={14} className="text-[#D4AF37]" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] uppercase tracking-[0.25em] text-gray-500 mb-0.5">{label}</p>
                                        {href ? (
                                            <a href={href} className="text-gray-300 text-xs sm:text-sm font-light hover:text-[#D4AF37] transition-colors break-all">{value}</a>
                                        ) : (
                                            <p className="text-gray-300 text-xs sm:text-sm font-light leading-relaxed">{value}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* WhatsApp Button */}
                        <a
                            href="https://wa.me/919825864812"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2.5 bg-[#111111] border border-[#1e1e1e] hover:border-[#25D366]/40 text-gray-300 hover:text-[#25D366] px-4 py-3 text-xs tracking-[0.2em] uppercase font-medium transition-all duration-400 w-full sm:w-auto"
                        >
                            <MessageCircle size={15} />
                            <span>Message on WhatsApp</span>
                        </a>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-[#111111] border border-[#1e1e1e] p-4 sm:p-6 relative overflow-hidden"
                    >
                        <div className="absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-bl from-[#D4AF37]/8 to-transparent rounded-full blur-2xl pointer-events-none"></div>

                        <p className="text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] font-semibold mb-6">Send an Inquiry</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-2 font-medium">Your Name</label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleChange} required
                                    className="w-full bg-[#080808] border border-[#1a1a1a] px-4 py-3 text-white text-sm font-light focus:outline-none focus:border-[#D4AF37]/40 transition-all duration-300 placeholder:text-gray-800 rounded-sm"
                                    placeholder="Your full name"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-2 font-medium">Email</label>
                                    <input
                                        type="email" name="email" value={formData.email} onChange={handleChange} required
                                        className="w-full bg-[#080808] border border-[#1a1a1a] px-4 py-3 text-white text-sm font-light focus:outline-none focus:border-[#D4AF37]/40 transition-all duration-300 placeholder:text-gray-800 rounded-sm"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-2 font-medium">Phone</label>
                                    <input
                                        type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                                        className="w-full bg-[#080808] border border-[#1a1a1a] px-4 py-3 text-white text-sm font-light focus:outline-none focus:border-[#D4AF37]/40 transition-all duration-300 placeholder:text-gray-800 rounded-sm"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-2 font-medium">Message</label>
                                <textarea
                                    name="message" value={formData.message} onChange={handleChange} required rows="5"
                                    className="w-full bg-[#080808] border border-[#1a1a1a] px-4 py-3 text-white text-sm font-light focus:outline-none focus:border-[#D4AF37]/40 transition-all duration-300 resize-none placeholder:text-gray-800 rounded-sm"
                                    placeholder="Tell us about your project..."
                                ></textarea>
                            </div>

                            <button
                                type="submit" disabled={loading}
                                className="w-full flex justify-center items-center gap-3 bg-transparent border border-[#D4AF37]/60 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0a0a0a] font-bold uppercase tracking-[0.3em] py-4 transition-all duration-500 disabled:opacity-50 text-[11px] mt-2 group"
                            >
                                {loading ? 'Sending...' : (
                                    <>
                                        <span>Send Message</span>
                                        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
