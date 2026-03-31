import mongoose from 'mongoose';

const contactInquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

const ContactInquiry = mongoose.model('ContactInquiry', contactInquirySchema);
export default ContactInquiry;
