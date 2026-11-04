import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { del, imageUrl, publicIdOf } from '../lib/api.js';
import { uploadImage } from '../lib/uploadImage.js';

// Reusable image uploader for the admin panel (and checkout screenshots).
//
// Images are uploaded one by one, straight from the browser to Cloudinary
// (signed direct upload), never through the Express server — so Vercel's
// 4.5MB function payload limit cannot trigger, even for 3–5MB phone photos
// (which are compressed to ~1600px / under ~1MB in the browser first).
//
// Props:
//   images        — [{ url, publicId }] (plain URL strings also accepted)
//   onChange      — called with the new [{ url, publicId }] list
//   folder        — Cloudinary folder for the signature route
//   multiple      — false for category/brand/banner/logo (single image)
//   signaturePath — override for checkout: '/upload-signature-payments'
//   deleteOnRemove— admin only: also delete the file from Cloudinary
//   onBusyChange  — (busy: boolean) so a parent form can disable Save
// The first image is the main image. Drag to reorder on desktop; the
// ↑ / ↓ buttons do the same on touch screens.
export default function ImageUploader({
  images = [],
  onChange,
  folder = 'products',
  multiple = true,
  signaturePath,
  deleteOnRemove = false,
  onBusyChange,
  buttonLabel = '📷 Add images',
}) {
  const [items, setItems] = useState(() =>
    (Array.isArray(images) ? images : []).map((img) => ({
      url: imageUrl(img),
      publicId: publicIdOf(img),
      status: 'done',
      progress: 100,
      error: '',
      file: null,
      preview: imageUrl(img),
    }))
  );
  const inputRef = useRef(null);
  const dragIndex = useRef(null);

  // Keep in step when the parent loads a product/category to edit. Only
  // sync while nothing is uploading, so an in-flight upload is never lost.
  const prevImages = useRef(null);
  if (prevImages.current !== images && !items.some((i) => i.status === 'uploading')) {
    prevImages.current = images;
    setItems((Array.isArray(images) ? images : []).map((img) => ({
      url: imageUrl(img),
      publicId: publicIdOf(img),
      status: 'done',
      progress: 100,
      error: '',
      file: null,
      preview: imageUrl(img),
    })));
  }

  const emit = (next) => onChange(next.filter((i) => i.status === 'done' && i.url).map((i) => ({ url: i.url, publicId: i.publicId })));

  const setBusy = (busy) => onBusyChange && onBusyChange(busy);

  const uploadOne = async (item, list) => {
    const update = (patch) => {
      const next = list.map((x) => (x === item ? { ...x, ...patch } : x));
      setItems(next);
      return next;
    };
    try {
      const res = await uploadImage(item.file, folder, (p) => update({ progress: p }), { signaturePath });
      const next = update({ status: 'done', url: res.url, publicId: res.publicId, preview: res.url, progress: 100, error: '' });
      emit(next);
    } catch (err) {
      update({ status: 'error', error: err.message });
      toast.error(err.message);
    }
  };

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const picked = multiple ? files : files.slice(0, 1);
    const base = multiple ? items : [];
    const fresh = picked.map((file) => ({
      url: '',
      publicId: '',
      status: 'uploading',
      progress: 0,
      error: '',
      file,
      preview: URL.createObjectURL(file),
    }));
    const list = [...base, ...fresh];
    setItems(list);
    setBusy(true);
    // One by one: kinder to a mobile connection than a burst of parallel
    // uploads, and each file gets its own progress bar.
    for (const item of fresh) await uploadOne(item, list);
    setBusy(false);
  };

  const retry = async (item) => {
    setItems((cur) => cur.map((x) => (x === item ? { ...x, status: 'uploading', progress: 0, error: '' } : x)));
    setBusy(true);
    await uploadOne({ ...item, status: 'uploading' }, items);
    setBusy(false);
  };

  const remove = async (idx) => {
    const item = items[idx];
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    emit(next);
    if (deleteOnRemove && item.publicId) {
      try { await del('/admin/images', { public_id: item.publicId }); } catch { /* already gone on the server diff — not fatal */ }
    }
  };

  const move = (idx, dir) => {
    const next = [...items];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
    emit(next);
  };

  const uploading = items.some((i) => i.status === 'uploading');

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <div
            key={`${item.preview}-${i}`}
            draggable={item.status === 'done'}
            onDragStart={() => { dragIndex.current = i; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex.current === null || dragIndex.current === i) return;
              const next = [...items];
              const [moved] = next.splice(dragIndex.current, 1);
              next.splice(i, 0, moved);
              dragIndex.current = null;
              setItems(next);
              emit(next);
            }}
            className="relative w-24 shrink-0 overflow-hidden rounded-2xl border bg-[var(--card2)]"
          >
            <img src={item.preview} alt="" className="aspect-square w-full object-cover" loading="lazy" />
            {i === 0 && multiple && <span className="absolute left-1 top-1 rounded-full bg-[#007aff] px-2 py-0.5 text-[10px] font-bold text-white">Main</span>}
            {item.status === 'uploading' && (
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/20"><div className="h-full bg-[#007aff] transition-all" style={{ width: `${item.progress}%` }} /></div>
            )}
            {item.status === 'uploading' && <p className="p-1 text-center text-[10px]">Uploading {item.progress}%…</p>}
            {item.status === 'error' && (
              <div className="p-1 text-center">
                <p className="text-[10px] text-red-500">{item.error}</p>
                <button type="button" className="text-[11px] font-bold text-accent" onClick={() => retry(item)}>Retry</button>
              </div>
            )}
            {item.status === 'done' && (
              <div className="flex justify-center gap-1 p-1">
                <button type="button" aria-label="Move image up" className="rounded-full bg-black/50 px-2 py-1 text-xs text-white" onClick={() => move(i, -1)}>↑</button>
                <button type="button" aria-label="Move image down" className="rounded-full bg-black/50 px-2 py-1 text-xs text-white" onClick={() => move(i, 1)}>↓</button>
                <button type="button" aria-label="Remove image" className="rounded-full bg-red-600 px-2 py-1 text-xs text-white" onClick={() => remove(i)}>✕</button>
              </div>
            )}
          </div>
        ))}
        {(multiple || items.length === 0) && (
          <label className="flex min-h-[96px] w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed p-2 text-center text-xs font-semibold">
            <span className="text-2xl">📷</span>
            {uploading ? 'Uploading…' : buttonLabel}
            <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={onFiles} />
          </label>
        )}
        {!multiple && items.length > 0 && (
          <label className="flex min-h-[44px] cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold">
            📷 Replace image
            <input type="file" accept="image/*" className="hidden" onChange={onFiles} />
          </label>
        )}
      </div>
      {uploading && <p className="text-xs text-[var(--muted)]">Uploading… please wait before saving, so every photo is attached.</p>}
      {!multiple && items.length > 0 && <p className="text-xs text-[var(--muted)]">Tap 📷 again to replace this image.</p>}
    </div>
  );
}
