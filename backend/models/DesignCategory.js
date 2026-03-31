import mongoose from 'mongoose';

const designCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String }
}, { timestamps: true });

const DesignCategory = mongoose.model('DesignCategory', designCategorySchema);
export default DesignCategory;
