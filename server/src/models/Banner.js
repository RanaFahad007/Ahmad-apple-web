import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    // { url, publicId } for Cloudinary uploads; a plain string URL from an
    // older document still works (see utils/images.js).
    image: { type: mongoose.Schema.Types.Mixed, default: '' },
    ctaText: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '/shop' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Banner', bannerSchema);
