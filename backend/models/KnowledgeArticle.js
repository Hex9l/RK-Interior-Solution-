import mongoose from 'mongoose';

const knowledgeArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    imageUrl: { type: String },
    author: { type: String, default: 'Admin' }
}, { timestamps: true });

const KnowledgeArticle = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
export default KnowledgeArticle;
