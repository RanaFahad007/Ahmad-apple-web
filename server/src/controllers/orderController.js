import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import { AppError, asyncHandler, pagedResult, parsePagination, sendSuccess } from '../utils/helpers.js';

async function getSettings() {
  return (await Settings.findOne()) || {};
}

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, paymentScreenshot, couponCode } = req.body;
  if (!Array.isArray(items) || !items.length) throw new AppError('Cart is empty', 400);
  const settings = await getSettings();
  let subtotal = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) throw new AppError('A product in your cart is unavailable', 400);
    const price = product.salePrice > 0 ? product.salePrice : product.price;
    subtotal += price * item.quantity;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price,
      quantity: item.quantity,
      color: item.color || '',
      storage: item.storage || '',
      condition: item.condition || 'New',
    });
    product.stock = Math.max(0, product.stock - item.quantity);
    product.soldCount += item.quantity;
    await product.save();
  }
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && (!coupon.expiry || coupon.expiry > new Date()) && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
      discount = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
      coupon.usedCount += 1;
      await coupon.save();
    }
  }
  const deliveryCharge =
    subtotal - discount >= (settings.freeDeliveryThreshold || 50000)
      ? 0
      : settings.deliveryCharge ?? 300;
  const total = subtotal - discount + deliveryCharge;
  const order = await Order.create({
    user: req.user?._id,
    orderNumber: `AA-${Date.now()}`,
    items: orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    paymentScreenshot: paymentScreenshot || req.body.uploadedImages?.[0] || '',
    couponCode: couponCode || '',
    discount,
    deliveryCharge,
    subtotal,
    total,
    customerName: shippingAddress?.fullName || req.user?.name || 'Guest',
    customerEmail: req.user?.email || '',
  });
  return sendSuccess(res, order, 'Order placed', 201);
});

export const myOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req);
  const filter = { user: req.user._id };
  const [docs, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  return pagedResult(res, docs, total, page, limit);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  if (req.user.role !== 'admin' && String(order.user) !== String(req.user._id)) {
    throw new AppError('Not authorized to view this order', 403);
  }
  return sendSuccess(res, order, 'Order');
});

export const adminListOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.orderNumber = { $regex: req.query.search, $options: 'i' };
  const [docs, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);
  return pagedResult(res, docs, total, page, limit);
});

export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!order) throw new AppError('Order not found', 404);
  return sendSuccess(res, order, 'Order updated');
});
