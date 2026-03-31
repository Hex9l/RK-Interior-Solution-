import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinaryV2 } from 'cloudinary';
import { cloudinary } from '../config/cloudinary.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// ─── Multer disk storage ──────────────────────────────────────────────────────
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: diskStorage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

const router = express.Router();

// ─── Helper: delete local file safely ────────────────────────────────────────
const deleteLocal = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
        console.error('Could not delete local file:', e.message);
    }
};

// ─── Helper: ensure logs dir ─────────────────────────────────────────────────
const ensureLogsDir = () => {
    if (!fs.existsSync('logs')) fs.mkdirSync('logs', { recursive: true });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/upload   — upload image or video
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', protect, admin, (req, res) => {
    upload.single('media')(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File exceeds 100 MB limit' });
            }
            return res.status(500).json({ message: 'File upload failed', error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file received' });
        }

        const filePath = req.file.path;
        
        let isVideo = false;
        try {
            if (req.file.mimetype) {
                isVideo = req.file.mimetype.startsWith('video/');
            } else {
                // fallback check extension
                isVideo = filePath.match(/\.(mp4|mov|avi|webm|mkv)$/i) !== null;
            }
        } catch (e) {
            console.error('[UPLOAD] Error checking mimetype:', e);
        }

        const folder = isVideo ? 'RK Interior Solution/videos' : 'RK Interior Solution/images';
        const publicId = path.parse(req.file.filename).name;

        console.log(`\n[UPLOAD] File Received: ${req.file.originalname} | Size: ${req.file.size} | Mimetype: ${req.file.mimetype} | isVideo: ${isVideo}`);
        console.log(`[UPLOAD] Starting ${isVideo ? 'VIDEO' : 'IMAGE'} upload to Cloudinary -> ${filePath}`);

        let clientAborted = false;
        req.on('close', () => {
            if (!res.headersSent) {
                clientAborted = true;
                console.log('[UPLOAD] Client closed connection — aborting');
                deleteLocal(filePath);
                // Best-effort cleanup on Cloudinary side
                cloudinary.uploader.destroy(`${folder}/${publicId}`, {
                    resource_type: isVideo ? 'video' : 'image'
                }).catch(() => {});
            }
        });

        try {
            let result;

            if (isVideo) {
                // ── Video: use upload_large with proper callback to Promise wrapper ──
                result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_large(filePath, {
                        folder,
                        public_id: publicId,
                        resource_type: 'video',
                        chunk_size: 6 * 1024 * 1024,  // 6 MB chunks
                        timeout: 600000,               // 10 minutes — match server timeout
                    }, function (error, result) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                });
            } else {
                // ── Image: standard upload ───────────────────────────────────
                result = await cloudinary.uploader.upload(filePath, {
                    folder,
                    public_id: publicId,
                    resource_type: 'image',
                });
            }

            if (clientAborted) {
                // Client already closed — cleanup the just-finished upload
                cloudinary.uploader.destroy(result.public_id, {
                    resource_type: isVideo ? 'video' : 'image'
                }).catch(() => {});
                deleteLocal(filePath);
                return;
            }

            deleteLocal(filePath);
            console.log(`[UPLOAD] Success → ${result.secure_url}`);

            return res.json({
                url: result.secure_url,
                type: isVideo ? 'video' : 'image',
            });

        } catch (error) {
            if (clientAborted) {
                deleteLocal(filePath);
                return; // headers already sent or not needed
            }

            ensureLogsDir();
            fs.appendFileSync('logs/error.log',
                `[${new Date().toISOString()}] Upload Error: ${error.message}\n${JSON.stringify(error, null, 2)}\n\n`
            );
            console.error('[UPLOAD] Cloudinary error:', error.message);
            deleteLocal(filePath);

            if (!res.headersSent) {
                return res.status(500).json({
                    message: 'Upload to Cloudinary failed. Try a smaller file or check your connection.',
                    error: error.message,
                });
            }
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/upload   — delete a Cloudinary asset by URL
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/', protect, admin, async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ message: 'URL is required' });
    }

    // Respond immediately — delete in flight in background
    res.json({ message: 'Deletion initiated' });

    try {
        // Extract public_id: take last two path segments, strip extension
        const parts = url.split('/');
        const publicId = parts.slice(-2).join('/').replace(/\.[^/.]+$/, '');
        const isVideo = url.includes('/video/');
        await cloudinary.uploader.destroy(publicId, {
            resource_type: isVideo ? 'video' : 'image'
        });
        console.log(`[DELETE] Cloudinary cleanup done for: ${publicId}`);
    } catch (err) {
        console.error('[DELETE] Cloudinary cleanup failed:', err.message);
    }
});

export default router;
