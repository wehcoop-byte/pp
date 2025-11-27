import React, { useState } from "react";
import GlassCard from "../components/GlassCard";
import StyleSelector, { STYLES } from "../components/StyleSelector";
import { postJson } from "../api/client";

export default function BuilderPage(){
  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState<string>(STYLES[0].id);
  const [jobId, setJobId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onUpload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      // Ask backend for resumable upload
      const create = await postJson<{ uploadUrl:string; objectKey:string }>("/api/uploads/resumable", {
        filename: file.name, contentType: file.type || "image/jpeg"
      });
      await fetch(create.uploadUrl, { method: "PUT", headers: { "content-type": file.type || "application/octet-stream" }, body: file });

      // Kick off a generation job (simplified)
      const gen = await postJson<{ jobId:string }>("/api/generate", { styleId: style, originalKey: create.objectKey });
      setJobId(gen.jobId);

      // DEV: call preview endpoint using a tiny base64 (real flow: worker creates preview)
      const tiny = await file.arrayBuffer().then(b => Buffer.from(b).toString("base64").slice(0, 200000)); // dev only, trim
      await postJson("/api/preview", { jobId: gen.jobId, buffer: tiny, contentType: "image/jpeg" });
      setPreviewUrl(`/api/preview/${gen.jobId}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Create your pawtrait</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
            <StyleSelector value={style} onChange={setStyle} />
            <div className="flex gap-3">
              <button onClick={onUpload} disabled={!file || busy}
                className="rounded-xl px-5 py-3 font-semibold"
                style={{ background:"linear-gradient(135deg,#F4953E,#d57c2e)", color:"#1a0e24" }}>
                {busy ? "Working..." : "Generate preview"}
              </button>
              {jobId && <span className="text-sm opacity-80">Job: {jobId}</span>}
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-sm opacity-80 mb-2">Preview</div>
          {previewUrl ? <img src={previewUrl} alt="preview" className="rounded-xl2" /> : <div className="opacity-70">No preview yet.</div>}
        </GlassCard>
      </div>
    </main>
  );
}
