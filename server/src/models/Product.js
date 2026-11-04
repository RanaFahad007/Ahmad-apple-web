import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, default: '' },
    storage: { type: String, default: '' },
    condition: { type: String, enum: ['New', 'Used', 'Open Box'], default: 'New' },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    sku: { type: String, default: '' },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    brandName: { type: String, default: 'Apple' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    price: { type: Number, required: true, min: 0, index: true },
    salePrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, default: '', index: true },
    // { url, publicId } for Cloudinary uploads; plain string URLs from old
    // documents and pasted links still work (see utils/images.js). The first
    // image is the main image.
    images: [{ type: mongoose.Schema.Types.Mixed }],
    variants: [variantSchema],
    description: { type: String, default: '' },
    specs: { type: Map, of: String, default: {} },
    isFeatured: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    soldCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, price: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.model('Product', productSchema);
