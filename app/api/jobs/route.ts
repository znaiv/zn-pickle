import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { jobs } from "@/db/schema";

export async function GET() {
  const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt)).limit(50);
  return NextResponse.json(allJobs);
}
