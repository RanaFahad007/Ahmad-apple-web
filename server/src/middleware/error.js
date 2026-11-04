export function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  return next(err);
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(', ')}`;
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid id format';
  }
  return res.status(statusCode).json({ success: false, message, data: null });
}
