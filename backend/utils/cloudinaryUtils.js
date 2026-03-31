import { cloudinary } from '../config/cloudinary.js';

export const deleteCloudinaryMedia = async (url) => {
    try {
        if (!url || !url.includes('cloudinary.com')) return;

        // determine if it's image or video by checking URL path
        const resource_type = url.includes('/video/') ? 'video' : 'image';

        // Split by /upload/
        const parts = url.split('/upload/');
        if (parts.length < 2) return;

        // Parts[1] is like v12351253/RK Interior Solution/videos/abc.mov
        // Remove version string (v123...) if present
        let public_id_with_ext = parts[1];
        if (public_id_with_ext.match(/^v\d+\//)) {
            public_id_with_ext = public_id_with_ext.split('/').slice(1).join('/');
        }

        // Remove file extension (.jpg, .png, .mp4, etc)
        const lastDotIndex = public_id_with_ext.lastIndexOf('.');
        let public_id = public_id_with_ext;
        if (lastDotIndex !== -1) {
            public_id = public_id_with_ext.substring(0, lastDotIndex);
        }

        // Decode URI components (e.g. %20 -> space)
        public_id = decodeURI(public_id);

        console.log(`Attempting to delete Cloudinary asset: ${public_id} (${resource_type})`);
        const result = await cloudinary.uploader.destroy(public_id, { resource_type });
        console.log('Cloudinary delete result:', result);
        return result;
    } catch (error) {
        console.error('Error deleting Cloudinary media:', error);
    }
};
