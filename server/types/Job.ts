// server/types/Job.ts
export type JobStatus =
  | "created"
  | "generating"
  | "generated"
  | "locked"
  | "awaiting_payment"
  | "paid"
  | "sent_to_printify"
  | "fulfilled"
  | "error";

export interface LikenessAttempt {
  attempt: number;
  score: number;
  generatedImageUrl: string;
}

export interface Job {
  id: string;
  email?: string;
  petName?: string;
  styleId: string;
  ip?: string;

  status: JobStatus;
  originalUrl?: string;
  previewUrl?: string;
  printReadyUrl?: string;

  likeness?: {
    score: number;
    threshold: number;
    attempts: LikenessAttempt[];
  };

  shopifyOrderId?: string;
  shopifyOrderNumber?: string;
  printifyOrderId?: string;

  lockTweaks?: any;
  error?: string;

  createdAt: string;
  updatedAt: string;
}