import express from 'express';
import CompletedWork from '../models/CompletedWork.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { deleteCloudinaryMedia } from '../utils/cloudinaryUtils.js';

const router = express.Router();

router.route('/')
    .get(async (req, res) => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 0;
            const works = await CompletedWork.find({})
                .sort('-createdAt')
                .limit(limit);
            res.json(works);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, admin, async (req, res) => {
        try {
            const { media } = req.body;
            const newWork = new CompletedWork({
                media
            });
            const createdWork = await newWork.save();
            res.status(201).json(createdWork);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

router.route('/:id')
    .get(async (req, res) => {
        try {
            const work = await CompletedWork.findById(req.params.id);
            if (work) {
                res.json(work);
            } else {
                res.status(404).json({ message: 'Completed work not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .put(protect, admin, async (req, res) => {
        try {
            const { media } = req.body;
            const work = await CompletedWork.findById(req.params.id);

            if (work) {
                const oldUrls = work.media.map(m => m.url);
                const newUrls = media ? media.map(m => m.url) : [];
                
                const removedUrls = oldUrls.filter(url => !newUrls.includes(url));
                
                // Delete removed old urls from Cloudinary in background
                removedUrls.forEach(url => {
                    deleteCloudinaryMedia(url).catch(err => console.error('Failed to cleanup removed media:', err));
                });

                work.media = media || work.media;

                const updatedWork = await work.save();
                res.json(updatedWork);
            } else {
                res.status(404).json({ message: 'Completed work not found' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .delete(protect, admin, async (req, res) => {
        try {
            const work = await CompletedWork.findById(req.params.id);
            if (work) {
                // Delete from DB immediately for fast response
                await work.deleteOne();
                res.json({ message: 'Completed work removed' });

                // Delete associated media from Cloudinary in the background
                if (work.media && work.media.length > 0) {
                    work.media.forEach(item => {
                        if (item.url) {
                            deleteCloudinaryMedia(item.url).catch(err => console.error('Background delete failed:', err));
                        }
                    });
                }
            } else {
                res.status(404).json({ message: 'Completed work not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

export default router;
