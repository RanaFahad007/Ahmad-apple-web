import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { AppError, asyncHandler, pagedResult, parsePagination, sendSuccess, slugify } from '../utils/helpers.js';

function buildFilters(q) {
  const filter = { isActive: true };
  if (q.category) filter.category = q.category;
  if (q.brand) filter.brandName = q.brand;
  if (q.color) filter['variants.color'] = q.color;
  if (q.storage) filter['variants.storage'] = q.storage;
  if (q.condition) filter['variants.condition'] = q.condition;
  if (q.minPrice || q.maxPrice) {
    filter.price = {};
    if (q.minPrice) filter.price.$gte = Number(q.minPrice);
    if (q.maxPrice) filter.price.$lte = Number(q.maxPrice);
  }
  if (q.search) filter.$text = { $search: q.search };
  return filter;
}

function sortFor(sort) {
  if (sort === 'price-asc') return { price: 1 };
  if (sort === 'price-desc') return { price: -1 };
  if (sort === 'popular') return { soldCount: -1 };
  if (sort === 'rating') return { rating: -1 };
  return { createdAt: -1 };
}

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req);
  const filter = buildFilters(req.query);
  // Category pages pass a slug, not an ObjectId.
  if (req.query.categorySlug) {
    const cat = await Category.findOne({ slug: req.query.categorySlug });
    if (!cat) return pagedResult(res, [], 0, page, limit);
    filter.category = cat._id;
  }
  const [docs, total] = await Promise.all([
    Product.find(filter).sort(sortFor(req.query.sort)).skip(skip).limit(limit).populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);
  return pagedResult(res, docs, total, page, limit);
});

export const searchSuggestions = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return sendSuccess(res, [], 'Suggestions');
  const docs = await Product.find({ name: { $regex: q, $options: 'i' }, isActive: true })
    .select('name slug price salePrice images')
    .limit(8);
  return sendSuccess(res, docs, 'Suggestions');
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
  if (!product) throw new AppError('Product not found', 404);
  const [related, reviews] = await Promise.all([
    Product.find({ category: product.category?._id, _id: { $ne: product._id }, isActive: true }).limit(8),
    Review.find({ product: product._id, isApproved: true }).sort({ createdAt: -1 }).limit(20),
  ]);
  return sendSuccess(res, { product, related, reviews }, 'Product');
});

export const adminListProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req);
  const filter = {};
  if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  const [docs, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category', 'name'),
    Product.countDocuments(filter),
  ]);
  return pagedResult(res, docs, total, page, limit);
});

function productPayload(body) {
  const data = { ...body };
  if (body.name && !body.slug) data.slug = slugify(body.name);
  if (body.slug) data.slug = slugify(body.slug);
  if (typeof body.specs === 'string') {
    try { data.specs = JSON.parse(body.specs); } catch { data.specs = {}; }
  }
  if (typeof body.variants === 'string') {
    try { data.variants = JSON.parse(body.variants); } catch { data.variants = []; }
  }
  if (typeof body.images === 'string') {
    try { data.images = JSON.parse(body.images); } catch { data.images = body.images ? [body.images] : []; }
  }
  if (body.uploadedImages?.length) {
    data.images = [...(Array.isArray(data.images) ? data.images : []), ...body.uploadedImages];
  }
  return data;
}

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(productPayload(req.body));
  return sendSuccess(res, product, 'Product created', 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, productPayload(req.body), {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  return sendSuccess(res, product, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  return sendSuccess(res, null, 'Product deleted');
});

export const duplicateProduct = asyncHandler(async (req, res) => {
  const original = await Product.findById(req.params.id).lean();
  if (!original) throw new AppError('Product not found', 404);
  delete original._id;
  original.name = `${original.name} (Copy)`;
  original.slug = `${original.slug}-copy-${Date.now()}`;
  original.sku = original.sku ? `${original.sku}-COPY` : '';
  const copy = await Product.create(original);
  return sendSuccess(res, copy, 'Product duplicated', 201);
});

export const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (!ids.length) throw new AppError('No product ids provided', 400);
  await Product.deleteMany({ _id: { $in: ids } });
  return sendSuccess(res, { deleted: ids.length }, 'Products deleted');
});
