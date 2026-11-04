import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/helpers.js';

function tokenFrom(req) {
  if (req.cookies?.token) return req.cookies.token;
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export async function protect(req, res, next) {
  try {
    const token = tokenFrom(req);
    if (!token) throw new AppError('Not authorized, please log in', 401);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError('User no longer exists', 401);
    if (user.isBlocked) throw new AppError('Your account is blocked', 403);
    req.user = user;
    return next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError('Not authorized, token invalid or expired', 401));
  }
}

// Optional auth: fills req.user when a valid token is present, never fails.
export async function optionalAuth(req, res, next) {
  try {
    const token = tokenFrom(req);
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch {
    // Guest request continues without a user.
  }
  return next();
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin access only', 403));
  }
  return next();
}

export function sendToken(res, user, statusCode = 200) {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  const days = Number(process.env.COOKIE_EXPIRE_DAYS || 7);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: days * 24 * 60 * 60 * 1000,
  });
  return res.status(statusCode).json({
    success: true,
    message: 'Authenticated',
    data: {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    },
  });
}
