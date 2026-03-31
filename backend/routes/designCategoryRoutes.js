import express from 'express';
import DesignCategory from '../models/DesignCategory.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(async (req, res) => {
        try {
            const categories = await DesignCategory.find({});
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, admin, async (req, res) => {
        try {
            const { name, description } = req.body;
            const newCategory = new DesignCategory({ name, description });
            const createdCategory = await newCategory.save();
            res.status(201).json(createdCategory);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

router.route('/:id')
    .get(async (req, res) => {
        try {
            const category = await DesignCategory.findById(req.params.id);
            if (category) {
                res.json(category);
            } else {
                res.status(404).json({ message: 'Category not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .put(protect, admin, async (req, res) => {
        try {
            const { name, description } = req.body;
            const category = await DesignCategory.findById(req.params.id);

            if (category) {
                category.name = name || category.name;
                category.description = description || category.description;

                const updatedCategory = await category.save();
                res.json(updatedCategory);
            } else {
                res.status(404).json({ message: 'Category not found' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .delete(protect, admin, async (req, res) => {
        try {
            const category = await DesignCategory.findById(req.params.id);
            if (category) {
                await category.deleteOne();
                res.json({ message: 'Category removed' });
            } else {
                res.status(404).json({ message: 'Category not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

export default router;
