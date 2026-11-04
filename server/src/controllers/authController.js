import crypto from 'crypto';
import User from '../models/User.js';
import { AppError, asyncHandler, sendSuccess } from '../utils/helpers.js';
import { sendToken } from '../middleware/auth.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError('An account with this email already exists', 400);
  const user = await User.create({ name, email: email.toLowerCase(), password, phone: phone || '' });
  return sendToken(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (user.isBlocked) throw new AppError('Your account is blocked', 403);
  return sendToken(res, user);
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (user.role !== 'admin') throw new AppError('Admin access only', 403);
  if (user.isBlocked) throw new AppError('Your account is blocked', 403);
  return sendToken(res, user);
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  return sendSuccess(res, null, 'Logged out');
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return sendSuccess(res, user, 'Profile');
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...(name && { name }), ...(phone !== undefined && { phone }) },
    { new: true, runValidators: true }
  );
  return sendSuccess(res, user, 'Profile updated');
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.push(req.body);
  await user.save();
  return sendSuccess(res, user.addresses, 'Address saved');
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => String(a._id) !== req.params.id);
  await user.save();
  return sendSuccess(res, user.addresses, 'Address removed');
});

// Forgot password: token is hashed in the DB. Without an SMTP provider configured,
// the token is logged server-side only (never returned to the client) and the
// response stays generic so account existence is not revealed.
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (user) {
    const token = user.createResetToken();
    await user.save({ validateBeforeSave: false });
    console.log(`Password reset token for ${user.email} (dev only, configure SMTP to email it): ${token}`);
  }
  return sendSuccess(res, null, 'If an account exists, reset instructions have been sent');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) throw new AppError('Reset token is invalid or expired', 400);
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  return sendToken(res, user);
});
