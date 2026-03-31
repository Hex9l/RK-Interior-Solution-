import express from 'express';
import DesignImage from '../models/DesignImage.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { deleteCloudinaryMedia } from '../utils/cloudinaryUtils.js';

const router = express.Router();

router.route('/')
    .get(async (req, res) => {
        try {
            // Allow filtering by category via query param: /api/design-images?category=ID
            const filter = req.query.category ? { category: req.query.category } : {};
            
            // Build query
            let query = DesignImage.find(filter).populate('category', 'name');
            
            // Default to newest first (professional order for admin)
            query = query.sort({ createdAt: -1 });
            
            let images = await query;
            
            // Shuffle images if requested (for public gallery)
            if (req.query.shuffle === 'true') {
                for (let i = images.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [images[i], images[j]] = [images[j], images[i]];
                }
            }
            
            res.json(images);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, admin, async (req, res) => {
        try {
            const { title, url, category, type } = req.body;
            const newImage = new DesignImage({ title, url, category, type });
            const createdImage = await newImage.save();
            res.status(201).json(createdImage);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

// @desc    Get all designs liked by the current user
// @route   GET /api/design-images/liked
// @access  Private
router.get('/liked', protect, async (req, res) => {
    try {
        const likedImages = await DesignImage.find({ likes: req.user._id }).populate('category', 'name');
        res.json(likedImages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.route('/:id')
    .get(async (req, res) => {
        try {
            const image = await DesignImage.findById(req.params.id).populate('category', 'name');
            if (image) {
                res.json(image);
            } else {
                res.status(404).json({ message: 'Image not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .put(protect, admin, async (req, res) => {
        try {
            const { title, url, category, type } = req.body;
            const image = await DesignImage.findById(req.params.id);

            if (image) {
                image.title = title || image.title;
                image.url = url || image.url;
                image.category = category || image.category;
                image.type = type || image.type;

                const updatedImage = await image.save();
                res.json(updatedImage);
            } else {
                res.status(404).json({ message: 'Image not found' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .delete(protect, admin, async (req, res) => {
        try {
            const image = await DesignImage.findById(req.params.id);
            if (image) {
                // Delete from DB immediately for fast response
                await image.deleteOne();
                res.json({ message: 'Image removed' });

                // Delete from Cloudinary in the background
                if (image.url) {
                    deleteCloudinaryMedia(image.url).catch(err => console.error('Background delete failed:', err));
                }
            } else {
                res.status(404).json({ message: 'Image not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

// @desc    Toggle like for a design
// @route   POST /api/design-images/:id/toggle-like
// @access  Private
router.post('/:id/toggle-like', protect, async (req, res) => {
    try {
        const image = await DesignImage.findById(req.params.id);
        if (image) {
            const isLiked = image.likes.includes(req.user._id);

            if (isLiked) {
                image.likes = image.likes.filter((id) => id.toString() !== req.user._id.toString());
            } else {
                image.likes.push(req.user._id);
            }

            await image.save();
            res.json({ message: isLiked ? 'Unliked' : 'Liked', likes: image.likes });
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
