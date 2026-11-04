import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const categories = [
  { name: 'iPhone', slug: 'iphone', description: 'Latest iPhones, new and pre-loved', image: img('photo-1592750475338-74b7b21085ab') },
  { name: 'iPad', slug: 'ipad', description: 'iPad Pro, Air and more', image: img('photo-1544244015-0df4b3ffc6b0') },
  { name: 'Mac', slug: 'mac', description: 'MacBook Air and Pro with Apple silicon', image: img('photo-1517336714731-489689fd1ca8') },
  { name: 'Watch', slug: 'watch', description: 'Apple Watch for fitness and everyday', image: img('photo-1579586337278-3befd40fd17a') },
  { name: 'AirPods', slug: 'airpods', description: 'AirPods, AirPods Pro and Max', image: img('photo-1600294037681-c80b4cb5b434') },
  { name: 'Accessories', slug: 'accessories', description: 'Cases, chargers, cables and protectors', image: img('photo-1601524909162-ae8725290836') },
];

// name, category slug, price, salePrice, stock, images, specs, featured, bestSeller
const products = [
  ['iPhone 15 Pro Max', 'iphone', 429999, 409999, 12, ['photo-1592750475338-74b7b21085ab', 'photo-1510557880182-3d4d3cba35a5'], { Chip: 'A17 Pro', Display: '6.7-inch Super Retina XDR', Camera: '48MP Main' }, true, true],
  ['iPhone 15 Pro', 'iphone', 369999, 0, 15, ['photo-1592750475338-74b7b21085ab', 'photo-1591337676887-a217a6970a8a'], { Chip: 'A17 Pro', Display: '6.1-inch Super Retina XDR', Camera: '48MP Main' }, true, false],
  ['iPhone 14', 'iphone', 239999, 219999, 20, ['photo-1591337676887-a217a6970a8a', 'photo-1510557880182-3d4d3cba35a5'], { Chip: 'A15 Bionic', Display: '6.1-inch Super Retina XDR', Camera: '12MP Dual' }, false, true],
  ['iPhone 13', 'iphone', 189999, 0, 8, ['photo-1632661674596-df8be070a5c5', 'photo-1591337676887-a217a6970a8a'], { Chip: 'A15 Bionic', Display: '6.1-inch Super Retina XDR', Camera: '12MP Dual' }, false, false],
  ['iPhone 12 (Open Box)', 'iphone', 139999, 129999, 6, ['photo-1603921326210-6edd2d501ca2', 'photo-1591337676887-a217a6970a8a'], { Chip: 'A14 Bionic', Display: '6.1-inch Super Retina XDR', Condition: 'Open Box' }, false, false],
  ['iPad Pro 12.9-inch (M2)', 'ipad', 329999, 0, 9, ['photo-1544244015-0df4b3ffc6b0', 'photo-1585790050230-5dd28404ccb9'], { Chip: 'Apple M2', Display: '12.9-inch Liquid Retina XDR', Storage: '256GB' }, true, true],
  ['iPad Air (M2)', 'ipad', 219999, 199999, 11, ['photo-1585790050230-5dd28404ccb9', 'photo-1544244015-0df4b3ffc6b0'], { Chip: 'Apple M2', Display: '11-inch Liquid Retina', Storage: '128GB' }, true, false],
  ['iPad 10th Generation', 'ipad', 129999, 0, 18, ['photo-1544244015-0df4b3ffc6b0', 'photo-1585790050230-5dd28404ccb9'], { Chip: 'A14 Bionic', Display: '10.9-inch Liquid Retina', Storage: '64GB' }, false, false],
  ['MacBook Pro 14-inch (M3 Pro)', 'mac', 549999, 529999, 7, ['photo-1517336714731-489689fd1ca8', 'photo-1611186871348-b1ce696e52c9'], { Chip: 'Apple M3 Pro', Display: '14.2-inch Liquid Retina XDR', RAM: '18GB', Storage: '512GB SSD' }, true, true],
  ['MacBook Air 13-inch (M2)', 'mac', 299999, 279999, 10, ['photo-1611186871348-b1ce696e52c9', 'photo-1517336714731-489689fd1ca8'], { Chip: 'Apple M2', Display: '13.6-inch Liquid Retina', RAM: '8GB', Storage: '256GB SSD' }, true, false],
  ['MacBook Air 15-inch (M3)', 'mac', 389999, 0, 5, ['photo-1611186871348-b1ce696e52c9', 'photo-1517336714731-489689fd1ca8'], { Chip: 'Apple M3', Display: '15.3-inch Liquid Retina', RAM: '16GB', Storage: '512GB SSD' }, false, true],
  ['Apple Watch Series 9', 'watch', 119999, 109999, 14, ['photo-1579586337278-3befd40fd17a', 'photo-1546868871-7041f2a55e12'], { Chip: 'S9 SiP', Display: 'Always-On Retina', Case: '45mm GPS' }, true, false],
  ['Apple Watch Ultra 2', 'watch', 229999, 0, 6, ['photo-1546868871-7041f2a55e12', 'photo-1579586337278-3befd40fd17a'], { Chip: 'S9 SiP', Display: 'Always-On Retina', Case: '49mm Titanium' }, false, true],
  ['AirPods Pro (2nd Gen, USB-C)', 'airpods', 64999, 59999, 25, ['photo-1600294037681-c80b4cb5b434', 'photo-1572569511254-d8f925fe2cbb'], { Chip: 'H2', Noise: 'Active Noise Cancellation', Case: 'MagSafe USB-C' }, true, true],
  ['AirPods Max', 'airpods', 139999, 0, 9, ['photo-1505740420928-5e560c06d30e', 'photo-1600294037681-c80b4cb5b434'], { Chip: 'H1', Noise: 'Active Noise Cancellation', Battery: 'Up to 20 hours' }, false, false],
  ['MagSafe Charger', 'accessories', 14999, 12999, 40, ['photo-1601524909162-ae8725290836', 'photo-1583863788434-e58a36330cf0'], { Power: '15W MagSafe', Cable: '1m USB-C', Compatibility: 'iPhone 12 and later' }, false, true],
  ['iPhone 15 Pro Clear Case', 'accessories', 8999, 0, 60, ['photo-1601593346740-925612772716', 'photo-1592750475338-74b7b21085ab'], { Material: 'Clear polycarbonate', MagSafe: 'Yes', Protection: 'Drop tested' }, false, false],
  ['USB-C to Lightning Cable (2m)', 'accessories', 5999, 4999, 80, ['photo-1583863788434-e58a36330cf0', 'photo-1601524909162-ae8725290836'], { Length: '2m', Connector: 'USB-C to Lightning', Power: 'Fast charge' }, false, false],
];

