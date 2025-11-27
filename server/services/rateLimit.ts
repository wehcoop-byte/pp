// server/services/rateLimit.ts
import { Firestore } from "@google-cloud/firestore";

const firestore = new Firestore();
const collection = firestore.collection("rateLimits");
const MAX = Number(process.env.RATE_LIMIT_MAX_GENERATIONS || 3);

export async function checkAndIncrementRateLimit(ip: string): Promise<{ ok: boolean; count: number }> {
  const docRef = collection.doc(ip.replace(/[^a-z0-9]/gi, "_")); // Sanitize IP for doc ID
  const doc = await docRef.get();

  if (!doc.exists) {
    await docRef.set({ count: 1, createdAt: new Date().toISOString() });
    return { ok: true, count: 1 };
  }

  const data = doc.data() as any;
  const count = (data.count || 0) + 1;

  if (count > MAX) {
    return { ok: false, count };
  }

  await docRef.update({ count, updatedAt: new Date().toISOString() });
  return { ok: true, count };
}