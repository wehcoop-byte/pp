// server/services/jobs.ts
import { Firestore } from "@google-cloud/firestore";
import { Job } from "../types/Job.js";

const firestore = new Firestore({ ignoreUndefinedProperties: true });
const collection = firestore.collection("jobs");

export async function createJob(data: Partial<Job>): Promise<Job> {
  const docRef = collection.doc();
  const job: Job = {
    id: docRef.id,
    status: "created",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    styleId: data.styleId!,
    petName: data.petName || "",
    email: data.email || "",
    ip: data.ip || "",
    ...data
  } as Job;
  await docRef.set(job);
  return job;
}

export async function getJobById(id: string): Promise<Job | null> {
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  return doc.data() as Job;
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<void> {
  // @ts-ignore
  patch.updatedAt = new Date().toISOString();
  await collection.doc(id).set(patch, { merge: true });
}