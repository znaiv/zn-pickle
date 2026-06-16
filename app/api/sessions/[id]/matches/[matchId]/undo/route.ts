import { NextResponse } from "next/server";
import { undoMatchCompletion } from "@/lib/session/manager";

type RouteContext = { params: Promise<{ id: string; matchId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id, matchId } = await context.params;
  const result = await undoMatchCompletion(id, matchId);

  if ("error" in result) {
    const status = result.error === "Match not found" ? 404 : 409;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ ok: true, matchId: result.matchId });
}
