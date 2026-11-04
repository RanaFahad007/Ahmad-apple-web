import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout.jsx';
import { ErrorBoundary } from './components/ui.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Login = lazy(() => import('./pages/Auth.jsx').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Auth.jsx').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/Auth.jsx').then((m) => ({ default: m.ForgotPassword })));
const About = lazy(() => import('./pages/Static.jsx').then((m) => ({ default: m.About })));
const FAQ = lazy(() => import('./pages/Static.jsx').then((m) => ({ default: m.FAQ })));
const Returns = lazy(() => import('./pages/Static.jsx').then((m) => ({ default: m.Returns })));
const Privacy = lazy(() => import('./pages/Static.jsx').then((m) => ({ default: m.Privacy })));
const Contact = lazy(() => import('./pages/Static.jsx').then((m) => ({ default: m.Contact })));
const NotFound = lazy(() => import('./pages/Static.jsx').then((m) => ({ default: m.NotFound })));

const AdminLayout = lazy(() => import('./admin/AdminLayout.jsx'));
const AdminLogin = lazy(() => import('./admin/AdminLayout.jsx').then((m) => ({ default: m.AdminLogin })));
const Dashboard = lazy(() => import('./admin/Dashboard.jsx'));
const ProductList = lazy(() => import('./admin/Products.jsx').then((m) => ({ default: m.ProductList })));
const ProductForm = lazy(() => import('./admin/Products.jsx').then((m) => ({ default: m.ProductForm })));
const CategoriesBrands = lazy(() => import('./admin/OtherPages.jsx').then((m) => ({ default: m.CategoriesBrands })));
const OrdersPage = lazy(() => import('./admin/OtherPages.jsx').then((m) => ({ default: m.OrdersPage })));
const CustomersPage = lazy(() => import('./admin/OtherPages.jsx').then((m) => ({ default: m.CustomersPage })));
const ReviewsPage = lazy(() => import('./admin/OtherPages.jsx').then((m) => ({ default: m.ReviewsPage })));
const CouponsPage = lazy(() => import('./admin/OtherPages.jsx').then((m) => ({ default: m.CouponsPage })));
const BannersPage = lazy(() => import('./admin/OtherPages.jsx').then((m) => ({ default: m.BannersPage })));
const MessagesPage = lazy(() => import('./admin/OtherPages.jsx').then((m) => ({ default: m.MessagesPage })));
const SettingsPage = lazy(() => import('./admin/OtherPages.jsx').then((m) => ({ default: m.SettingsPage })));

function Loading() { return <p className="p-10 text-center">Loading…</p>; }

// Every route change starts at the top, so a page you go back to is never
// left sitting at a blank-looking scroll position from the previous page.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function ProductFormWrapper() {
  const { id } = useParams();
  return <ProductForm id={id} />;
}

// The error boundary must live INSIDE the router (its fallback renders a
// <Link>), and it must reset on navigation — otherwise one crashed page
// left every later page blank, because the boundary stayed in its error
// state even after going back home.
function RouteErrorBoundary({ children }) {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteErrorBoundary>
        <ScrollToTop />
        <Toaster position="top-center" />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/category/:slug" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin is intentionally not linked anywhere on the public site. */}
            <Route path="/admin-ahmad/login" element={<AdminLogin />} />
            <Route path="/admin-ahmad" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm id="new" />} />
              <Route path="products/:id" element={<ProductFormWrapper />} />
              <Route path="categories" element={<CategoriesBrands />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="banners" element={<BannersPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}
