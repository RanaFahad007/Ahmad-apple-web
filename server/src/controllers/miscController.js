import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Coupon from '../models/Coupon.js';
import Banner from '../models/Banner.js';
import Message from '../models/Message.js';
import Settings from '../models/Settings.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { AppError, asyncHandler, pagedResult, parsePagination, sendSuccess, slugify } from '../utils/helpers.js';
import { normalizeImage, ownedPublicIds } from '../utils/images.js';
import { deleteCloudinaryImages } from './uploadController.js';

function withSlug(body) {
  const data = { ...body };
  if (body.name && !body.slug) data.slug = slugify(body.name);
  // Single images arrive as JSON {url, publicId} from direct upload, or as
  // a pasted URL string. Never as a file.
  if (body.image !== undefined) data.image = normalizeImage(body.image);
  return data;
}

function crud(Model, label) {
  return {
    list: asyncHandler(async (req, res) => {
      const { page, limit, skip } = parsePagination(req);
      const [docs, total] = await Promise.all([
        Model.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Model.countDocuments({}),
      ]);
      return pagedResult(res, docs, total, page, limit);
    }),
    create: asyncHandler(async (req, res) => {
      const doc = await Model.create(withSlug(req.body));
      return sendSuccess(res, doc, `${label} created`, 201);
    }),
    update: asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, withSlug(req.body), { new: true, runValidators: true });
      if (!doc) throw new AppError(`${label} not found`, 404);
      return sendSuccess(res, doc, `${label} updated`);
    }),
    remove: asyncHandler(async (req, res) => {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) throw new AppError(`${label} not found`, 404);
      if (doc.image) await deleteCloudinaryImages(ownedPublicIds([doc.image]));
      return sendSuccess(res, null, `${label} deleted`);
    }),
  };
}

export const categories = crud(Category, 'Category');
export const brands = crud(Brand, 'Brand');
export const coupons = crud(Coupon, 'Coupon');
export const banners = crud(Banner, 'Banner');
export const messages = crud(Message, 'Message');

export const listCategoriesPublic = asyncHandler(async (req, res) => {
  const docs = await Category.find({ isActive: true }).sort({ name: 1 });
  return sendSuccess(res, docs, 'Categories');
});

export const listBrandsPublic = asyncHandler(async (req, res) => {
  const docs = await Brand.find({ isActive: true }).sort({ name: 1 });
  return sendSuccess(res, docs, 'Brands');
});

export const listBannersPublic = asyncHandler(async (req, res) => {
  const docs = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  return sendSuccess(res, docs, 'Banners');
});

export const getSettingsPublic = asyncHandler(async (req, res) => {
  const settings = (await Settings.findOne()) || {};
  return sendSuccess(res, settings, 'Settings');
});

export const updateSettings = asyncHandler(async (req, res) => {
  // Only whitelisted fields may be saved. The old code passed the whole
  // document back (including _id, __v and timestamps), which Mongoose
  // rejects on the immutable _id path — that is why Save could fail even
  // though the form looked fine. Numbers are coerced here too, because
  // the form sends them as strings.
  const allowed = ['storeName', 'logo', 'whatsappNumber', 'deliveryCharge', 'freeDeliveryThreshold', 'bankName', 'bankAccountTitle', 'bankAccountNumber', 'easypaisaNumber', 'jazzcashNumber', 'facebook', 'instagram', 'twitter', 'youtube', 'contactEmail', 'contactPhone', 'address'];
  const data = {};
  for (const key of allowed) {
    if (req.body[key] === undefined) continue;
    if (key === 'deliveryCharge' || key === 'freeDeliveryThreshold') {
      const n = Number(req.body[key]);
      if (!Number.isNaN(n)) data[key] = n;
    } else {
      data[key] = req.body[key];
    }
  }
  if (req.body.logo !== undefined && typeof req.body.logo === 'object' && req.body.logo !== null) data.logo = req.body.logo.url || '';
  const settings = await Settings.findOneAndUpdate({}, data, { new: true, upsert: true, runValidators: true });
  return sendSuccess(res, settings, 'Settings updated');
});

export const createMessage = asyncHandler(async (req, res) => {
  // Contact is now login-only, so every message is linked to a registered user.
  const doc = await Message.create({ ...req.body, user: req.user._id, email: req.user.email, name: req.body.name || req.user.name });
  return sendSuccess(res, doc, 'Message sent. We will reply soon.', 201);
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code?.toUpperCase(), isActive: true });
  if (!coupon || (coupon.expiry && coupon.expiry < new Date()) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) {
    throw new AppError('Coupon is invalid or expired', 400);
  }
  return sendSuccess(res, coupon, 'Coupon valid');
});

export const createReview = asyncHandler(async (req, res) => {
  const { product, rating, comment } = req.body;
  const purchased = await Order.exists({
    user: req.user._id,
    'items.product': product,
    status: { $in: ['Delivered', 'Shipped', 'Confirmed', 'Packed'] },
  });
  if (!purchased) throw new AppError('Only customers who purchased this product can review it', 403);
  const review = await Review.create({ product, user: req.user._id, userName: req.user.name, rating, comment });
  return sendSuccess(res, review, 'Review submitted for approval', 201);
});

export const adminListReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req);
  const [docs, total] = await Promise.all([
    Review.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('product', 'name'),
    Review.countDocuments({}),
  ]);
  return pagedResult(res, docs, total, page, limit);
});

export const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!review) throw new AppError('Review not found', 404);
  const approved = await Review.find({ product: review.product, isApproved: true });
  const rating = approved.reduce((sum, r) => sum + r.rating, 0) / (approved.length || 1);
  await Product.findByIdAndUpdate(review.product, { rating: Number(rating.toFixed(1)), numReviews: approved.length });
  return sendSuccess(res, review, 'Review approved');
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  return sendSuccess(res, null, 'Review deleted');
});

export const adminDashboard = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [totalSales, ordersToday, pendingOrders, totalProducts, totalCustomers, lowStock, recentOrders, topProducts] =
    await Promise.all([
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ status: 'Pending' }),
      Product.countDocuments({}),
      User.countDocuments({ role: 'user' }),
      Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock sku').limit(10),
      Order.find({}).sort({ createdAt: -1 }).limit(8),
      Product.find({}).sort({ soldCount: -1 }).limit(8).select('name soldCount price images'),
    ]);
  const revenueByDay = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    { $sort: { _id: -1 } },
    { $limit: 14 },
  ]);
  return sendSuccess(
    res,
    {
      totalSales: totalSales[0]?.total || 0,
      ordersToday,
      pendingOrders,
      totalProducts,
      totalCustomers,
      lowStock,
      recentOrders,
      topProducts,
      revenueByDay: revenueByDay.reverse(),
    },
    'Dashboard'
  );
});

export const adminListCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req);
  const [docs, total] = await Promise.all([
    User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments({ role: 'user' }),
  ]);
  return pagedResult(res, docs, total, page, limit);
});

export const toggleBlockCustomer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('Customer not found', 404);
  user.isBlocked = !user.isBlocked;
  await user.save();
  return sendSuccess(res, user, user.isBlocked ? 'Customer blocked' : 'Customer unblocked');
});

export const customerDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw new AppError('Customer not found', 404);
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(20);
  return sendSuccess(res, { user, orders }, 'Customer');
});

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name slug price salePrice images stock');
  return sendSuccess(res, cart?.items || [], 'Cart');
});

export const saveCart = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items },
    { new: true, upsert: true }
  );
  return sendSuccess(res, cart.items, 'Cart saved');
});
