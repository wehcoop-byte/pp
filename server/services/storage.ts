// server/services/storage.ts
import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const originalsBucket = storage.bucket(process.env.GCS_BUCKET_ORIGINALS || "petpawtrait-originals");
const previewsBucket = storage.bucket(process.env.GCS_BUCKET_PREVIEWS || "petpawtrait-previews");
const printReadyBucket = storage.bucket(process.env.GCS_BUCKET_PRINT_READY || "petpawtrait-print-ready");

// Helper to generate a signed URL (valid for 48 hours)
async function getShareableUrl(file: any): Promise<string> {
  const [url] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 48 * 60 * 60 * 1000, // 48 hours
  });
  return url;
}

export async function uploadOriginal(jobId: string, base64: string): Promise<string> {
  const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
  const file = originalsBucket.file(`${jobId}.jpg`);
  await file.save(buffer, { contentType: "image/jpeg" });
  // Originals stay private, but we return a signed URL just in case the frontend needs it
  return getShareableUrl(file);
}

export async function uploadPreview(jobId: string, sourceUrl: string): Promise<string> {
  let file;
  
  if (sourceUrl.startsWith("data:")) {
    // Handle Base64 input
    const buffer = Buffer.from(sourceUrl.replace(/^data:image\/\w+;base64,/, ""), "base64");
    file = previewsBucket.file(`${jobId}-preview.jpg`);
    await file.save(buffer, { contentType: "image/jpeg" });
  } else {
    // Handle Text/URL input (fallback)
    file = previewsBucket.file(`${jobId}-preview.txt`);
    await file.save(Buffer.from(sourceUrl, "utf8"));
  }

  // Return a Signed URL so the frontend can actually display it!
  return getShareableUrl(file);
}

export async function uploadPrintReady(jobId: string, sourceUrl: string): Promise<string> {
  // For print ready, we might just save the URL or the file. 
  // Assuming we save a file for download:
  const file = printReadyBucket.file(`${jobId}-print.png`);
  
  // If sourceUrl is base64, save as image. If it's a URL, we'd typically fetch it first.
  // For simplicity here, assuming base64 or string content:
  if (sourceUrl.startsWith("data:")) {
      const buffer = Buffer.from(sourceUrl.replace(/^data:image\/\w+;base64,/, ""), "base64");
      await file.save(buffer, { contentType: "image/png" });
  } else {
      await file.save(Buffer.from(sourceUrl, "utf8"));
  }

  return getShareableUrl(file);
}

export async function downloadOriginal(jobId: string): Promise<string> {
  const file = originalsBucket.file(`${jobId}.jpg`);
  const [buffer] = await file.download();
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}