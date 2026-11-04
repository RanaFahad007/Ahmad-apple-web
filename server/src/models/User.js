import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    fullName: String,
    phone: String,
    city: String,
    address: String,
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false, minlength: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    phone: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    addresses: [addressSchema],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.createResetToken = function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  return token;
};

export default mongoose.model('User', userSchema);
