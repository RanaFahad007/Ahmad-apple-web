import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { formatPKR, usePageTitle } from '../lib/api.js';

export default function OrderSuccess() {
  const { id } = useParams();
  const order = useLocation().state?.order;
  usePageTitle('Order Confirmed');
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <p className="text-5xl">✅</p>
      <h1 className="mt-4 text-3xl font-extrabold">Order confirmed!</h1>
      <p className="mt-2 text-[#98989a]">Thank you for shopping with Apple Ahmad. We will call you to confirm your order.</p>
      {order && (
        <div className="card mt-6 p-5 text-left text-sm">
          <p><b>Order number:</b> {order.orderNumber}</p>
          <p><b>Total:</b> {formatPKR(order.total)}</p>
          <p><b>Payment:</b> {order.paymentMethod} • <b>Status:</b> {order.status}</p>
          <p><b>Delivery to:</b> {order.shippingAddress?.fullName}, {order.shippingAddress?.city}</p>
        </div>
      )}
      <p className="mt-3 text-xs text-[#98989a]">Order ID: {id}</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/profile" className="btn">Track My Orders</Link>
        <Link to="/shop" className="btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}
