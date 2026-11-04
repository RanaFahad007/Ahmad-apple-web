import express from 'express';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../middleware/upload.js';
import * as auth from '../controllers/authController.js';
import * as products from '../controllers/productController.js';
import * as orders from '../controllers/orderController.js';
import * as misc from '../controllers/miscController.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, try again later', data: null },
});
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many admin login attempts, try again later', data: null },
});

// Auth
router.post('/auth/register', [body('name').notEmpty().withMessage('Name is required'), body('email').isEmail().withMessage('Valid email required'), body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')], validate, auth.register);
router.post('/auth/login', loginLimiter, [body('email').isEmail(), body('password').notEmpty()], validate, auth.login);
router.post('/auth/admin-login', adminLoginLimiter, [body('email').isEmail(), body('password').notEmpty()], validate, auth.adminLogin);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', protect, auth.me);
router.put('/auth/profile', protect, auth.updateProfile);
router.post('/auth/addresses', protect, auth.addAddress);
router.delete('/auth/addresses/:id', protect, auth.deleteAddress);
router.post('/auth/forgot-password', [body('email').isEmail()], validate, auth.forgotPassword);
router.post('/auth/reset-password/:token', [body('password').isLength({ min: 6 })], validate, auth.resetPassword);

// Public catalogue
router.get('/categories', misc.listCategoriesPublic);
router.get('/brands', misc.listBrandsPublic);
router.get('/banners', misc.listBannersPublic);
router.get('/settings', misc.getSettingsPublic);
router.get('/products', products.listProducts);
router.get('/products/suggestions', products.searchSuggestions);
router.get('/products/:slug', products.getProduct);
router.post('/messages', [body('name').notEmpty(), body('email').isEmail(), body('message').notEmpty()], validate, misc.createMessage);
router.post('/coupons/validate', misc.validateCoupon);
router.post('/reviews', protect, misc.createReview);

// Cart + orders (logged-in users)
router.get('/cart', protect, misc.getCart);
router.post('/cart', protect, misc.saveCart);
router.post('/orders', protect, orders.createOrder);
router.get('/orders/my', protect, orders.myOrders);
router.get('/orders/:id', protect, orders.getOrder);
router.post('/upload', protect, adminOnly, upload.array('images', 8), uploadToCloudinary, (req, res) =>
  res.json({ success: true, message: 'Uploaded', data: req.body.uploadedImages || [] })
);

// Admin: every route below is protected by protect + adminOnly on the server,
// regardless of whether the /admin-ahmad URL is hidden from the public site.
router.use('/admin', protect, adminOnly);
router.get('/admin/dashboard', misc.adminDashboard);
router.get('/admin/products', products.adminListProducts);
router.get('/admin/products/:id', products.adminGetProduct);
router.post('/admin/products', upload.array('images', 8), uploadToCloudinary, products.createProduct);
router.put('/admin/products/:id', upload.array('images', 8), uploadToCloudinary, products.updateProduct);
router.delete('/admin/products/:id', products.deleteProduct);
router.post('/admin/products/:id/duplicate', products.duplicateProduct);
router.post('/admin/products/bulk-delete', products.bulkDeleteProducts);
router.get('/admin/categories', misc.categories.list);
router.post('/admin/categories', upload.single('image'), uploadToCloudinary, misc.categories.create);
router.put('/admin/categories/:id', upload.single('image'), uploadToCloudinary, misc.categories.update);
router.delete('/admin/categories/:id', misc.categories.remove);
router.get('/admin/brands', misc.brands.list);
router.post('/admin/brands', upload.single('image'), uploadToCloudinary, misc.brands.create);
router.put('/admin/brands/:id', upload.single('image'), uploadToCloudinary, misc.brands.update);
router.delete('/admin/brands/:id', misc.brands.remove);
router.get('/admin/orders', orders.adminListOrders);
router.put('/admin/orders/:id', orders.updateOrder);
router.get('/admin/customers', misc.adminListCustomers);
router.get('/admin/customers/:id', misc.customerDetail);
router.put('/admin/customers/:id/block', misc.toggleBlockCustomer);
router.get('/admin/reviews', misc.adminListReviews);
router.put('/admin/reviews/:id/approve', misc.approveReview);
router.delete('/admin/reviews/:id', misc.deleteReview);
router.get('/admin/coupons', misc.coupons.list);
router.post('/admin/coupons', misc.coupons.create);
router.put('/admin/coupons/:id', misc.coupons.update);
router.delete('/admin/coupons/:id', misc.coupons.remove);
router.get('/admin/banners', misc.banners.list);
router.post('/admin/banners', upload.single('image'), uploadToCloudinary, misc.banners.create);
router.put('/admin/banners/:id', upload.single('image'), uploadToCloudinary, misc.banners.update);
router.delete('/admin/banners/:id', misc.banners.remove);
router.get('/admin/messages', misc.messages.list);
router.delete('/admin/messages/:id', misc.messages.remove);
router.put('/admin/settings', upload.single('image'), uploadToCloudinary, misc.updateSettings);

export default router;
