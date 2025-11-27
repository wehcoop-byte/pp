// server/services/storage_ext.ts
import { Storage } from "@google-cloud/storage";
import { env } from "../env";

const storage = new Storage();

type BucketName = "originals" | "previews" | "printready";

export const buckets: Record<BucketName, ReturnType<Storage["bucket"]>> = {
  originals:  storage.bucket(env.GCS_BUCKET_ORIGINALS),
  previews:   storage.bucket(env.GCS_BUCKET_PREVIEWS),
  // ✅ consistent name that actually exists in env.ts
  printready: storage.bucket(env.GCS_BUCKET_PRINTREADY),
};

/** Download an object as a Buffer from the selected bucket (defaults to originals). */
export async function storageGetBuffer(
  objectKey: string,
  bucket: BucketName = "originals"
): Promise<Buffer> {
  const [buf] = await buckets[bucket].file(objectKey).download();
  return buf;
}

/** Upload a Buffer to a given bucket/key with sensible defaults. */
export async function storagePutBuffer(
  bucket: BucketName,
  key: string,
  buffer: Buffer,
  contentType = "image/jpeg",
  cacheControl = "private, max-age=31536000"
): Promise<string> {
  const file = buckets[bucket].file(key);
  await file.save(buffer, {
    resumable: false,
    metadata: { contentType, cacheControl },
  });
  return key;
}

/** Convenience wrapper: write final print-ready asset. */
export async function putPrintReady(
  key: string,
  buffer: Buffer,
  contentType = "image/jpeg"
): Promise<string> {
  return storagePutBuffer("printready", key, buffer, contentType, "private, max-age=31536000");
}

/** Check if an object exists. */
export async function storageExists(
  bucket: BucketName,
  key: string
): Promise<boolean> {
  const [exists] = await buckets[bucket].file(key).exists();
  return !!exists;
}

/** Create a time-limited signed URL for READ access (keep off the client unless you must). */
export async function getReadSignedUrl(
  bucket: BucketName,
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const [url] = await buckets[bucket]
    .file(key)
    .getSignedUrl({ action: "read", expires: Date.now() + expiresInSeconds * 1000 });
  return url;
}

/** Delete an object (useful for cleanup in tests). */
export async function storageDelete(
  bucket: BucketName,
  key: string
): Promise<void> {
  await buckets[bucket].file(key).delete({ ignoreNotFound: true });
}
