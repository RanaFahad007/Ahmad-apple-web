import cloudinary, { cloudinaryConfigured } from '../config/cloudinary.js';
import { AppError, asyncHandler, sendSuccess } from '../utils/helpers.js';

// Folders a browser may upload into, and the Cloudinary folder they map to.
// Anything else is rejected so a signed request can never be steered into an
// arbitrary folder (e.g. a payments screenshot landing in products).
const ADMIN_FOLDERS = ['products', 'categories', 'brands', 'banners', 'payments', 'settings'];
const folderPath = (folder) => `apple-ahmad/${folder}`;

function sign(folder) {
  if (!cloudinaryConfigured) {
    throw new AppError(
      'Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the server project (Vercel dashboard) and redeploy.',
      503
    );
  }
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder: folderPath(folder) }, process.env.CLOUDINARY_API_SECRET);
  return {
    timestamp,
    folder: folderPath(folder),
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    // The API secret is never returned; it only signs the request above.
  };
}

// GET /api/admin/upload-signature?folder=products — admin only (router
// mounts protect + adminOnly on /admin). The browser posts the file straight
// to Cloudinary, so the server never sees the bytes and Vercel's 4.5MB
// function payload limit never applies.
export const adminUploadSignature = asyncHandler(async (req, res) => {
  const folder = req.query.folder || 'products';
  if (!ADMIN_FOLDERS.includes(folder)) throw new AppError(`Folder must be one of: ${ADMIN_FOLDERS.join(', ')}`, 400);
  return sendSuccess(res, sign(folder), 'Upload signature');
});

// GET /api/upload-signature-payments — any logged-in user, payments only.
// Rate-limited in the router so it cannot be farmed for signatures.
export const paymentUploadSignature = asyncHandler(async (req, res) => {
  return sendSuccess(res, sign('payments'), 'Upload signature');
});

// DELETE /api/admin/images { public_id } — admin only. Best-effort delete:
// a missing image on Cloudinary (already removed, or a pasted URL with no
// public_id) is not an error worth failing the admin action over.
export const deleteImage = asyncHandler(async (req, res) => {
  const publicId = req.body?.public_id || req.body?.publicId;
  if (!publicId) throw new AppError('public_id is required', 400);
  if (!cloudinaryConfigured) throw new AppError('Image upload is not configured', 503);
  const result = await cloudinary.uploader.destroy(publicId);
  return sendSuccess(res, { public_id: publicId, result: result.result }, 'Image deleted');
});

// Delete a list of Cloudinary images, ignoring individual failures so one
// already-deleted image never blocks a product delete.
export async function deleteCloudinaryImages(publicIds) {
  if (!cloudinaryConfigured) return;
  await Promise.allSettled(publicIds.filter(Boolean).map((id) => cloudinary.uploader.destroy(id)));
}
