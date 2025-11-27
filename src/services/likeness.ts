// src/services/likeness.ts
export async function scoreLikeness(originalUrl: string, generatedUrl: string): Promise<number> {
  // Either call an embedding model or your CLIP-like scorer.
  // Return a float 0–1.
  throw new Error("scoreLikeness not implemented");
}
