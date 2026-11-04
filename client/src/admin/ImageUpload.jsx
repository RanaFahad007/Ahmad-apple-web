import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { post } from '../lib/api.js';

// Upload-from-phone button for admin forms that previously only had an
// "Image URL" text field. Tapping it opens the phone's gallery/camera
// picker (accept="image/*"), uploads to Cloudinary via /upload, and hands
// the returned URL back to the form — the URL field still works too, so
// either way can be used.
export default function ImageUpload({ value, onUploaded, buttonLabel = '📷 Upload image' }) {
  const [uploading, setUploading] = useState(false);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('images', file);
      const res = await post('/upload', fd);
      const url = (res.data || [])[0];
      if (!url) throw new Error('Upload returned no image URL');
      onUploaded(url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <label className="btn-outline cursor-pointer !py-2 text-sm">
        {uploading ? 'Uploading…' : buttonLabel}
        <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={uploading} />
      </label>
      {value ? <img src={value} alt="" className="h-12 w-12 rounded-xl object-cover" onError={(ev) => { ev.target.style.display = 'none'; }} /> : null}
    </span>
  );
}
