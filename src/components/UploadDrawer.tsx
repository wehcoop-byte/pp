import React, { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function UploadDrawer({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [styleId, setStyleId] = useState<string>("royal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
      setIsSubmitting(false);
    }
  }, [open]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function onSubmit() {
    if (!file) return;
    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append("image", file);
      form.append("styleId", styleId);

      // POST to your backend. Adjust path if your proxy differs.
      const res = await fetch("/api/generate", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to generate");
      }

      // You likely return a jobId or image URL. Use it however your UI expects.
      const data = await res.json();
      // TODO: route to a progress screen or show a toast
      // For now, just close and clear the hash.
      window.history.replaceState({}, "", window.location.pathname + window.location.search);
      onClose();
      // Optionally: navigate to a /progress view, or set state in a global store.
      console.log("Generation started:", data);
    } catch (err) {
      console.error(err);
      alert("Generation request failed. Check your backend /api/generate.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h3 className="text-slate-100 font-semibold">Start a portrait</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* File picker */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">Upload a photo</label>
            <div
              className="border border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-slate-600 cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 rounded-lg object-contain"
                />
              ) : (
                <>
                  <div className="text-3xl">📷</div>
                  <div className="text-slate-400 text-sm">Click to choose a file</div>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Clear, front-facing shots with good lighting work best.
            </p>
          </div>

          {/* Style select */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">Style</label>
            <select
              value={styleId}
              onChange={(e) => setStyleId(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 text-slate-100 px-3 py-2"
            >
              <option value="royal">Royal Classic</option>
              <option value="minimal">Modern Minimal</option>
              <option value="pop">Bold Pop</option>
              <option value="watercolor">Watercolor</option>
              <option value="surreal">Surrealist</option>
            </select>
          </div>

          {/* Action */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              disabled={!file || isSubmitting}
              onClick={onSubmit}
              className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-semibold disabled:opacity-50 hover:bg-amber-300"
            >
              {isSubmitting ? "Starting..." : "Generate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