export async function runSeed() {
  await Promise.all([Category.deleteMany({}), Brand.deleteMany({}), Product.deleteMany({}), Banner.deleteMany({}), Coupon.deleteMany({})]);
  const brand = await Brand.create({ name: 'Apple', slug: 'apple' });
  const catMap = {};
  for (const c of categories) {
    const doc = await Category.create(c);
    catMap[c.slug] = doc._id;
  }
  for (const [name, catSlug, price, salePrice, stock, imageIds, specs, featured, bestSeller] of products) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    await Product.create({
      name,
      slug,
      brand: brand._id,
      brandName: 'Apple',
      category: catMap[catSlug],
      price,
      salePrice,
      stock,
      sku: `AA-${slug.toUpperCase().slice(0, 12)}`,
      images: imageIds.map(img),
      variants: [
        { color: 'Natural Titanium', storage: '256GB', condition: 'New', price, stock },
        { color: 'Black', storage: '128GB', condition: 'New', price: Math.max(0, price - 20000), stock },
      ],
      description: `${name} — genuine Apple product with warranty support. Check the specs table for full details and choose your colour, storage and condition before adding to cart.`,
      specs,
      isFeatured: featured,
      isBestSeller: bestSeller,
      isActive: true,
      rating: 4.5,
      numReviews: 0,
    });
  }
  await Banner.create([
    { title: 'iPhone 15 Pro Max', subtitle: 'Titanium. So strong. So light. So Pro.', image: img('photo-1592750475338-74b7b21085ab'), ctaText: 'Shop iPhone', ctaLink: '/category/iphone', order: 1 },
    { title: 'MacBook Pro with M3 Pro', subtitle: 'Mind-blowing. Head-turning.', image: img('photo-1517336714731-489689fd1ca8'), ctaText: 'Shop Mac', ctaLink: '/category/mac', order: 2 },
  ]);
  await Coupon.create([
    { code: 'WELCOME10', type: 'percent', value: 10, usageLimit: 100, isActive: true },
    { code: 'FLAT5000', type: 'fixed', value: 5000, usageLimit: 50, isActive: true },
  ]);
  await Settings.findOneAndUpdate(
    {},
    {
      storeName: process.env.STORE_NAME || 'Apple Ahmad',
      whatsappNumber: process.env.WHATSAPP_NUMBER || '',
      deliveryCharge: Number(process.env.DELIVERY_CHARGE || 300),
      freeDeliveryThreshold: Number(process.env.FREE_DELIVERY_THRESHOLD || 50000),
    },
    { upsert: true, new: true }
  );
  return { categories: 6, products: 18, banners: 2, coupons: 2 };
}
