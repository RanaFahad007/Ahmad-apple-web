import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    // { url, publicId } for Cloudinary uploads; a plain string URL from an
    // older document still works (see utils/images.js).
    image: { type: mongoose.Schema.Types.Mixed, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Brand', brandSchema);
