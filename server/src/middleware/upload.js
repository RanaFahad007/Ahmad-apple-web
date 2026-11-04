import multer from 'multer';
import cloudinary, { cloudinaryConfigured } from '../config/cloudinary.js';
import { AppError } from '../utils/helpers.js';

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  return cb(new AppError('Only image files are allowed', 400), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Upload buffered files to Cloudinary and attach their URLs to req.body.uploadedImages.
export async function uploadToCloudinary(req, res, next) {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files.length) return next();
    if (!cloudinaryConfigured) {
      return next(
        new AppError(
          'Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in server/.env.',
          503
        )
      );
    }
    const urls = [];
    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'apple-ahmad', resource_type: 'image' },
          (err, out) => (err ? reject(err) : resolve(out))
        );
        stream.end(file.buffer);
      });
      urls.push(result.secure_url);
    }
    req.body.uploadedImages = urls;
    return next();
  } catch (err) {
    return next(err);
  }
}
