# Apple Ahmad — Apple Products E-commerce (MERN)

A complete, production-ready e-commerce site for Apple products: iPhones, iPads,
MacBooks, Apple Watch, AirPods and accessories. React (Vite) + Express + MongoDB.

## What is included

- **Customer site:** Home with hero/categories/New Arrivals/Best Sellers, Shop with
  filters + sorting + pagination, category pages, product detail (image gallery
  with zoom, variants for colour/storage/condition, specs table, reviews, related
  products), search with suggestions, cart (guest + logged-in), wishlist,
  checkout (COD, Bank Transfer, Easypaisa, JazzCash, payment screenshot field),
  order confirmation + WhatsApp order button, auth, profile with addresses and
  order tracking, reviews only after purchase, About/Contact/FAQ/Return & Warranty/
  Privacy pages, dark mode, mobile bottom nav, responsive 1–4 column grids.
- **Admin panel (hidden from the public site):** only at `/admin-ahmad`, login at
  `/admin-ahmad/login`. No menu or footer link points to it. Every `/api/admin/*`
  route is also protected server-side by auth + admin-role middleware, with
  rate limiting on admin login. Dashboard, products (multi-image upload via
  Cloudinary, preview/reorder, duplicate, bulk delete), categories & brands,
  orders (status flow, tracking number, mark paid, payment screenshot, print
  invoice view), customers (block/unblock + order history), reviews (approve/
  delete), coupons, banners/hero slider, messages, settings.
- **API:** RESTful, consistent `{ success, message, data, pagination }` format,
  centralized error handler, async wrapper, pagination on lists, helmet, CORS,
  rate limiting, mongo-sanitize, JWT in an httpOnly cookie.

## Quick start

### 1. Server

```bash
cd server
npm install
cp .env.example .env
# Fill in .env with YOUR values (see below). Never commit .env.
npm run seed        # 6 categories, 18 Apple products, 2 banners, 2 coupons
npm run seed:admin  # first admin from ADMIN_EMAIL / ADMIN_PASSWORD in .env
npm run dev         # http://localhost:5000 (health: /api/health)
```

### 2. Client

```bash
cd client
npm install
npm run dev         # http://localhost:5173 (API proxied to :5000)
npm run build       # production build
```

## Environment variables (server/.env)

See `server/.env.example` for the full list with placeholders. Key points:

- **Database:** set `MONGO_URI` — or `MONGODB_URI` (both are accepted;
  `MONGO_URI` wins). The `.env` file supplied for this project contains only
  MongoDB keys, so you must still add the values below yourself.
- `JWT_SECRET` — long random string. Required in production; the server refuses
  to start in production without it.
- `JWT_EXPIRE`, `COOKIE_EXPIRE_DAYS`, `PORT`, `CLIENT_URL`
  (comma-separated allowed origins).
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` —
  required only for image uploads. Seed data uses public image URLs, so the site
  works without Cloudinary; uploads return a clear 503 until it is configured.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — used only by `npm run seed:admin`.
- `STORE_NAME`, `WHATSAPP_NUMBER`, `DELIVERY_CHARGE`, `FREE_DELIVERY_THRESHOLD`
  — defaults, also editable later in Admin → Settings.

**No secret is hardcoded anywhere in this repo.** `.env` is gitignored in both
server and root. The supplied Atlas credentials file was used only as runtime
environment during a local test and was never copied into this project.

## Admin access

1. Run `npm run seed:admin` in `server/` (after setting `ADMIN_EMAIL` /
   `ADMIN_PASSWORD`).
2. Open `http://localhost:5173/admin-ahmad/login` and log in with those details.
3. Non-admin users who visit `/admin-ahmad` are redirected to the home page;
   logged-out visitors go to the admin login page. Hiding the URL is not the
   security — the backend enforces it on every admin route.

## Seeding note (verified)

- Client production build: **passes** (`npm run build` in `client/`).
- Server files: syntax-checked, and the app module imports cleanly.
- Live Atlas seeding could **not** run from this VM: the VM's DNS resolver
  refuses Atlas SRV lookups (`querySrv EREFUSED`), the same limitation seen on
  earlier projects here. The seed script itself is complete and will run from
  your own machine, or on Render/Railway, where Atlas DNS resolves normally.
  Run `npm run seed` there after setting `MONGO_URI`/`MONGODB_URI`.

## Deploy

- **Client → Vercel:** import the `client/` folder, set the build command to
  `npm run build` and output to `dist`. Set `VITE_API_URL` only if you stop
  using the dev proxy — in production, point your domain/API so `/api` reaches
  the server, or set the axios `baseURL` in `client/src/lib/api.js`.
- **Server → Render/Railway:** set the root to `server/`, start command
  `npm start`, and add all `server/.env` variables in the host dashboard
  (never in the repo). Set `CLIENT_URL` to your Vercel domain and
  `NODE_ENV=production`.

## Coupons seeded

- `WELCOME10` — 10% off, 100 uses
- `FLAT5000` — Rs 5,000 off, 50 uses

## Forgot password

Without an SMTP provider configured, the reset token is hashed in the database
and logged server-side only (never returned to the client), and the response
stays generic. Add an email provider and replace the `console.log` in
`server/src/controllers/authController.js` (`forgotPassword`) with a real send.
