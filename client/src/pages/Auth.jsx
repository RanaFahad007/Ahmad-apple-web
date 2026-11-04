import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { post, usePageTitle } from '../lib/api.js';
import { useAuthStore } from '../store/useStore.js';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  usePageTitle('Login');
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await post('/auth/login', form);
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}`);
      navigate('/profile');
    } catch (err) { toast.error(err.message); }
  };
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-3xl font-extrabold">Login</h1>
      <form onSubmit={submit} className="card mt-5 space-y-3 p-5">
        <input className="field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="field" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn w-full">Login</button>
        <p className="text-center text-sm text-[#98989a]">
          <Link to="/forgot-password" className="text-accent">Forgot password?</Link> • No account? <Link to="/register" className="text-accent">Register</Link>
        </p>
      </form>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  usePageTitle('Register');
  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await post('/auth/register', form);
      setAuth(res.data.user, res.data.token);
      toast.success('Account created');
      navigate('/profile');
    } catch (err) { toast.error(err.message); }
  };
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-3xl font-extrabold">Create account</h1>
      <form onSubmit={submit} className="card mt-5 space-y-3 p-5">
        <input className="field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="field" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="field" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn w-full">Register</button>
        <p className="text-center text-sm text-[#98989a]">Already have an account? <Link to="/login" className="text-accent">Login</Link></p>
      </form>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  usePageTitle('Forgot Password');
  const submit = async (e) => {
    e.preventDefault();
    try { await post('/auth/forgot-password', { email }); setDone(true); } catch (err) { toast.error(err.message); }
  };
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-3xl font-extrabold">Forgot password</h1>
      {done ? (
        <p className="card mt-5 p-5 text-sm">If an account exists for that email, reset instructions have been sent. (In this build without an SMTP provider configured, the reset token is logged server-side — see the README.)</p>
      ) : (
        <form onSubmit={submit} className="card mt-5 space-y-3 p-5">
          <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn w-full">Send reset link</button>
        </form>
      )}
    </div>
  );
}
