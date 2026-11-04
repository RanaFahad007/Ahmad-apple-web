import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Apple Ahmad' },
    logo: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    deliveryCharge: { type: Number, default: 300 },
    freeDeliveryThreshold: { type: Number, default: 50000 },
    bankName: { type: String, default: '' },
    bankAccountTitle: { type: String, default: '' },
    bankAccountNumber: { type: String, default: '' },
    easypaisaNumber: { type: String, default: '' },
    jazzcashNumber: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
