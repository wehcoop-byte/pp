// server/services/jobRepo.ts
import type { Job } from "../types/Job.js";


// Replace with Firestore persistence
const mem = new Map<string, Job>();

export async function getJobById(id: string): Promise<Job | null> {
  return mem.get(id) || null;
}

export async function saveJob(job: Job) {
  mem.set(job.id, job);
}

export async function updateJobPaid(id: string, productType: "digital_only" | "print_bundle") {
  const j = mem.get(id);
  if (!j) return;
  j.status = "paid";
  j.productType = productType;
  mem.set(id, j);
}
