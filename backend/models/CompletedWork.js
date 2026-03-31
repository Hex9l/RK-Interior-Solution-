import mongoose from 'mongoose';

const completedWorkSchema = new mongoose.Schema({
    media: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        coverUrl: { type: String }
    }]
}, { timestamps: true });

const CompletedWork = mongoose.model('CompletedWork', completedWorkSchema);
export default CompletedWork;
