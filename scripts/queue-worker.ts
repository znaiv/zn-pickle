import { processNextJob } from "@/lib/queue/process";

const POLL_MS = 1500;

console.log("Pickle queue worker started (polling every %dms)", POLL_MS);

async function tick() {
  try {
    const job = await processNextJob();
    if (job) {
      console.log(
        "[%s] %s → %s",
        new Date().toISOString(),
        job.type,
        job.status
      );
    }
  } catch (error) {
    console.error("Worker error:", error);
  }
}

setInterval(tick, POLL_MS);
tick();
