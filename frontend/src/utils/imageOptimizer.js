/**
 * Optimizes Cloudinary URLs by injecting auto-format, auto-quality,
 * and optional resize transformations.
 *
 * Supports both /upload/ and /image/upload/ Cloudinary URL formats.
 *
 * @param {string} url - The original Cloudinary URL
 * @param {object} options - Optional: { width, height, crop }
 * @returns {string} - The optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url;

  // Only transform Cloudinary URLs
  if (!url.includes('cloudinary.com')) return url;

  const { width = 900, quality = 'auto', format = 'auto' } = options;

  // Build transformation string
  let transforms = `f_${format},q_${quality}`;
  if (width) transforms += `,w_${width}`;
  if (options.height) transforms += `,h_${options.height}`;
  if (options.crop) transforms += `,c_${options.crop}`;

  // Insert transforms after /upload/ in the URL
  // Handles: https://res.cloudinary.com/.../upload/v123.../image.jpg
  // and also: https://res.cloudinary.com/.../image/upload/v123.../image.jpg
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  return (
    url.slice(0, uploadIndex + '/upload/'.length) +
    transforms +
    '/' +
    url.slice(uploadIndex + '/upload/'.length)
  );
};

/**
 * Returns a thumbnail-sized optimized Cloudinary URL (for grid/list views).
 */
export const getThumbnailUrl = (url) =>
  getOptimizedImageUrl(url, { width: 400, quality: 'auto:good' });

/**
 * Returns a full-size optimized Cloudinary URL (for modals/lightboxes).
 */
export const getFullsizeUrl = (url) =>
  getOptimizedImageUrl(url, { width: 1600, quality: 'auto:best' });
