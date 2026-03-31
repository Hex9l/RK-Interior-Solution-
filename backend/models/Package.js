import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    features: [{ type: String }],
    materials: [{ type: String }],
    designConsultation: { type: Boolean, default: true },
    installation: { type: Boolean, default: true }
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);
export default Package;
