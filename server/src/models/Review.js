import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    isApproved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
