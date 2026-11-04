import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { post, usePageTitle } from '../lib/api.js';

function Page({ title, children }) {
  usePageTitle(title);
  return <div className="mx-auto max-w-3xl py-8"><h1 className="text-3xl font-extrabold">{title}</h1><div className="card mt-5 space-y-4 p-6 text-[#d1d1d6] dark:text-neutral-300">{children}</div></div>;
}

export const About = () => (
  <Page title="About Us">
    <p>Apple Ahmad is a Pakistan-based store for genuine Apple products — iPhones, iPads, MacBooks, Apple Watch, AirPods and accessories. Every device is checked before dispatch, and our team is available on WhatsApp for honest advice before you buy.</p>
    <p>We offer Cash on Delivery, bank transfer, Easypaisa and JazzCash, with nationwide delivery.</p>
  </Page>
);

export const FAQ = () => (
  <Page title="Frequently Asked Questions">
    {[
      ['Are your products genuine?', 'Yes. We sell genuine Apple products and check every device before dispatch.'],
      ['Do you offer Cash on Delivery?', 'Yes, COD is available nationwide.'],
      ['How long does delivery take?', 'Typically 2–4 working days depending on your city.'],
      ['What is the return policy?', 'See our Return & Warranty Policy page — 7 days on eligible items.'],
    ].map(([q, a]) => <div key={q}><p className="font-bold text-neutral-900 dark:text-white">{q}</p><p>{a}</p></div>)}
  </Page>
);

export const Returns = () => (
  <Page title="Return & Warranty Policy">
    <p>Eligible items can be returned within 7 days of delivery if unused and in original packaging. Devices with physical damage, or accessories that have been opened and used, may not be eligible.</p>
    <p>Apple warranty terms apply to genuine Apple products. Contact us with your order number and we will guide you through the claim.</p>
  </Page>
);

export const Privacy = () => (
  <Page title="Privacy Policy">
    <p>We collect only what is needed to fulfil your order: name, contact details and delivery address. We never sell your data. Payment screenshots are used only to verify bank-transfer orders.</p>
    <p>Contact us to request deletion of your account data.</p>
  </Page>
);

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  usePageTitle('Contact Us');
  const submit = async (e) => {
    e.preventDefault();
    try { await post('/messages', form); toast.success('Message sent. We will reply soon.'); setForm({ name: '', email: '', subject: '', message: '' }); } catch (err) { toast.error(err.message); }
  };
  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-extrabold">Contact Us</h1>
      <form onSubmit={submit} className="card mt-5 space-y-3 p-5">
        <input className="field" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="field" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <textarea className="field" rows={4} placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        <button className="btn w-full">Send Message</button>
      </form>
    </div>
  );
}

export function NotFound() {
  usePageTitle('Page Not Found');
  return <div className="py-20 text-center"><h1 className="text-4xl font-extrabold">404</h1><p className="mt-2 text-[#98989a]">This page does not exist.</p><a href="/" className="btn mt-5 inline-flex">Go home</a></div>;
}
