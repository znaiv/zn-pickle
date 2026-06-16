import { eq, and, lte, asc } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { jobs, type JobType } from "@/db/schema";
import { tryStageNextMatch } from "@/lib/session/manager";

async function handlePlayerCheckIn(payload: { sessionId: string; playerId: string }) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, payload.sessionId))
    .limit(1);

  if (!session || session.status !== "active") {
    return { message: "Session is ended; no match staging performed", ...payload };
  }

  await tryStageNextMatch(payload.sessionId);
  return { message: "Player checked in and queue evaluated", ...payload };
}

async function handleMatchStage(payload: { sessionId: string; matchId: string; courtId: string }) {
  return { message: "Match staged on court", ...payload };
}

async function handleMatchComplete(payload: {
  sessionId: string;
  matchId: string;
  winningTeam: number;
}) {
  return { message: "Match completed, players returned to queue", ...payload };
}

const handlers: Record<
  JobType,
  (payload: Record<string, unknown>) => Promise<Record<string, unknown>>
> = {
  "player.check_in": (p) => handlePlayerCheckIn(p as { sessionId: string; playerId: string }),
  "match.stage": (p) =>
    handleMatchStage(p as { sessionId: string; matchId: string; courtId: string }),
  "match.complete": (p) =>
    handleMatchComplete(p as { sessionId: string; matchId: string; winningTeam: number }),
};

export async function processNextJob() {
  const now = new Date().toISOString();

  const pending = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.status, "pending"), lte(jobs.scheduledAt, now)))
    .orderBy(asc(jobs.createdAt))
    .limit(1);

  const job = pending[0];
  if (!job) return null;

  await db
    .update(jobs)
    .set({ status: "processing", attempts: job.attempts + 1 })
    .where(eq(jobs.id, job.id));

  try {
    const payload = JSON.parse(job.payload) as Record<string, unknown>;
    const handler = handlers[job.type as JobType];
    if (!handler) throw new Error(`Unknown job type: ${job.type}`);

    const result = await handler(payload);

    await db
      .update(jobs)
      .set({
        status: "completed",
        result: JSON.stringify(result),
        processedAt: new Date().toISOString(),
      })
      .where(eq(jobs.id, job.id));

    return { ...job, status: "completed" as const, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const failed = job.attempts + 1 >= job.maxAttempts;

    await db
      .update(jobs)
      .set({
        status: failed ? "failed" : "pending",
        error: message,
        processedAt: new Date().toISOString(),
        scheduledAt: failed ? job.scheduledAt : new Date(Date.now() + 2000).toISOString(),
      })
      .where(eq(jobs.id, job.id));

    return { ...job, status: failed ? ("failed" as const) : ("pending" as const), error: message };
  }
}

export async function processAllPending(limit = 10) {
  const processed = [];
  for (let i = 0; i < limit; i++) {
    const result = await processNextJob();
    if (!result) break;
    processed.push(result);
  }
  return processed;
}
