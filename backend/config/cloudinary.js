import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 600000, // 10 minutes — for large video uploads
});

// Setup Multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        if (file.mimetype.startsWith('video/')) {
            return {
                folder: 'RK Interior Solution/videos',
                resource_type: 'video',
                // Removed fixed allowed_formats to allow more flexibility and avoid rejections
            };
        }
        return {
            folder: 'RK Interior Solution/images',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        };
    },
});

export { cloudinary, storage };
