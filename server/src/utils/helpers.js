export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function sendSuccess(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parsePagination(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
  return { page, limit, skip: (page - 1) * limit };
}

export function pagedResult(res, docs, total, page, limit, message = 'OK') {
  return res.status(200).json({
    success: true,
    message,
    data: docs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
