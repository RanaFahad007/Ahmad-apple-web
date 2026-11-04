import imageCompression from 'browser-image-compression';
import { get } from './api.js';

// Signed direct upload to Cloudinary, from the browser.
//
// Why this exists: Vercel Functions reject request bodies over 4.5MB
// (413 FUNCTION_PAYLOAD_TOO_LARGE), so product photos must never travel
// through the Express server. The server only signs the request; the file
// goes straight from the browser to Cloudinary.
//
// Flow: validate -> compress/resize in-browser -> GET a signature from the
// API (admin route, or the payments route for checkout screenshots) -> POST
// FormData to Cloudinary with XMLHttpRequest so progress can be reported.
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024;

function uploadToCloudinary(file, sig, onProgress) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('api_key', sig.apiKey);
    fd.append('timestamp', String(sig.timestamp));
    fd.append('signature', sig.signature);
    fd.append('folder', sig.folder);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) {
          resolve({ url: body.secure_url, publicId: body.public_id });
        } else {
          reject(new Error(body.error?.message || `Cloudinary upload failed (${xhr.status})`));
        }
      } catch {
        reject(new Error(`Cloudinary upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed — check your connection and try again'));
    xhr.send(fd);
  });
}

// folder: 'products' | 'categories' | 'brands' | 'banners' | 'settings'
// (admin signature route). For checkout screenshots pass
// { signaturePath: '/upload-signature-payments' } instead — that route
// forces folder "payments" and is available to any logged-in user.
export async function uploadImage(file, folder, onProgress, options = {}) {
  const type = file.type || '';
  const isImage = ALLOWED_TYPES.includes(type) || /\.(jpe?g|png|webp)$/i.test(file.name || '');
  if (!isImage) throw new Error('Only JPG, PNG or WEBP images are allowed');
  if (file.size > MAX_ORIGINAL_BYTES) throw new Error('Image is larger than 10MB');

  // Shrink before upload: a 3–5MB phone photo becomes ~1600px wide and
  // usually well under 1MB, so even a slow mobile connection uploads fast.
  let toUpload = file;
  try {
    toUpload = await imageCompression(file, {
      maxWidthOrHeight: 1600,
      maxSizeMB: 1,
      useWebWorker: true,
      fileType: type === 'image/png' ? 'image/png' : 'image/jpeg',
    });
  } catch {
    // Compression is an optimisation, not a requirement — fall back to the
    // original file rather than failing the upload.
    toUpload = file;
  }

  const sigPath = options.signaturePath || `/admin/upload-signature?folder=${folder}`;
  const res = await get(sigPath);
  const signature = res.data || res;
  if (!signature?.signature) throw new Error('Could not get an upload signature — please log in again and retry');
  return uploadToCloudinary(toUpload, signature, onProgress);
}
