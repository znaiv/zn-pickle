import { NextResponse } from "next/server";
import { processAllPending } from "@/lib/queue/process";

export async function POST() {
  const processed = await processAllPending(10);
  return NextResponse.json({ processed: processed.length, jobs: processed });
}
