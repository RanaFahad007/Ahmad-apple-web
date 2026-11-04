import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    color: String,
    storage: String,
    condition: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderNumber: { type: String, unique: true, index: true },
    items: [itemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      city: String,
      address: String,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Bank Transfer', 'Easypaisa', 'JazzCash'],
      default: 'COD',
    },
    paymentScreenshot: { type: String, default: '' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    couponCode: { type: String, default: '' },
    discount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Pending',
      index: true,
    },
    trackingNumber: { type: String, default: '' },
    customerName: String,
    customerEmail: String,
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
