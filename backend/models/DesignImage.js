import mongoose from 'mongoose';

const designImageSchema = new mongoose.Schema({
    title: { type: String },
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DesignCategory',
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    default: []
}, { timestamps: true });

const DesignImage = mongoose.model('DesignImage', designImageSchema);
export default DesignImage;
