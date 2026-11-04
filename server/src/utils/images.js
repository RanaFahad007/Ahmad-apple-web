// Image shape helpers.
//
// Images are stored as { url, publicId } for anything uploaded through
// Cloudinary direct upload. Older documents (seed data, pasted URLs) still
// carry plain string URLs, so every reader must go through imageUrl() /
// publicIdOf() instead of assuming one shape. On write, normalizeImage()
// converts a string URL to { url, publicId: '' } so new saves are uniform
// and old documents keep rendering until they are next edited.
export function imageUrl(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || '';
}

export function publicIdOf(image) {
  if (!image || typeof image === 'string') return '';
  return image.publicId || '';
}

export function normalizeImage(image) {
  if (!image) return null;
  if (typeof image === 'string') return image.trim() ? { url: image.trim(), publicId: '' } : null;
  if (typeof image === 'object' && image.url) return { url: String(image.url), publicId: image.publicId ? String(image.publicId) : '' };
  return null;
}

export function normalizeImages(images) {
  if (!images) return [];
  const list = Array.isArray(images) ? images : [images];
  return list.map(normalizeImage).filter(Boolean);
}

// public_ids of images that actually live on Cloudinary (pasted/external
// URLs have an empty publicId and must never be sent to destroy()).
export function ownedPublicIds(images) {
  return normalizeImages(images).map((i) => i.publicId).filter(Boolean);
}
