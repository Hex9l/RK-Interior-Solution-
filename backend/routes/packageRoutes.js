import express from 'express';
import Package from '../models/Package.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(async (req, res) => {
        try {
            const packages = await Package.find({});
            res.json(packages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .post(protect, admin, async (req, res) => {
        try {
            const { name, price, description, features, materials, designConsultation, installation } = req.body;
            const newPackage = new Package({
                name,
                price,
                description,
                features,
                materials,
                designConsultation,
                installation
            });
            const createdPackage = await newPackage.save();
            res.status(201).json(createdPackage);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    });

router.route('/:id')
    .get(async (req, res) => {
        try {
            const pkg = await Package.findById(req.params.id);
            if (pkg) {
                res.json(pkg);
            } else {
                res.status(404).json({ message: 'Package not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })
    .put(protect, admin, async (req, res) => {
        try {
            const { name, price, description, features, materials, designConsultation, installation } = req.body;
            const pkg = await Package.findById(req.params.id);

            if (pkg) {
                pkg.name = name || pkg.name;
                pkg.price = price || pkg.price;
                pkg.description = description || pkg.description;
                pkg.features = features || pkg.features;
                pkg.materials = materials || pkg.materials;
                pkg.designConsultation = designConsultation !== undefined ? designConsultation : pkg.designConsultation;
                pkg.installation = installation !== undefined ? installation : pkg.installation;

                const updatedPackage = await pkg.save();
                res.json(updatedPackage);
            } else {
                res.status(404).json({ message: 'Package not found' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    })
    .delete(protect, admin, async (req, res) => {
        try {
            const pkg = await Package.findById(req.params.id);
            if (pkg) {
                await pkg.deleteOne();
                res.json({ message: 'Package removed' });
            } else {
                res.status(404).json({ message: 'Package not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

export default router;
