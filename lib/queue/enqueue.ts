import { randomUUID } from "crypto";
import { db } from "@/db";
import { jobs, type JobType } from "@/db/schema";

export async function enqueueJob(
  type: JobType,
  payload: Record<string, unknown>,
  options?: { delayMs?: number; maxAttempts?: number }
) {
  const now = new Date();
  const scheduledAt = new Date(now.getTime() + (options?.delayMs ?? 0));

  const [job] = await db
    .insert(jobs)
    .values({
      id: randomUUID(),
      type,
      status: "pending",
      payload: JSON.stringify(payload),
      attempts: 0,
      maxAttempts: options?.maxAttempts ?? 3,
      scheduledAt: scheduledAt.toISOString(),
      createdAt: now.toISOString(),
    })
    .returning();

  return job;
}
