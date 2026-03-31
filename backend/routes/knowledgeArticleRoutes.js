import express from 'express';
import KnowledgeArticle from '../models/KnowledgeArticle.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { deleteCloudinaryMedia } from '../utils/cloudinaryUtils.js';

const router = express.Router();

router.route('/')
    .get(async (req, res) => {
        try {
            const articles = await KnowledgeArticle.find({}).sort('-createdAt');
            res.json(articles);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, admin, async (req, res) => {
        try {
            const { title, content, excerpt, imageUrl, author } = req.body;
            const newArticle = new KnowledgeArticle({
                title,
                content,
                excerpt,
                imageUrl,
                author: author || 'Admin'
            });
            const createdArticle = await newArticle.save();
            res.status(201).json(createdArticle);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

router.route('/:id')
    .get(async (req, res) => {
        try {
            const article = await KnowledgeArticle.findById(req.params.id);
            if (article) {
                res.json(article);
            } else {
                res.status(404).json({ message: 'Article not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .put(protect, admin, async (req, res) => {
        try {
            const { title, content, excerpt, imageUrl, author } = req.body;
            const article = await KnowledgeArticle.findById(req.params.id);

            if (article) {
                article.title = title || article.title;
                article.content = content || article.content;
                article.excerpt = excerpt || article.excerpt;
                article.imageUrl = imageUrl || article.imageUrl;
                article.author = author || article.author;

                const updatedArticle = await article.save();
                res.json(updatedArticle);
            } else {
                res.status(404).json({ message: 'Article not found' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .delete(protect, admin, async (req, res) => {
        try {
            const article = await KnowledgeArticle.findById(req.params.id);
            if (article) {
                // Delete from DB immediately for fast response
                await article.deleteOne();
                res.json({ message: 'Article removed' });

                // Delete from Cloudinary in the background
                if (article.imageUrl) {
                    deleteCloudinaryMedia(article.imageUrl).catch(err => console.error('Background delete failed:', err));
                }
            } else {
                res.status(404).json({ message: 'Article not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

export default router;
